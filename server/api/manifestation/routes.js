const { ManifestationDAO } = require("mv-models");

const { ManifestationController } = require("./controller");
const { auth, shapeQuery, adminChecker, parseMultipart } = require("../middleware");

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
      .put([auth, parseMultipart, manifestationController.update])
      .delete([auth, adminChecker, manifestationController.delete]);

    router
      .route("/manifestations/getOne/byQuery")
      .get([shapeQuery(ManifestationDAO.schema), manifestationController.getByQuery]);
  }
}

module.exports = { ManifestationRoutes };
