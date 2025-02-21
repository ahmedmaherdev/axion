module.exports = {
  signup: [
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
  login: [
    {
      model: "email",
      required: true,
    },

    {
      model: "password",
      required: true,
    },
  ],
  updatePassword: [
    {
      model: "password",
      required: true,
    },
    {
      model: "newPassword",
      required: true,
    },
    {
      model: "newPasswordConfirm",
      required: true,
    },
  ],
};
