const { HashtagSchema } = require('./model');
const { HashtagController } = require('./controller');
const auth = require('../middleware/auth')

class HashtagRoutes {
  static init(router) {
    const hashtagController = new HashtagController();

    router
      .route('/hashtags')
      .get(hashtagController.getAll);

    router
      .route('/hashtags/:hashtagId')
      .get(hashtagController.getOne);

    router
      .route('/hashtags')
      .post(auth, hashtagController.createNew);

    router
      .route('/hashtags/:hashtagId')
      .put(auth, hashtagController.update);

    router
      .route('/hashtags/:hashtagId')
      .delete(auth, hashtagController.delete);

  }
}

module.exports = { HashtagRoutes };
