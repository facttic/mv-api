const http = require('http');
const express = require('express');

const { DBConfig } = require('./config/db.conf');
const { RoutesConfig } = require('./config/routes.config');
const { SocketIoConfig } = require('./config/socket.io.config');
const { SchedulerConfig } = require('./config/scheduler.config');

const PORT = process.env.API_PORT || 3333;
const HOST = process.env.API_HOST || 'localhost';

const app = express();

DBConfig.init();
RoutesConfig.init(app, express.Router());
SchedulerConfig.init();

const httpServer = http.createServer(app).listen(PORT, HOST, () => {
  console.log(`Server listening at ${HOST}:${PORT}`);
  SocketIoConfig.init(httpServer);
});
