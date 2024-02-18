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

  async getAllUsers() {
    const cacheKey = "allUsers";
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { users: cacheData };
    }

    const users = await this.mongomodels.user.find();
    await this._setCacheData(cacheKey, users);

    return { users };
  }

  async getUser({ __query }) {
    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    const cacheKey = `user:${_id}`;
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { user: cacheData };
    }

    const user = await this.mongomodels.user.findById(_id);

    if (!user) {
      return this._notFoundResponse("User");
    }

    await this._setCacheData(cacheKey, user);
    return { user };
  }

  async getMe({ __longToken }) {
    const userId = __longToken.userId;
    const cacheKey = `user:${userId}`;
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { user: cacheData };
    }

    const user = await this.mongomodels.user.findById(userId);

    if (!user) {
      return this._notFoundResponse("User");
    }

    await this._setCacheData(cacheKey, user);
    return { user };
  }

  async updateMe({ username, name, email, __longToken }) {
    const user = { username, name, email };
    const userId = __longToken.userId;

    const result = await this.validators.user.updateUser(user);
    if (result) return result;

    const updatedUser = await this._updateUser(userId, user);
    await this._deleteCacheKeys(updatedUser);

    return { user: updatedUser };
  }

  async createUser({ role, username, name, email, password, passwordConfirm }) {
    const user = { role, username, name, email, password, passwordConfirm };

    const result = await this.validators.user.createUser(user);
    if (result) return result;

    const createdUser = await this.mongomodels.user.create(user);

    this._sanitizeUserResponse(createdUser);
    await this._deleteCacheKeys(createdUser);

    return { user: createdUser };
  }

  async updateUser({ __query, username, name, email }) {
    const user = { username, name, email };
    const _id = __query._id;

    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    const updatedUser = await this._updateUser(_id, user);
    await this._deleteCacheKeys(updatedUser);

    return { user: updatedUser };
  }

  async deleteUser({ __query }) {
    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    await this.mongomodels.user.deleteOne({ _id });
    await this._deleteCacheKeys({ _id });

    return { ok: true, code: 200 };
  }

  async _getCacheData(key) {
    const cacheData = await this.cache.key.get({ key });
    return cacheData ? JSON.parse(cacheData) : null;
  }

  async _setCacheData(key, data) {
    await this.cache.key.set({
      key,
      data: JSON.stringify(data),
      ttl: this.config.REDIS_EXPIRES_IN,
    });
  }

  async _deleteCacheKeys(user) {
    await Promise.all([
      this.cache.key.delete({ key: "allUsers" }),
      this.cache.key.delete({ key: `user:${user._id}` }),
    ]);
  }

  async _updateUser(userId, userData) {
    return await this.mongomodels.user.findOneAndUpdate(
      { _id: userId },
      userData,
      { new: true }
    );
  }

  async _isValidId(id) {
    return !!id;
  }

  _invalidInputResponse() {
    return {
      ok: false,
      code: 400,
      errors: "Invalid input data: provide user id as a query parameter.",
    };
  }

  _notFoundResponse(entity) {
    return {
      ok: false,
      code: 404,
      errors: `${entity} is not found.`,
    };
  }

  _sanitizeUserResponse(user) {
    user.password = undefined;
    user.__v = undefined;
  }
};
