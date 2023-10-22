const { Schema, model, Types } = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: [true, "Please, provide your name."],
      minLength: [5, "Name must be more than 5 characters"],
      maxLength: [60, "Name must be less than 60 characters"],
      trim: true,
    },

    email: {
      type: String,
      require: [true, "Please, provide your email."],
      validate: [validator.isEmail, "Please, provide a valid email."],
      minLength: [10, "Email must be more than 5 characters"],
      maxLength: [60, "Email must be less than 60 characters"],
      trim: true,
      unique: true,
      select: false,
    },
    username: {
      type: String,
      require: [true, "Please, provide your username."],
      minLength: [5, "username must be more than 5 characters"],
      maxLength: [20, "username must be less than 20 characters"],
      trim: true,
      unique: true,
    },

    role: {
      type: String,
      trim: true,
      lower: true,
      enum: ["superAdmin", "admin", "student"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },

    photo: {
      type: String,
      default: "/img/users/default.jpg",
    },

    password: {
      type: String,
      minLength: [8, "Password must be more than 8 characters"],
      select: false,
    },

    passwordConfirm: {
      type: String,
      require: [true, "Please, confirm your password"],
      validate: {
        validator: function (passConfirm) {
          return this.password === passConfirm;
        },
        message: "Passwords are not the same.",
      },
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    student: {
      type: Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);

userSchema.index({
  name: "text",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({
    isActive: { $ne: false },
  }).populate({
    path: "student",
    select: {
      school: 1,
    },
  });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(userPassword, candidatePassword);
};

userSchema.methods.isPasswordChangedAfter = function (iat) {
  return this.passwordChangedAt
    ? parseInt(new Date(this.passwordChangedAt).getTime() / 1000, 10) > iat
    : false;
};

userSchema.methods.createPasswordResetToken = function (
  expiredTime = 10 * 60 * 1000 // 10 mins
) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + expiredTime);
  return resetToken;
};

module.exports = model("User", userSchema);
