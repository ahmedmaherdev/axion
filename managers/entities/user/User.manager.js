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
    this.userExposed = ["createUser"];
  }

  async findAllUser({ _id }) {
    // Creation Logic
    let users = await this.mongomodels.user.find();

    // Response
    return {
      users,
    };
  }

  async findUser({ _id }) {
    // Creation Logic
    let user = await this.mongomodels.user.findById(_id);

    // Response
    return {
      user,
    };
  }

  async createUser({ username, name, email, password, passwordConfirm }) {
    const user = { username, name, email, password, passwordConfirm };

    // Data validation
    let result = await this.validators.user.createUser(user);
    if (result) return result;

    // Creation Logic
    let createdUser = await this.mongomodels.user.create(user);

    let longToken = this.tokenManager.genLongToken({
      userId: createdUser._id,
      userKey: createdUser.key,
    });

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
    let updateUser = await this.mongomodels.user.update(_id, user);

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
