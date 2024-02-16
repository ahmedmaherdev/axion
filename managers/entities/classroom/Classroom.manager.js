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

  async getAllClassrooms({}) {
    // Creation Logic
    const cacheKey = `allClassrooms`;

    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        classrooms: JSON.parse(cacheData),
      };

    let classrooms = await this.mongomodels.classroom.find();

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(classrooms),
      ttl: this.config.REDIS_EXPIRES_IN,
    });
    // Response
    return {
      classrooms,
    };
  }

  async getClassroom({ __query }) {
    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors:
          "Invalid input data: provide classroom id as a query parameter.",
      };

    // Creation Logic
    const cacheKey = `classroom:${_id}`;

    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        classroom: JSON.parse(cacheData),
      };

    let classroom = await this.mongomodels.classroom.findById(_id);

    if (!classroom)
      return {
        ok: false,
        code: 404,
        errors: "Classroom is not found.",
      };

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(classroom),
      ttl: this.config.REDIS_EXPIRES_IN,
    });
    // Response
    return {
      classroom,
    };
  }

  async createClassroom({ name, school: schoolId }) {
    const classroom = { name, school: schoolId };

    // Data validation
    let result = await this.validators.classroom.createClassroom(classroom);
    if (result) return result;

    const school = await this.mongomodels.school.findById(schoolId);

    if (!school)
      return {
        ok: false,
        code: 404,
        errors: "School is not found",
      };
    // Creation Logic
    let createdClassroom = await this.mongomodels.classroom.create(classroom);

    await this.cache.key.delete({ key: "allClassrooms" });
    await this.cache.key.delete({ key: `classroom:${createdClassroom._id}` });
    // Response
    return {
      classrooms: createdClassroom,
    };
  }

  async updateClassroom({ __query, name, school: schoolId }) {
    const classroom = { name, school: schoolId };

    // Data validation
    let result = await this.validators.classroom.updateClassroom(classroom);
    if (result) return result;

    let school = schoolId;
    if (school) {
      school = await this.mongomodels.school.findById(schoolId);
      if (!school)
        return {
          ok: false,
          code: 404,
          errors: "School is not found",
        };
    }

    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors:
          "Invalid input data: provide classroom id as a query parameter.",
      };

    // Creation Logic
    let updatedClassroom = await this.mongomodels.classroom.findOneAndUpdate(
      { _id },
      classroom,
      {
        new: true,
      }
    );

    await this.cache.key.delete({ key: "allClassrooms" });
    await this.cache.key.delete({ key: `classroom:${updatedClassroom._id}` });
    // Response
    return {
      classroom: updatedClassroom,
    };
  }
  async deleteClassroom({ __query }) {
    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors:
          "Invalid input data: provide classroom id as a query parameter.",
      };

    await this.mongomodels.classroom.deleteOne({ _id });

    await this.cache.key.delete({ key: "allClassrooms" });
    await this.cache.key.delete({ key: `classroom:${_id}` });

    return {};
  }
};
