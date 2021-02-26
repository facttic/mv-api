const bunyan = require("bunyan");
const bunyanExpressSerializer = require("bunyan-express-serializer");
const bformat = require("bunyan-format");
const morgan = require("morgan");
const addRequestId = require("express-request-id")();

const formatOut = bformat({ outputMode: "long" });

let loggerInstance;

class LoggerConfig {
  static init(app) {
    const test = process.env.NODE_ENV === "test";
    app.use(addRequestId);

    const reqSerializer = (req) => {
      const data = JSON.parse(JSON.stringify(bunyanExpressSerializer(req)));
      if (data.headers["x-api-key"]) {
        data.headers["x-api-key"] = `${data.headers["x-api-key"].substring(0, 12)}(...)`;
      }
      if (data.headers.authorization) {
        data.headers.authorization = `${data.headers.authorization.substring(0, 19)}(...)`;
      }
      return data;
    };

    loggerInstance = bunyan.createLogger({
      name: "MV",
      stream: formatOut,
      serializers: {
        req: reqSerializer,
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err,
      },
      level: "info",
    });

    if (test) {
      loggerInstance.level(bunyan.FATAL + 1);
    }

    app.use((req, res, next) => {
      const log = loggerInstance.child(
        {
          id: req.id,
          body: req.body,
        },
        true,
      );
      log.info({ req });
      next();
    });

    app.use((req, res, next) => {
      const afterResponse = () => {
        res.removeListener("finish", afterResponse);
        res.removeListener("close", afterResponse);
        const log = loggerInstance.child(
          {
            id: req.id,
          },
          true,
        );
        log.info({ res }, "response");
      };
      res.on("finish", afterResponse);
      res.on("close", afterResponse);
      next();
    });

    morgan.token("id", (req) => req.id);

    const morganLoggerFormat = ':id [:date[web]] ":method :url" :status :response-time';

    app.use(
      morgan(morganLoggerFormat, {
        skip: (req, res) => test || res.statusCode < 400,
        stream: process.stderr,
      }),
    );

    app.use(
      morgan(morganLoggerFormat, {
        skip: (req, res) => test || res.statusCode >= 400,
        stream: process.stdout,
      }),
    );
  }

  static getChild(moduleName, id = null, body = null, statusCode = null) {
    const childConfig = { moduleName };
    if (id) {
      childConfig.id = id;
    }
    if (body) {
      childConfig.body = body;
    }
    if (statusCode) {
      childConfig.statusCode = statusCode;
    }
    const log = loggerInstance.child(childConfig, true);

    return log;
  }
}

module.exports = { LoggerConfig };
