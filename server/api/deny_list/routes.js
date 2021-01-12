const { DenyListController } = require("./controller");
const { shapeQuery } = require("../middleware/shape-query");
const auth = require("../middleware/auth");

class DenyListRoutes {
  static init(router) {
    const denyListController = new DenyListController();

    router
      .route("/deny_lists")
      .get([shapeQuery, denyListController.getAll])
      .post([auth, denyListController.createNew]);

    router
      .route("/deny_lists/:denyListId")
      .get(denyListController.getOne)
      .put([auth, denyListController.update])
      .delete([auth, denyListController.delete]);
  }
}

module.exports = { DenyListRoutes };
