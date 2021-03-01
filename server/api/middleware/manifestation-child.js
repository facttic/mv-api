const assert = require("assert");
const { normalizeAndLogError } = require("../../helpers/errors");
// const { Types } = require("mongoose");

/**
 * Ensures manifestationId is received via query params
 * And moves the value to params asi if the route would be have been
 * /manifestation/:manifestationId/resource
 */
const manifestationChild = async (req, res, next) => {
  try {
    const { manifestationId } = req.query;

    //  && Types.ObjectId.isValid(manifestationId),
    assert(
      manifestationId,
      `Field manifestationId must exist in query params and be valid, but received: ${manifestationId}`,
    );

    req.params.manifestationId = manifestationId;
    delete req.query.manifestationId;

    next();
  } catch (err) {
    const throwable = normalizeAndLogError("manifestationChild", req, err);
    next(throwable);
  }
};

module.exports = { manifestationChild };
