const validator = require("validator");

module.exports = {
  username: (data) => {
    if (data.trim().length < 3) {
      return false;
    }
    return true;
  },
  email: (data) => {
    return validator.isEmail(data);
  },
};
