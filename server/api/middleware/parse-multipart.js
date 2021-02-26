const { isEmpty } = require("lodash");
const formidable = require("formidable");
const pify = require("pify");

const parseMultipart = async (req, res, next) => {
  try {
    if (!req._body) {
      const form = formidable({ multiples: true });
      const asyncParse = await pify(form.parse, { multiArgs: true }).bind(form);
      const [fields, files] = await asyncParse(req);
      delete fields.id;
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
