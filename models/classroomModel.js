const { Schema, model, Types } = require("mongoose");

const classroomSchema = new Schema(
  {
    name: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "School",
    },

    students: [
      {
        type: Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Classroom", classroomSchema);
