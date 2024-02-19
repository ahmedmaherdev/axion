const { Schema, model, Types } = require("mongoose");

const schoolSchema = new Schema(
  {
    name: {
      type: String,
    },

    location: {
      type: String,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = model("School", schoolSchema);
