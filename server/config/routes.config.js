const bodyParser = require('body-parser');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');
const zlib = require('zlib');
const cors = require('cors');

const MAX_CONTENT_LENGTH_ACCEPTED = 9999;

const { TweetRoutes } = require('../api/tweet/routes');
const { HashtagRoutes } = require('../api/hashtag/routes');
const { UserRoutes } = require('../api/user/routes');
const { BlacklistRoutes } = require('../api/blacklist/routes');
const { TwitterUsersRoutes } = require('../api/twitter_users/routes');
const { PostRoutes } = require('../api/post/routes');

class RoutesConfig {
  static init(app, router) {
    app.use(compression({
      level: zlib.Z_BEST_COMPRESSION,
      threshold: '2kb',
    }));
    app.options('*', cors());
    app.use(cors());
    app.use(express.static(`${process.cwd()}/node_modules/`));
    app.use(bodyParser.json());
    app.use(helmet());

    TweetRoutes.init(router);
    HashtagRoutes.init(router);
    UserRoutes.init(router);
    BlacklistRoutes.init(router);
    TwitterUsersRoutes.init(router);
    PostRoutes.init(router);

    app.use('/api', router);
  }
}

module.exports = { RoutesConfig };
