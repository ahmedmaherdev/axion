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

classroomSchema.pre(/^find/, function (next) {
  this.populate({
    path: "school",
    select: {
      name: 1,
    },
  }).populate({
    path: "students",
    select: {
      name: 1,
      photo: 1,
    },
  });
});

module.exports = model("Classroom", classroomSchema);
