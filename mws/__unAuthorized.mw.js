module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    const routePath = req.originalUrl;
    const routeMethod = req.method.toLowerCase();
    const isAuthorized =
      config.routes.unAuthorized[routeMethod] &&
      config.routes.unAuthorized[routeMethod].some(
        (route) => route === routePath
      );

    req.isAuthorized = isAuthorized;
    next();
  };
};
