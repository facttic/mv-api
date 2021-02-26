const assert = require("assert");
// const { Types } = require("mongoose");

/**
 * Ensures manifestationId is received via query params
 * And moves the value to params asi if the route would be have been
 * /manifestation/:manifestationId/resource
 */
const manifestationChild = async (req, _res, next) => {
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
    console.error(err);
    next(err);
  }
};

module.exports = { manifestationChild };
