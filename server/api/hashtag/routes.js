const { HashtagController } = require("./controller");
const { shapeQuery } = require("../middleware/shape-query");
const auth = require("../middleware/auth");

class HashtagRoutes {
  static init(router) {
    const hashtagController = new HashtagController();

    router
      .route("/manifestations/:manifestationId/hashtags")
      .get([shapeQuery, hashtagController.getAll])
      .post([auth, hashtagController.createNew]);

    router
      .route("/manifestations/:manifestationId/hashtags/:hashtagId")
      // .get(hashtagController.getOne)
      .put([auth, hashtagController.update])
      .delete([auth, hashtagController.delete]);
  }
}

module.exports = { HashtagRoutes };
