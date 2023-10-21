const { Schema, model, Types } = require("mongoose");

const studentSchema = new Schema(
  {
    school: {
      type: Types.ObjectId(),
      ref: "School",
    },

    classrooms: {
      type: Types.ObjectId(),
      ref: "Classroom",
    },
  },
  { timestamps: true }
);

module.exports = model("Student", studentSchema);
