const jwt = require("jsonwebtoken");
const config = require("config");
const { normalizeAndLogError, AuthenticationError } = require("../../helpers/errors");

const { UserDAO } = require("mv-models");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization") && req.header("Authorization").replace("Bearer ", "");
    const jwtKey = config.get("api.jwtKey");

    if (!token) {
      throw new AuthenticationError(401, "Not authorized to access this resource");
    }

    const data = jwt.verify(token, jwtKey);
    const user = await UserDAO.findOne({ _id: data._id, "tokens.token": token });
    if (!user) {
      throw new AuthenticationError(401, "Not authorized to access this resource");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    const throwable = normalizeAndLogError("auth", req, err);
    next(throwable);
  }
};

module.exports = auth;
