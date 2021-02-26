const _ = require("lodash");
const assert = require("assert");

const { DenyListDAO, PostDAO } = require("mv-models");
const { CacheConfig } = require("../../common/cache");

const { normalizeAndLogError, NotFoundError, BadRequestError } = require("../../helpers/errors");

class DenyListController {
  async createNew(req, res, next) {
    try {
      const denyList = req.body;
      assert(_.isObject(denyList), "DenyList is not a valid object.");

      const newDenyList = await DenyListDAO.createNew(denyList);
      const removeResults = await PostDAO.removeByUserId(newDenyList.user_id_str, req.user._id);

      const cache = CacheConfig.get();
      cache.flushAll();

      res.status(201).json({
        inserted: newDenyList,
        removedPostsCount: removeResults.nModified,
      });
    } catch (error) {
      const throwable = normalizeAndLogError("DenyList", req, error);
      next(throwable);
    }
  }

  async getAll(req, res, next) {
    try {
      const { manifestationId } = req.params;

      const denyLists = await DenyListDAO.getAllByManifestationId(manifestationId);

      res.status(200).json(denyLists);
    } catch (error) {
      const throwable = normalizeAndLogError("DenyList", req, error);
      next(throwable);
    }
  }

  async getOne(req, res, next) {
    try {
      const denyList = await DenyListDAO.findById(req.params.denyListId);

      if (!denyList) {
        throw new NotFoundError(404, "DenyList not found with id " + req.params.denyListId);
      }

      res.status(200).json(denyList);
    } catch (error) {
      const throwable = normalizeAndLogError("DenyList", req, error);
      next(throwable);
    }
  }

  async update(req, res, next) {
    try {
      if (!req.body.name) {
        throw new BadRequestError(400, "DenyList content can not be empty");
      }

      const denyList = await DenyListDAO.findByIdAndUpdate(
        req.params.denyListId,
        {
          name: req.body.name,
        },
        { new: true },
      );

      if (!denyList) {
        throw new NotFoundError(404, "DenyList not found with id " + req.params.denyListId);
      }

      res.status(200).json(denyList);
    } catch (error) {
      const throwable = normalizeAndLogError("DenyList", req, error);
      next(throwable);
    }
  }

  async delete(req, res, next) {
    try {
      const denyList = await DenyListDAO.findByIdAndRemove(req.params.denyListId);
      if (!denyList) {
        throw new NotFoundError(404, "DenyList not found with id " + req.params.denyListId);
      }
      res.status(200).json(denyList);
    } catch (error) {
      const throwable = normalizeAndLogError("DenyList", req, error);
      next(throwable);
    }
  }
}

module.exports = { DenyListController };
