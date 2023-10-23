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
  }

  async getAllClassrooms({}) {
    // Creation Logic
    let classrooms = await this.mongomodels.classroom.find();

    // Response
    return {
      classrooms,
    };
  }

  async getClassroom({ _id }) {
    // Creation Logic
    let classroom = await this.mongomodels.classroom.findById(_id);

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

    if (!school) return new Error("School is not found");
    // Creation Logic
    let createdClassrooms = await this.mongomodels.classroom.create(classroom);

    // Response
    return {
      classrooms: createdClassrooms,
    };
  }

  async updateClassroom({ _id, name, school }) {
    const classroom = { name, school };

    // Data validation
    let result = await this.validators.classroom.updateClassroom(classroom);
    if (result) return result;

    // Creation Logic
    let updatedClassroom = await this.mongomodels.classroom.findOneAndUpdate(
      { _id },
      classroom,
      {
        new: true,
      }
    );

    // Response
    return {
      classroom: updatedClassroom,
    };
  }
  async deleteClassroom({ _id }) {
    await this.mongomodels.classroom.deleteOne({ _id });

    return {};
  }
};
