const { TweetSchema } = require('./model');
const { TweetController } = require('./controller');
const { shapeQuery } = require("../../middleware/shape-query");

class TweetRoutes {
  static init(router) {
    const tweetController = new TweetController();

    router
      .route('/tweets')
      .get([shapeQuery(TweetSchema), tweetController.getAll]);
  }
}

module.exports = { TweetRoutes };
