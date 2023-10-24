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
    this.cache = cache;
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

    await this.cache.key.delete({ key: "allUsers" });
    await this.cache.key.delete({ key: `user:${userData._id}` });

    await this.cache.key.delete({ key: "allClassrooms" });
    await this.cache.key.delete({ key: `classroom:${classroomData._id}` });
    // Response
    return {
      enrollment: createdEnrollment,
    };
  }

  async deleteEnrollment({ _id }) {
    const enrollment = await this.mongomodels.enrollment.findById(_id);

    if (!enrollment)
      return {
        ok: false,
        code: 404,
        errors: "Enrollment is not found",
      };

    const userData = await this.mongomodels.user.findById(enrollment.student);
    const classroomData = await this.mongomodels.classroom.findById(
      enrollment.classroom
    );

    userData.student.classrooms.pull(classroomData._id);
    classroomData.students.pull(userData._id);

    await userData.student.save();
    await classroomData.save();

    await this.mongomodels.enrollment.deleteOne({ _id });

    await this.cache.key.delete({ key: "allUsers" });
    await this.cache.key.delete({ key: `user:${userData._id}` });

    await this.cache.key.delete({ key: "allClassrooms" });
    await this.cache.key.delete({ key: `classroom:${classroomData._id}` });

    return {};
  }
};
