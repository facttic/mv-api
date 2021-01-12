const http = require("http");
const express = require("express");
const MvModels = require("mv-models");

const { RoutesConfig } = require("./config/routes.config");
const { CacheConfig } = require("./config/cache.config");
// const { SeaweedConfig } = require("./config/seaweed.config");

const PORT = process.env.API_PORT || 3333;
const HOST = process.env.API_HOST || "localhost";

const app = express();

MvModels.init("mongodb://localhost:27017/mv_dev");
RoutesConfig.init(app, express.Router());
CacheConfig.init();
// SeaweedConfig.init();

http.createServer(app).listen(PORT, HOST, () => {
  console.log(`Server listening at ${HOST}:${PORT}`);
});
