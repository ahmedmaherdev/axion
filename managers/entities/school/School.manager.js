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
    this.cache = cache;
    this.cacheExpired = 3600;
  }

  async getAllSchools({}) {
    // Creation Logic
    const cacheKey = "allSchools";
    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        schools: JSON.parse(cacheData),
      };

    let schools = await this.mongomodels.school.find();

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(schools),
      ttl: this.cacheExpired,
    });
    // Response
    return {
      schools,
    };
  }

  async getSchool({ _id }) {
    // Creation Logic
    const cacheKey = `school:${_id}`;

    const cacheData = await this.cache.key.get({ key: cacheKey });

    if (cacheData)
      return {
        school: JSON.parse(cacheData),
      };

    let school = await this.mongomodels.school.findById(_id);

    if (!school)
      return {
        ok: false,
        code: 404,
        errors: "School is not found.",
      };

    await this.cache.key.set({
      key: cacheKey,
      data: JSON.stringify(school),
      ttl: this.cacheExpired,
    });

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

    await this.cache.key.delete({ key: "allSchools" });
    await this.cache.key.delete({ key: `school:${createdSchool._id}` });
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

    await this.cache.key.delete({ key: "allSchools" });
    await this.cache.key.delete({ key: `school:${updatedSchool._id}` });
    // Response
    return {
      school: updatedSchool,
    };
  }
  async deleteSchool({ _id }) {
    await this.mongomodels.school.deleteOne({ _id });

    await this.cache.key.delete({ key: "allSchools" });
    await this.cache.key.delete({ key: `school:${_id}` });
    return {};
  }
};
