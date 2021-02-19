/* eslint-disable no-use-before-define */
const { LoggerConfig } = require("../services/logger");

class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }

  toJSON() {
    return {
      error: {
        statusCode: this.statusCode,
        name: this.name,
        message: this.message,
        stacktrace: this.stack,
      },
    };
  }
}

const normalizeAndLogError = (moduleName, { id }, error) => {
  let throwable = error;

  switch (error.name) {
    case "UnexpectedError":
    case "PermissionError":
    case "MongoError":
      // catch duplicate key errors
      if (error.code === 11000) {
        throwable.statusCode = 422;
        throwable.message = "Not available or duplicated field";
        throwable.name = "NotAvailableError";
      }
      break;
    case "StrictModeError":
      throwable = new ValidationError(error.statusCode || 422, error.message);
      break;
    case "AuthenticationError":
      break;
    case "BadRequestError":
      break;
    case "NotFoundError":
      break;
    case "ValidationError":
      throwable = new ValidationError(error.statusCode || 422, error.message);
      break;
    case "AssertionError":
    case "AssertionError [ERR_ASSERTION]":
      throwable = new ValidationError(422, error.message);
      break;
    default:
      throwable = new UnexpectedError(500, error.message);
      break;
  }

  const logger = LoggerConfig.getChild(moduleName, id, throwable, throwable.statusCode);
  // internaly log the error
  logger.error(error);

  return throwable;
};

const handleError = (error, req, res, _next) => {
  const { name, message, statusCode } = error;
  const status = statusCode || 500;

  res.status(status).json({ name, status, message });
};

class ValidationError extends CustomError {
  constructor(statusCode, message) {
    super(statusCode, message);
    this.name = "ValidationError";
  }
}

class PermissionError extends CustomError {
  constructor(statusCode, message) {
    super(statusCode, message);
    this.name = "PermissionError";
  }
}

class AuthenticationError extends CustomError {
  constructor(statusCode, message) {
    super(statusCode, message);
    this.name = "AuthenticationError";
  }
}

class UnexpectedError extends CustomError {
  constructor(statusCode, message) {
    super(statusCode, message);
    this.name = "UnexpectedError";
  }
}

class BadRequestError extends CustomError {
  constructor(statusCode, message) {
    super(400, message);
    this.name = "BadRequestError";
  }
}

class NotFoundError extends CustomError {
  constructor(statusCode, message) {
    super(404, message);
    this.name = "NotFoundError";
  }
}

module.exports = {
  ValidationError,
  PermissionError,
  AuthenticationError,
  UnexpectedError,
  BadRequestError,
  NotFoundError,
  normalizeAndLogError,
  handleError,
};
