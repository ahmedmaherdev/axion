module.exports = {
  createUser: [
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
