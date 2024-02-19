module.exports = class Classroom {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.utils = utils;
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.classroomsCollection = "classrooms";
    this.httpExposed = [
      "get=getAllClassrooms",
      "get=getClassroom",
      "post=createClassroom",
      "patch=updateClassroom",
      "delete=deleteClassroom",
    ];
    this.cache = cache;
  }

  async getAllClassrooms({ __query }) {
    const { page, limit, sort, skip } = this.utils.splitQuery(__query);
    const cacheKey = `allClassrooms:${page}:${limit}:${JSON.stringify(sort)}`;
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { classrooms: cacheData };
    }

    const classrooms = await this.mongomodels.classroom
      .find()
      .skip(skip)
      .limit(limit)
      .sort(sort);

    await this._setCacheData(cacheKey, classrooms);

    return { classrooms };
  }

  async getClassroom({ __query }) {
    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    const cacheKey = `classroom:${_id}`;
    const cacheData = await this._getCacheData(cacheKey);

    if (cacheData) {
      return { classroom: cacheData };
    }

    const classroom = await this.mongomodels.classroom.findById(_id);

    if (!classroom) {
      return this._notFoundResponse("Classroom");
    }

    await this._setCacheData(cacheKey, classroom);
    return { classroom };
  }

  async createClassroom({ __longToken, name, school: schoolId }) {
    const classroom = { name, school: schoolId };

    const result = await this.validators.classroom.createClassroom(classroom);
    if (result) return result;

    const school = await this._getSchoolById(schoolId);

    if (!school) {
      return this._notFoundResponse("School");
    }

    classroom.createdBy = __longToken.userId;
    const createdClassroom = await this.mongomodels.classroom.create(classroom);
    await this._deleteCacheKey("allClassrooms");

    return { classrooms: createdClassroom };
  }

  async updateClassroom({ __query, name, school: schoolId }) {
    const classroom = { name, school: schoolId };
    const result = await this.validators.classroom.updateClassroom(classroom);

    if (result) return result;

    const school = schoolId ? await this._getSchoolById(schoolId) : null;

    if (!school) {
      return this._notFoundResponse("School");
    }

    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    const updatedClassroom = await this.mongomodels.classroom.findOneAndUpdate(
      { _id },
      classroom,
      { new: true }
    );

    if (!updatedClassroom) return this._notFoundResponse("Classroom");

    await Promise.all([
      this._deleteCacheKey("allClassrooms"),
      this._deleteCacheKey(`classroom:${_id}`),
    ]);

    return { classroom: updatedClassroom };
  }

  async deleteClassroom({ __query }) {
    const _id = __query._id;
    if (!this._isValidId(_id)) {
      return this._invalidInputResponse();
    }

    await this.mongomodels.classroom.deleteOne({ _id });

    await Promise.all([
      this._deleteCacheKey("allClassrooms"),
      this._deleteCacheKey(`classroom:${_id}`),
    ]);

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

  async _deleteCacheKey(key) {
    this.cache.key.delete({ key });
  }

  async _getSchoolById(schoolId) {
    return schoolId ? await this.mongomodels.school.findById(schoolId) : null;
  }

  _isValidId(id) {
    return !!id;
  }

  _invalidInputResponse() {
    return {
      ok: false,
      code: 400,
      errors: "Invalid input data: provide classroom id as a query parameter.",
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
