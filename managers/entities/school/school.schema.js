module.exports = {
  createSchool: [
    {
      model: "name",
      required: true,
    },

    {
      model: "school",
      required: true,
    },
  ],
  updateSchool: [
    {
      model: "name",
    },
    {
      model: "school",
    },
  ],
};
