const { TweetSchema } = require('./model');
const { TwitterUsersController } = require('./controller');
const { shapeQuery } = require("../middleware/shape-query");
const auth = require('../middleware/auth')

class TwitterUsersRoutes {
  static init(router) {
    const twitterUsersController = new TwitterUsersController();

    router
      .route('/twitter_users')
      .get(twitterUsersController.getUsersCount);

  }
}

module.exports = { TwitterUsersRoutes };
