const { Schema, model, Types } = require("mongoose");

const enrollmentSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: "User",
    },

    classroom: {
      type: Types.ObjectId,
      ref: "Classroom",
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, classroom: 1 }, { unique: true });

module.exports = model("Enrollment", enrollmentSchema);
