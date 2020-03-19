const bodyParser = require('body-parser');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');
const zlib = require('zlib');
const cors = require('cors');

const MAX_CONTENT_LENGTH_ACCEPTED = 9999;

const { Routes } = require('../api/routes');

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

    // Routes.init(router);

    app.use('/api', router);
  }
}

module.exports = { RoutesConfig };
