const { normalizeAndLogError, AuthenticationError } = require("../../helpers/errors");

const adminChecker = async (req, res, next) => {
  try {
    if (!req.user.superadmin) {
      throw new AuthenticationError(401, "Not authorized to access this resource");
    }
    next();
  } catch (err) {
    const throwable = normalizeAndLogError("admin-checker", req, err);
    next(throwable);
  }
};

module.exports = { adminChecker };
