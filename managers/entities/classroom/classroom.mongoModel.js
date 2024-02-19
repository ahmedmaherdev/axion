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
        ref: "User",
      },
    ],

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

classroomSchema.pre(/^find/, function (next) {
  this.find()
    .populate({
      path: "school",
      select: {
        name: 1,
      },
    })
    .populate({
      path: "students",
      select: {
        name: 1,
        photo: 1,
        student: 0,
      },
    });

  next();
});

module.exports = model("Classroom", classroomSchema);
