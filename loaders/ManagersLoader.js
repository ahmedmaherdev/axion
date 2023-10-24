const MiddlewaresLoader = require("./MiddlewaresLoader");
const ApiHandler = require("../managers/api/Api.manager");
const LiveDB = require("../managers/live_db/LiveDb.manager");
const UserServer = require("../managers/http/UserServer.manager");
const ResponseDispatcher = require("../managers/response_dispatcher/ResponseDispatcher.manager");
const VirtualStack = require("../managers/virtual_stack/VirtualStack.manager");
const ValidatorsLoader = require("./ValidatorsLoader");
const ResourceMeshLoader = require("./ResourceMeshLoader");
const utils = require("../libs/utils");

const systemArch = require("../static_arch/main.system");
const TokenManager = require("../managers/token/Token.manager");
const SharkFin = require("../managers/shark_fin/SharkFin.manager");
const TimeMachine = require("../managers/time_machine/TimeMachine.manager");
const MongoLoader = require("./MongoLoader");
const User = require("../managers/entities/user/User.manager");
const School = require("../managers/entities/school/School.manager");
const Classroom = require("../managers/entities/classroom/Classroom.manager");
const Enrollment = require("../managers/entities/enrollment/Enrollment.manager");
const Auth = require("../managers/entities/auth/Auth.manager");

/**
 * load sharable modules
 * @return modules tree with iSnstance of each module
 */
module.exports = class ManagersLoader {
  constructor({ config, cortex, cache, oyster, aeon }) {
    this.managers = {};
    this.config = config;
    this.cache = cache;
    this.cortex = cortex;
    this.managers.unAuthorizedRoutes = {
      post: ["/api/auth/login", "/api/auth/signup"],
    };

    this.managers.restrictedRoutes = {
      get: [],
      post: [
        {
          path: "/api/school/createSchool",
          restrictedTo: ["superAdmin"],
        },
        {
          path: "/api/user/createUser",
          restrictedTo: ["superAdmin"],
        },
        {
          path: "/api/classroom/createClassroom",
          restrictedTo: ["admin"],
        },
        {
          path: "/api/enrollment/createEnrollment",
          restrictedTo: ["admin"],
        },
      ],
      patch: [
        {
          path: "/api/user/updateUser",
          restrictedTo: ["superAdmin"],
        },
        {
          path: "/api/school/updateSchool",
          restrictedTo: ["superAdmin"],
        },
        {
          path: "/api/classroom/updateClassroom",
          restrictedTo: ["admin"],
        },
      ],
      delete: [
        {
          path: "/api/user/deleteUser",
          restrictedTo: ["superAdmin"],
        },
        {
          path: "/api/school/deleteSchool",
          restrictedTo: ["superAdmin"],
        },
        {
          path: "/api/classroom/deleteClassroom",
          restrictedTo: ["admin"],
        },
        {
          path: "/api/enrollment/deleteEnrollment",
          restrictedTo: ["admin"],
        },
      ],
    };

    this._preload();
    this.injectable = {
      utils,
      cache,
      config,
      cortex,
      oyster,
      aeon,
      managers: this.managers,
      validators: this.validators,
      mongomodels: this.mongomodels,
      resourceNodes: this.resourceNodes,
    };
  }

  _preload() {
    const validatorsLoader = new ValidatorsLoader({
      models: require("../managers/_common/schema.models"),
      customValidators: require("../managers/_common/schema.validators"),
    });
    const resourceMeshLoader = new ResourceMeshLoader({});
    const mongoLoader = new MongoLoader({ schemaExtension: "mongoModel.js" });

    this.validators = validatorsLoader.load();
    this.resourceNodes = resourceMeshLoader.load();
    this.mongomodels = mongoLoader.load();
  }

  load() {
    this.managers.responseDispatcher = new ResponseDispatcher();
    this.managers.liveDb = new LiveDB(this.injectable);
    const middlewaresLoader = new MiddlewaresLoader(this.injectable);
    const mwsRepo = middlewaresLoader.load();
    const { layers, actions } = systemArch;
    this.injectable.mwsRepo = mwsRepo;
    /*****************************************CUSTOM MANAGERS*****************************************/
    this.managers.shark = new SharkFin({ ...this.injectable, layers, actions });
    this.managers.timeMachine = new TimeMachine(this.injectable);
    this.managers.token = new TokenManager(this.injectable);
    /*************************************************************************************************/
    this.managers.mwsExec = new VirtualStack({
      ...{
        preStack: [
          "__unAuthorized",
          "__longToken",
          "__restrictedTo",
          "__device",
        ],
      },
      ...this.injectable,
    });

    // Custom managers
    this.managers.auth = new Auth({
      utils,
      cache: this.cache,
      config: this.config,
      cortex: this.cortex,
      managers: this.managers,
      validators: this.validators,
      mongomodels: this.mongomodels,
    });
    this.managers.user = new User({
      utils,
      cache: this.cache,
      config: this.config,
      cortex: this.cortex,
      managers: this.managers,
      validators: this.validators,
      mongomodels: this.mongomodels,
    });

    this.managers.school = new School({
      utils,
      cache: this.cache,
      config: this.config,
      cortex: this.cortex,
      managers: this.managers,
      validators: this.validators,
      mongomodels: this.mongomodels,
    });

    this.managers.classroom = new Classroom({
      utils,
      cache: this.cache,
      config: this.config,
      cortex: this.cortex,
      managers: this.managers,
      validators: this.validators,
      mongomodels: this.mongomodels,
    });

    this.managers.enrollment = new Enrollment({
      utils,
      cache: this.cache,
      config: this.config,
      cortex: this.cortex,
      managers: this.managers,
      validators: this.validators,
      mongomodels: this.mongomodels,
    });

    this.managers.userApi = new ApiHandler({
      ...this.injectable,
      ...{ prop: "httpExposed" },
    });
    this.managers.userServer = new UserServer({
      config: this.config,
      managers: this.managers,
    });

    return this.managers;
  }
};
