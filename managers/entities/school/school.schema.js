module.exports = {
  createSchool: [
    {
      model: "name",
      required: true,
    },

    {
      model: "location",
      required: true,
    },
  ],
  updateSchool: [
    {
      model: "name",
    },

    {
      model: "location",
    },
  ],
};
