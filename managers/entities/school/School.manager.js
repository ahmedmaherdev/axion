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
      "getAllSchools",
      "getSchool",
      "createSchool",
      "updateSchool",
      "deleteSchool",
    ];
    this.httpMethods = ["get", "get", "post", "patch", "delete"];
  }

  async getAllSchools({}) {
    // Creation Logic
    let schools = await this.mongomodels.school.find();

    // Response
    return {
      schools,
    };
  }

  async getSchool({ _id }) {
    // Creation Logic
    let school = await this.mongomodels.school.findById(_id);

    // Response
    return {
      school,
    };
  }

  async createSchool({ name }) {
    const school = { name };

    // Data validation
    let result = await this.validators.school.createSchool(school);
    if (result) return result;

    // Creation Logic
    let createdSchool = await this.mongomodels.school.create(school);

    // Response
    return {
      school: createdSchool,
    };
  }

  async updateSchool({ _id, name }) {
    const school = { name };

    // Data validation
    let result = await this.validators.school.updateSchool(school);
    if (result) return result;

    // Creation Logic
    let updatedSchool = await this.mongomodels.school.findOneAndUpdate(
      { _id },
      school,
      {
        new: true,
      }
    );

    // Response
    return {
      school: updatedSchool,
    };
  }
  async deleteSchool({ _id }) {
    await this.mongomodels.school.deleteOne({ _id });

    return {};
  }
};
