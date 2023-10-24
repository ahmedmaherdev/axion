module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    const routePath = req.originalUrl;
    const routeMethod = req.method.toLowerCase();
    const isAuthorized =
      managers.unAuthorizedRoutes[routeMethod] &&
      managers.unAuthorizedRoutes[routeMethod].some(
        (route) => route === routePath
      );

    req.isAuthorized = isAuthorized;
    next();
  };
};
