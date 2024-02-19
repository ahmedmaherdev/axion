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
    this.httpExposed = ["post=login", "post=signup", "patch=updatePassword"];
    this.cache = cache;
  }

  async signup({ username, name, email, password, passwordConfirm, school }) {
    const user = { username, name, email, password, passwordConfirm, school };

    // Data validation
    let result = await this.validators.auth.signup(user);
    if (result) return result;

    // Creation Logic
    let createdUser = await this.mongomodels.user.create(user);

    let student = await this.mongomodels.student.create({
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

    await this.cache.key.delete({ key: "allUsers" });
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

    user.password = undefined;
    user.__v = undefined;
    // Response
    return {
      user,
      longToken,
    };
  }

  async updatePassword({
    password,
    newPassword,
    newPasswordConfirm,
    __longToken,
  }) {
    // Data validation
    let result = await this.validators.auth.updatePassword({
      password,
      newPassword,
      newPasswordConfirm,
    });
    if (result) return result;
    const userId = __longToken.userId;
    const user = await this.mongomodels.user
      .findById(userId)
      .select("+password +email");
    const isPasswordCorrect = await user.correctPassword(
      user.password,
      password
    );

    if (!isPasswordCorrect)
      return {
        ok: false,
        code: 400,
        errors: "The old password is incorrect.",
      };

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    let longToken = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: {
        email: user.email,
        role: user.role,
      },
    });
    user.password = undefined;
    user.__v = undefined;
    return {
      user,
      longToken,
    };
  }
};
