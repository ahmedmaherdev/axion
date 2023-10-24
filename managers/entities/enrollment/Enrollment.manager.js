module.exports = class Enrollment {
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
    this.enrollmentsCollection = "enrollments";
    this.httpExposed = ["createEnrollment", "deleteEnrollment"];
    this.httpMethods = ["post", "delete"];
  }

  async createEnrollment({ student, classroom }) {
    const enrollment = { student, classroom };

    // Data validation
    let result = await this.validators.enrollment.createEnrollment(enrollment);
    if (result) return result;

    const userData = await this.mongomodels.user.findById(student);
    const classroomData = await this.mongomodels.classroom.findById(classroom);

    if (!userData)
      return {
        ok: false,
        code: 404,
        errors: `Student is not found`,
      };

    if (!classroomData)
      return {
        ok: false,
        code: 404,
        errors: `Classroom is not found`,
      };
    // Creation Logic

    let createdEnrollment = await this.mongomodels.enrollment.create(
      enrollment
    );

    userData.student.classrooms.push(classroom);
    classroomData.students.push(student);

    await userData.student.save();
    await classroomData.save();

    // Response
    return {
      enrollment: createdEnrollment,
    };
  }

  async deleteEnrollment({ _id }) {
    await this.mongomodels.enrollment.deleteOne({ _id });

    return {};
  }
};
