const hasPermission = (req, config) => {
  const routeMethod = req.method.toLowerCase();
  const routePath = req.originalUrl;
  if (config.routes.restricted[routeMethod]) {
    const obj = config.routes.restricted[routeMethod].find(
      (obj) => obj.path === routePath
    );

    return obj && obj.restrictedTo.includes(req.user.role);
  }
  return true;
};

module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    if (req.isAuthorized || hasPermission(req, config)) return next();

    return managers.responseDispatcher.dispatch(res, {
      ok: false,
      code: 403,
      errors: "you don't have permission to request this route.",
    });
  };
};
