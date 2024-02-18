const restricted = {
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
      restrictedTo: ["admin", "superAdmin"],
    },
    {
      path: "/api/enrollment/createEnrollment",
      restrictedTo: ["admin", "superAdmin"],
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

const unAuthorized = {
  post: ["/api/auth/login", "/api/auth/signup"],
};

module.exports = { restricted, unAuthorized };
