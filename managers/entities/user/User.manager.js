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
      "get=getAllUsers",
      "get=getUser",
      "get=getMe",
      "post=createUser",
      "patch=updateUser",
      "patch=updateMe",
      "delete=deleteUser",
    ];
    this.cache = cache;
  }

  async getAllUsers({}) {
    // Creation Logic

    const cacheKey = "allUsers";
    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        users: JSON.parse(cacheData),
      };
    let users = await this.mongomodels.user.find();

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(users),
      ttl: this.config.REDIS_EXPIRES_IN,
    });
    // Response
    return {
      users,
    };
  }

  async getUser({ __query }) {
    // Creation Logic
    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors: "Invalid input data: provide user id as a query parameter.",
      };

    const cacheKey = `user:${_id}`;
    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        user: JSON.parse(cacheData),
      };

    let user = await this.mongomodels.user.findById(_id);

    if (!user)
      return {
        ok: false,
        code: 404,
        errors: "User is not found.",
      };

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(user),
      ttl: this.config.REDIS_EXPIRES_IN,
    });
    // Response
    return {
      user,
    };
  }

  async getMe({ __longToken }) {
    // Creation Logic

    const userId = __longToken.userId;
    const cacheKey = `user:${userId}`;
    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        user: JSON.parse(cacheData),
      };

    let user = await this.mongomodels.user.findById(userId);

    if (!user)
      return {
        ok: false,
        code: 404,
        errors: "User is not found.",
      };

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(user),
      ttl: this.config.REDIS_EXPIRES_IN,
    });
    // Response
    return {
      user,
    };
  }

  async updateMe({ username, name, email, __longToken }) {
    const user = { username, name, email };
    const userId = __longToken.userId;
    // Data validation
    let result = await this.validators.user.updateUser(user);
    if (result) return result;

    // Creation Logic
    let updateUser = await this.mongomodels.user.findOneAndUpdate(
      { _id: userId },
      user,
      {
        new: true,
      }
    );

    await this.cache.key.delete({ key: "allUsers" });
    await this.cache.key.delete({ key: `user:${updateUser._id}` });

    // Response
    return {
      user: updateUser,
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

    createdUser.password = undefined;
    createdUser.__v = undefined;

    await this.cache.key.delete({ key: "allUsers" });
    await this.cache.key.delete({ key: `user:${createdUser._id}` });
    // Response
    return {
      user: createdUser,
    };
  }

  async updateUser({ __query, username, name, email }) {
    const user = { username, name, email };

    // Data validation
    let result = await this.validators.user.updateUser(user);
    if (result) return result;

    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors: "Invalid input data: provide user id as a query parameter.",
      };

    // Creation Logic
    let updateUser = await this.mongomodels.user.fi({ _id }, user, {
      new: true,
    });

    await this.cache.key.delete({ key: "allUsers" });
    await this.cache.key.delete({ key: `user:${updateUser._id}` });

    // Response
    return {
      user: updateUser,
    };
  }
  async deleteUser({ __query }) {
    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors: "Invalid input data: provide user id as a query parameter.",
      };

    await this.mongomodels.user.deleteOne({ _id });

    await this.cache.key.delete({ key: "allUsers" });
    await this.cache.key.delete({ key: `user:${_id}` });

    return {};
  }
};
