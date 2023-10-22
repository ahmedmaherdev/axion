module.exports = {
  createClassroom: [
    {
      model: "name",
      required: true,
    },
    {
      model: "school",
      required: true,
    },
  ],
  updateClassroom: [
    {
      model: "name",
    },
    {
      model: "school",
    },
  ],
};
