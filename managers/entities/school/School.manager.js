module.exports = class School {
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
    this.schoolsCollection = "schools";
    this.httpExposed = [
      "get=getAllSchools",
      "get=getSchool",
      "post=createSchool",
      "patch=updateSchool",
      "delete=deleteSchool",
    ];
    this.cache = cache;
  }

  async getAllSchools() {
    const { page, limit, sort, skip } = this.utils.splitQuery(__query);
    const cacheKey = `allSchools:${page}:${limit}:${JSON.stringify(sort)}`;
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { schools: cacheData };
    }

    const schools = await this.mongomodels.school
      .find()
      .skip(skip)
      .limit(limit)
      .sort(sort);
    await this._setCacheData(cacheKey, schools);

    return { schools };
  }

  async getSchool({ __query }) {
    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    const cacheKey = `school:${_id}`;
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { school: cacheData };
    }

    const school = await this.mongomodels.school.findById(_id);

    if (!school) {
      return this._notFoundResponse("School");
    }

    await this._setCacheData(cacheKey, school);
    return { school };
  }

  async createSchool({ __longToken, name, location }) {
    const school = { name, location };

    const result = await this.validators.school.createSchool(school);
    if (result) return result;

    school.createdBy = __longToken.userId;
    const createdSchool = await this.mongomodels.school.create(school);

    await this._deleteCacheKeys(createdSchool);
    return { school: createdSchool };
  }

  async updateSchool({ __query, name, location }) {
    const school = { name, location };

    const result = await this.validators.school.updateSchool(school);
    if (result) return result;

    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    const updatedSchool = await this._updateSchool(_id, school);
    await this._deleteCacheKeys(updatedSchool);

    return { school: updatedSchool };
  }

  async deleteSchool({ __query }) {
    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    await this.mongomodels.school.deleteOne({ _id });
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

  async _deleteCacheKeys(school) {
    await Promise.all([
      this.cache.key.delete({ key: "allSchools" }),
      this.cache.key.delete({ key: `school:${school._id}` }),
    ]);
  }

  async _updateSchool(schoolId, schoolData) {
    return await this.mongomodels.school.findOneAndUpdate(
      { _id: schoolId },
      schoolData,
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
      errors: "Invalid input data: provide school id as a query parameter.",
    };
  }

  _notFoundResponse(entity) {
    return {
      ok: false,
      code: 404,
      errors: `${entity} is not found.`,
    };
  }
};
