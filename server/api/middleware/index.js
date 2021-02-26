const { auth } = require("../middleware/auth");
const { shapeQuery } = require("../middleware/shape-query");
const { adminChecker } = require("../middleware/admin-checker");
const { parseMultipart } = require("../middleware/parse-multipart");

module.exports = {
  auth,
  shapeQuery,
  adminChecker,
  parseMultipart,
};
