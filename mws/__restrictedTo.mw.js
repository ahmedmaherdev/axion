module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    const routeMethod = req.method.toLowerCase();
    const routePath = req.originalUrl;
    if (req.user && managers.restrictedRoutes[routeMethod]) {
      const userRole = req.user.role;
      const routeRestricted = managers.restrictedRoutes[routeMethod].find(
        (obj) => obj.path === routePath
      );
      if (
        routeRestricted &&
        routeRestricted.restrictedTo &&
        !routeRestricted.restrictedTo.includes(userRole)
      )
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: "you don't have permission to request this route.",
        });
    }
    next();
  };
};
