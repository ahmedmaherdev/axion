module.exports = class Classrooms {
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
    this.ClassroomsExposed = ["createClassrooms"];
  }

  async findAllClassrooms({}) {
    // Creation Logic
    let classrooms = await this.mongomodels.classroom.find();

    // Response
    return {
      classrooms,
    };
  }

  async findClassrooms({ _id }) {
    // Creation Logic
    let classrooms = await this.mongomodels.classroom.findById(_id);

    // Response
    return {
      classrooms,
    };
  }

  async createClassroom({ name, school: schoolId }) {
    const classroom = { name, school };

    // Data validation
    let result = await this.validators.classroom.createClassroom(classroom);
    if (result) return result;

    const school = await this.mongomodels.school.findById(schoolId);

    if (!school) return;
    // Creation Logic
    let createdClassrooms = await this.mongomodels.classroom.create(classroom);

    // Response
    return {
      Classrooms: createdClassrooms,
    };
  }

  async updateClassroom({ _id, name, school }) {
    const classroom = { name, school };

    // Data validation
    let result = await this.validators.classroom.updateClassroom(classroom);
    if (result) return result;

    // Creation Logic
    let updatedClassroom = await this.mongomodels.classroom.update(
      _id,
      classroom
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
