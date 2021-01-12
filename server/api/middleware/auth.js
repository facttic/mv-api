const jwt = require("jsonwebtoken");
const config = require("config");

const { UserDAO } = require("mv-models");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const jwtKey = config.get("api.jwtKey");

    const data = jwt.verify(token, jwtKey);
    const user = await UserDAO.findOne({ _id: data._id, "tokens.token": token });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Not authorized to access this resource" });
  }
};
module.exports = auth;
