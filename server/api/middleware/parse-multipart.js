const formidable = require("formidable");
const pify = require("pify");

const { normalizeAndLogError } = require("../../helpers/errors");

const parseMultipart = async (req, _res, next) => {
  try {
    if (!req._body) {
      const form = formidable({ multiples: true });
      const asyncParse = pify(form.parse, { multiArgs: true }).bind(form);
      const [fields, files] = await asyncParse(req);
      req.body = fields;
      req.files = files;
    }
    next();
  } catch (err) {
    const throwable = normalizeAndLogError("parse-multipart", req, err);
    next(throwable);
  }
};

module.exports = { parseMultipart };
