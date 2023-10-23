module.exports = {
  createEnrollment: [
    {
      model: "student",
      required: true,
    },

    {
      model: "classroom",
      required: true,
    },
  ],
  // updateEnrollment: [
  //   {
  //     model: "classroom",
  //   },

  //   {
  //     model: "user",
  //   },
  // ],
};
