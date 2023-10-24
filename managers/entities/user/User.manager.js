module.exports = class User {
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
    this.usersCollection = "users";
    this.httpExposed = [
      "getAllUsers",
      "getUser",
      "createStudent",
      "createUser",
      "updateUser",
      "deleteUser",
    ];
    this.httpMethods = ["get", "get", "post", "post", "patch", "delete"];
  }

  async getAllUsers({}) {
    // Creation Logic
    let users = await this.mongomodels.user.find();

    // Response
    return {
      users,
    };
  }

  async getUser({ _id }) {
    // Creation Logic
    let user = await this.mongomodels.user.findById(_id);

    // Response
    return {
      user,
    };
  }

  async createUser({ role, username, name, email, password, passwordConfirm }) {
    const user = {
      role,
      username,
      name,
      email,
      password,
      passwordConfirm,
    };

    // Data validation
    let result = await this.validators.user.createUser(user);
    if (result) return result;

    // Creation Logic
    let createdUser = await this.mongomodels.user.create(user);

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

  async createStudent({
    username,
    name,
    email,
    password,
    passwordConfirm,
    school,
  }) {
    const user = { username, name, email, password, passwordConfirm, school };

    // Data validation
    let result = await this.validators.user.createStudent(user);
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

  async updateUser({ _id, username, name, email }) {
    const user = { username, name, email };

    // Data validation
    let result = await this.validators.user.updateUser(user);
    if (result) return result;

    // Creation Logic
    let updateUser = await this.mongomodels.user.findOneAndUpdate(
      { _id },
      user,
      {
        new: true,
      }
    );

    // Response
    return {
      user: updateUser,
    };
  }
  async deleteUser({ _id }) {
    await this.mongomodels.user.deleteOne({ _id });

    return {};
  }
};
