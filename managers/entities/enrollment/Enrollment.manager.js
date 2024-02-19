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
    this.httpExposed = ["post=createEnrollment", "delete=deleteEnrollment"];
    this.cache = cache;
  }

  async createEnrollment({ __longToken, student, classroom }) {
    const enrollment = { student, classroom };

    const result = await this.validators.enrollment.createEnrollment(
      enrollment
    );
    if (result) return result;

    const userData = await this._getUserById(student);
    const classroomData = await this._getClassroomById(classroom);

    if (!userData) {
      return this._notFoundResponse("Student");
    }

    if (!classroomData) {
      return this._notFoundResponse("Classroom");
    }

    enrollment.createdBy = __longToken.userId;

    const createdEnrollment = await this.mongomodels.enrollment.create(
      enrollment
    );

    await this._updateUserClassrooms(userData, classroom);
    await this._updateClassroomStudents(classroomData, student);
    await this._deleteCacheKeys(userData, classroomData);

    return { enrollment: createdEnrollment };
  }

  async deleteEnrollment({ __query }) {
    const _id = __query._id;

    const enrollment = await this.mongomodels.enrollment.findById(_id);

    if (!enrollment) {
      return this._notFoundResponse("Enrollment");
    }

    const userData = await this._getUserById(enrollment.student);
    const classroomData = await this._getClassroomById(enrollment.classroom);

    this._removeUserFromClassrooms(userData, classroomData);
    this._removeClassroomFromStudents(classroomData, userData);

    await this.mongomodels.enrollment.deleteOne({ _id });
    await this._deleteCacheKeys(userData, classroomData);

    return { ok: true, code: 200 };
  }

  async _getUserById(userId) {
    return userId ? await this.mongomodels.user.findById(userId) : null;
  }

  async _getClassroomById(classroomId) {
    return classroomId
      ? await this.mongomodels.classroom.findById(classroomId)
      : null;
  }

  async _updateUserClassrooms(userData, classroomId) {
    userData.student.classrooms.push(classroomId);
    await userData.student.save();
  }

  async _updateClassroomStudents(classroomData, userId) {
    classroomData.students.push(userId);
    await classroomData.save();
  }

  _removeUserFromClassrooms(userData, classroomData) {
    userData.student.classrooms.pull(classroomData._id);
    userData.student.save();
  }

  _removeClassroomFromStudents(classroomData, userData) {
    classroomData.students.pull(userData._id);
    classroomData.save();
  }

  async _deleteCacheKeys(userData, classroomData) {
    await Promise.all([
      this.cache.key.delete({ key: "allUsers" }),
      this.cache.key.delete({ key: `user:${userData._id}` }),
      this.cache.key.delete({ key: "allClassrooms" }),
      this.cache.key.delete({ key: `classroom:${classroomData._id}` }),
    ]);
  }

  _notFoundResponse(entity) {
    return {
      ok: false,
      code: 404,
      errors: `${entity} is not found.`,
    };
  }
};
