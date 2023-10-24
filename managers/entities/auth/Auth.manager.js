module.exports = class Auth {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = "auth";
    this.httpExposed = ["login", "signup"];
    this.httpMethods = ["post", "post"];
  }

  async signup({ username, name, email, password, passwordConfirm, school }) {
    const user = { username, name, email, password, passwordConfirm, school };

    // Data validation
    let result = await this.validators.auth.signup(user);
    if (result) return result;

    // Creation Logic
    let createdUser = await this.mongomodels.user.create(user);

    let student = await this.mongomodels.student.create({
      student: createdUser._id,
      school,
    });

    createdUser.student = student._id;
    await createdUser.save();

    let longToken = this.tokenManager.genLongToken({
      userId: createdUser._id,
      userKey: {
        email: createdUser.email,
        role: createdUser.role,
      },
    });

    createdUser.password = undefined;
    createdUser.__v = undefined;
    // Response
    return {
      user: createdUser,
      longToken,
    };
  }

  async login({ email, password }) {
    // Data validation
    let result = await this.validators.auth.login({ email, password });
    if (result) return result;

    // Creation Logic
    let user = await this.mongomodels.user
      .findOne({ email })
      .select("+password +email");

    if (!user || !(await user.correctPassword(user.password, password)))
      return {
        ok: false,
        code: 400,
        errors: "Incorrect email or password.",
      };

    let longToken = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: {
        email: user.email,
        role: user.role,
      },
    });

    // Response
    return {
      user,
      longToken,
    };
  }
};
