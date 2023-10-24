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
      "getAllClassrooms",
      "getClassroom",
      "createClassroom",
      "updateClassroom",
      "deleteClassroom",
    ];
    this.httpMethods = ["get", "get", "post", "patch", "delete"];
    this.cache = cache;
    this.cacheExpired = 3600;
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
      ttl: this.cacheExpired,
    });
    // Response
    return {
      classrooms,
    };
  }

  async getClassroom({ _id }) {
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
      ttl: this.cacheExpired,
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

  async updateClassroom({ _id, name, school: schoolId }) {
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
  async deleteClassroom({ _id }) {
    await this.mongomodels.classroom.deleteOne({ _id });

    await this.cache.key.delete({ key: "allClassrooms" });
    await this.cache.key.delete({ key: `classroom:${_id}` });

    return {};
  }
};
