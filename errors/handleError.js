const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return {
    code: 400,
    errors: message,
  };
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${JSON.stringify(
    err.keyValue
  )}. Please use another value`;
  return {
    code: 400,
    errors: message,
  };
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return {
    code: 400,
    errors: message,
  };
};

const handleJWTError = () => {
  return {
    code: 401,
    errors: "Invalid token! Please log in again.",
  };
};

const handleJWTExpiredError = () => {
  return {
    code: 401,
    errors: "Invalid token! Please log in again.",
  };
};

module.exports = (err) => {
  let error;
  if (err.kind === "ObjectId") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.message.toLocaleLowerCase().includes("validation failed"))
    error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  return error;
};
