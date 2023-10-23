module.exports = {
  createStudent: [
    {
      model: "username",
      required: true,
    },
    {
      model: "email",
      required: true,
    },
    {
      model: "name",
      required: true,
    },
    {
      model: "password",
      required: true,
    },
    {
      model: "passwordConfirm",
      required: true,
    },
    {
      model: "school",
      required: true,
    },
  ],
  createUser: [
    {
      model: "role",
      required: true,
    },
    {
      model: "username",
      required: true,
    },
    {
      model: "email",
      required: true,
    },
    {
      model: "name",
      required: true,
    },
    {
      model: "password",
      required: true,
    },
    {
      model: "passwordConfirm",
      required: true,
    },
  ],
  updateUser: [
    {
      model: "username",
    },
    {
      model: "email",
    },
    {
      model: "name",
    },
  ],
};
