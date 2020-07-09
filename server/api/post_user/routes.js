const { PostUserController } = require('./controller');

class PostUserRoutes {
  static init(router) {
    const postUserController = new PostUserController();

    router
      .route('/post_users')
      .get(postUserController.getUsersCount);

  }
}

module.exports = { PostUserRoutes };
