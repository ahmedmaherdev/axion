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
      "get=getAllSchools",
      "get=getSchool",
      "post=createSchool",
      "patch=updateSchool",
      "delete=deleteSchool",
    ];
    this.cache = cache;
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
      ttl: this.config.REDIS_EXPIRES_IN,
    });
    // Response
    return {
      schools,
    };
  }

  async getSchool({ __query }) {
    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors: "Invalid input data: provide school id as a query parameter.",
      };
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
      ttl: this.config.REDIS_EXPIRES_IN,
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

  async updateSchool({ __query, name }) {
    const school = { name };

    // Data validation
    let result = await this.validators.school.updateSchool(school);
    if (result) return result;

    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors: "Invalid input data: provide school id as a query parameter.",
      };

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
  async deleteSchool({ __query }) {
    const _id = __query._id;
    if (!_id)
      return {
        ok: false,
        code: 400,
        errors: "Invalid input data: provide school id as a query parameter.",
      };

    await this.mongomodels.school.deleteOne({ _id });

    await this.cache.key.delete({ key: "allSchools" });
    await this.cache.key.delete({ key: `school:${_id}` });
    return {};
  }
};
