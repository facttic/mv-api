const http = require("http");
const express = require("express");
const config = require("config");
const MvModels = require("mv-models");

const { RoutesConfig } = require("./routes");
const { CacheConfig } = require("./services/cache");
const S3Config = require("./services/s3");
const dbHelper = require("./helpers/db");

const apiPort = config.get("api.port") || 3333;
const apiHost = config.get("api.host") || "localhost";
const dbUri = dbHelper.getDbUri(config);

const app = express();

(async () => {
  try {
    RoutesConfig.init(app, express.Router());
    CacheConfig.init();
    S3Config.init("seaweed");

    await MvModels.init(dbUri);
    await http.createServer(app).listen(apiPort, apiHost);
    console.log(`Server listening at ${apiHost}:${apiPort}`);
  } catch (err) {
    console.error(err);
  }
})();
