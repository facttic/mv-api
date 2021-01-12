const http = require("http");
const express = require("express");
const config = require("config");
const MvModels = require("mv-models");

const { RoutesConfig } = require("./routes");
const { CacheConfig } = require("./cache");
// const { SeaweedConfig } = require("./seaweed");

const apiPort = config.get("api.port") || 3333;
const apiHost = config.get("api.host") || "localhost";

const dbHost = config.get("db.host");
const dbPort = config.get("db.port");
const dbName = config.get("db.name");
const dbUsername = config.get("db.username");
const dbPassword = config.get("db.password");
const dbAuth = config.get("db.auth");

const dbUri = `mongodb://${
  dbUsername ? `${dbUsername}:${dbPassword}@` : ""
}${dbHost}:${dbPort}/${dbName}${dbAuth ? `?authSource=${dbAuth}` : ""}`;

const app = express();

RoutesConfig.init(app, express.Router());
CacheConfig.init();
// SeaweedConfig.init();

MvModels.init(dbUri)
  .then(() => {
    http.createServer(app).listen(apiPort, apiHost, () => {
      console.log(`Server listening at ${apiHost}:${apiPort}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
