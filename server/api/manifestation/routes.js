const { ManifestationController } = require("./controller");
const auth = require("../middleware/auth");

class ManifestationRoutes {
  static init(router) {
    const manifestationController = new ManifestationController();

    router.route("/manifestations").get(manifestationController.getAll);
    router.route("/manifestations/:manifestationId").get(manifestationController.getOne);
    router.route("/manifestations").post(auth, manifestationController.create);
    router.route("/manifestations/:manifestationId").put(auth, manifestationController.update);
    router.route("/manifestations/:manifestationId").delete(auth, manifestationController.delete);
  }
}

module.exports = { ManifestationRoutes };
