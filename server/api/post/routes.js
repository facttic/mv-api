const { PostDAO } = require("mv-models");
const { PostController } = require("./controller");
const { shapeQuery } = require("../middleware/shape-query");
const auth = require("../middleware/auth");

class PostRoutes {
  static init(router) {
    const postController = new PostController();

    router.route("/posts").get([shapeQuery(PostDAO.schema), postController.getAll]);
    router.route("/posts/:postId").delete([auth, postController.delete]);
  }
}

module.exports = { PostRoutes };
