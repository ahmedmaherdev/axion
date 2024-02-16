const findRestricted = (config, method, path) => {
  if (config.routes.restricted[method]) {
    return config.routes.restricted[method].find((obj) => obj.path === path);
  }
  return null;
};

const hasPermission = (userRole, restrictedObj) => {
  return restrictedObj && restrictedObj.restrictedTo.includes(userRole);
};

module.exports = ({ config, managers }) => {
  return ({ req, res, next }) => {
    const { method, originalUrl, user } = req;
    const routeMethod = method.toLowerCase();
    const routePath = originalUrl;

    const restrictedObj = findRestricted(config, routeMethod, routePath);

    if (
      // if route don't need an autherization
      req.isAuthorized ||
      // if route not has restricted roles
      !restrictedObj ||
      // if route has restricted roles
      hasPermission(user.role, restrictedObj)
    ) {
      return next();
    }

    return managers.responseDispatcher.dispatch(res, {
      ok: false,
      code: 403,
      errors: "You don't have permission to access this route.",
    });
  };
};
