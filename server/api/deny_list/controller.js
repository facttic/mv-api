const _ = require("lodash");
const assert = require("assert");

const { DenyListDAO, PostDAO } = require("mv-models");
const { CacheConfig } = require("../../cache");

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
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const denyLists = await DenyListDAO.getAll();
      res.status(200).json(denyLists);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const denyList = await DenyListDAO.findById(req.params.denyListId);
      if (!denyList) {
        return res.status(404).send({
          message: "denyList not found with id " + req.params.denyListId,
        });
      }
      res.status(200).json(denyList);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).send({
          message: "DenyList content can not be empty",
        });
      }

      const denyList = await DenyListDAO.findByIdAndUpdate(
        req.params.denyListId,
        {
          name: req.body.name,
        },
        { new: true },
      );

      if (!denyList) {
        return res.status(404).send({
          message: "denyList not found with id " + req.params.denyListId,
        });
      }
      res.status(200).json(denyList);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const denyList = await DenyListDAO.findByIdAndRemove(req.params.denyListId);
      if (!denyList) {
        return res.status(404).send({
          message: "denyList not found with id " + req.params.denyListId,
        });
      }
      res.status(200).json(denyList);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { DenyListController };
