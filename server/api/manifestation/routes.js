const { ManifestationController } = require("./controller");
const auth = require("../middleware/auth");
const { shapeQuery } = require("../middleware/shape-query");
const { adminChecker } = require("../middleware/admin-checker");
const { ManifestationDAO } = require("mv-models");

class ManifestationRoutes {
  static init(router) {
    const manifestationController = new ManifestationController();

    router
      .route("/manifestations")
      .get([shapeQuery(ManifestationDAO.schema), manifestationController.getAll])
      .post([auth, adminChecker, manifestationController.create]);

    router
      .route("/manifestations/:manifestationId")
      .get(manifestationController.getOne)
      .put([auth, manifestationController.update])
      .delete([auth, adminChecker, manifestationController.delete]);
  }
}

module.exports = { ManifestationRoutes };
