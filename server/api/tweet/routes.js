const { TweetSchema } = require('./model');
const { TweetController } = require('./controller');

class TweetRoutes {
  static init(router) {
    const tweetController = new TweetController();

    router
      .route('/tweets')
      .get(tweetController.getAll);
  }
}

module.exports = { TweetRoutes };
