const { BlacklistSchema } = require("./model");
const { BlacklistController } = require("./controller");
const { shapeQuery } = require("../middleware/shape-query");
const auth = require("../middleware/auth");

class BlacklistRoutes {
  static init(router) {
    const blacklistController = new BlacklistController();

    router
      .route("/blacklists")
      .get([shapeQuery, blacklistController.getAll]);
      .post([auth, blacklistController.createNew]);

    router
      .route("/blacklists/:blacklistId")
      .get(blacklistController.getOne);
      .put([auth, blacklistController.update]);
      .delete([auth, blacklistController.delete]);
  }
}

module.exports = { BlacklistRoutes };
