const bodyParser = require("body-parser");
const helmet = require("helmet");
const express = require("express");
const compression = require("compression");
const zlib = require("zlib");
const cors = require("cors");
const path = require("path");

const { HashtagRoutes } = require("./api/hashtag/routes");
const { UserRoutes } = require("./api/user/routes");
const { DenyListRoutes } = require("./api/deny_list/routes");
const { PostRoutes } = require("./api/post/routes");
const { ManifestationRoutes } = require("./api/manifestation/routes");

const { handleError } = require("./helpers/errors");

class RoutesConfig {
  static init(app, router) {
    const dir = path.join(__dirname, "public");

    app.use(
      compression({
        level: zlib.Z_BEST_COMPRESSION,
        threshold: "2kb",
      }),
    );
    app.options("*", cors());
    app.use(cors());
    app.use(express.static(`${process.cwd()}/node_modules/`));
    app.use(bodyParser.json());
    app.use(helmet());

    HashtagRoutes.init(router);
    UserRoutes.init(router);
    DenyListRoutes.init(router);
    PostRoutes.init(router);
    ManifestationRoutes.init(router);

    app.use("/api", router);
    app.use("/pubresources", express.static(dir));

    app.use(handleError);
  }
}

module.exports = { RoutesConfig };
