const assert = require("assert");
const {
  normalizeAndLogError,
} = require("../../helpers/errors");

const fieldIsContainedInModelKeys = (keys, field) => {
  const normalizedField = field.replace(/^-/, "");
  return field === "_id" || keys.includes(normalizedField);
};

const validatePaginationQuery = (model, { perPage, page, sortBy }) => {
  if (page) {
    assert(
      Number.isSafeInteger(+page),
      `Page number value value must be numeric, but received: ${page}`,
    );
    assert(+page >= 0, `Page number value must be non-negative, but received: ${page}`);
  }
  if (perPage) {
    assert(
      Number.isSafeInteger(+perPage),
      `Items per page value must be numeric, but received: ${perPage}`,
    );
    assert(+perPage >= 0, `Items per page value must be non-negative, but received: ${perPage}`);
  }
  if (sortBy) {
    assert(
      fieldIsContainedInModelKeys(Object.keys(model.obj), sortBy),
      `Sort by field defined (${sortBy}) does not match a valid model property`,
    );
  }
};

const validateFieldsQuery = (model, fieldsQuery) => {
  const modelKeys = Object.keys(model.obj);
  Object.keys(fieldsQuery).forEach((key) => {
    assert(
      fieldIsContainedInModelKeys(modelKeys, key),
      `Filter for field defined (${key}) does not match a valid model property`,
    );
  });
  Object.entries(fieldsQuery).forEach((entry) => {
    assert(entry[1] !== "", `Filter for field defined (${entry[0]}) cannot be empty`);
  });
};

const castQueryToRegex = (query) => {
  const regexQuery = {};
  Object.entries(query).forEach((entry) => {
    regexQuery[entry[0]] = entry[1];
    // Error: Can't use $regex (revisar)
    // regexQuery[entry[0]] = { $regex: new RegExp(entry[1], "ig") };
  });
  return regexQuery;
};

const shapeQuery = (model) => async (req, res, next) => {
  try {
    const { query: reqQuery } = req;
    const { perPage, page, sortBy, ...query } = reqQuery;

    validatePaginationQuery(model, reqQuery);
    validateFieldsQuery(model, query);

    const limit = +perPage || 5;
    const currentPage = +page || 1;
    const skip = +limit * (+currentPage - 1) || 0;
    const sort = sortBy || "-_id";
    const regexQuery = castQueryToRegex(query);
    req.shapedQuery = {
      skip,
      limit,
      sort,
      query: regexQuery,
    };
    next();
  } catch (error) {
    const throwable = normalizeAndLogError("User", req, error);
    next(throwable);
  }
};

module.exports = { shapeQuery };
