const { PostUserController } = require('./controller');

class PostUserRoutes {
  static init(router) {
    const PostUserController = new PostUserController();

    router
      .route('/post_users')
      .get(PostUserController.getUsersCount);

  }
}

module.exports = { PostUserRoutes };
