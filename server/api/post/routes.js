const { PostDAO } = require("mv-models");
const { PostController } = require("./controller");
const { shapeQuery } = require("../middleware/shape-query");
const { manifestationChild } = require("../middleware/manifestation-child");
const auth = require("../middleware/auth");

class PostRoutes {
  static init(router) {
    const postController = new PostController();

    router
      .route("/posts")
      .get([manifestationChild, shapeQuery(PostDAO.schema), postController.getAll]);

    router.route("/posts/:postId").delete([auth, manifestationChild, postController.delete]);
  }
}

module.exports = { PostRoutes };
