const { TweetSchema } = require('./model');
const { TweetController } = require('./controller');
const { shapeQuery } = require("../middleware/shape-query");
const auth = require('../middleware/auth')

class TweetRoutes {
  static init(router) {
    const tweetController = new TweetController();

    router
      .route('/tweets')
      .get([shapeQuery(TweetSchema), tweetController.getAll]);

    router
      .route('/tweets/:tweetId')
      .delete([auth, tweetController.delete]);
  }
}

module.exports = { TweetRoutes };
