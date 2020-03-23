const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { BlacklistDAO } = require("./dao");
const { TweetDAO } = require("../tweet/dao");

class BlacklistController {
  async createNew(req, res, next) {
    try {
      const blacklist = req.body;
      assert(_.isObject(blacklist), "Blacklist is not a valid object.");

      const newBlacklist = await BlacklistDAO.createNew(blacklist);
      const removeResults = await TweetDAO.removeByUserId(newBlacklist.user_id_str, req.user._id);

      res.status(201).json({
        inserted: newBlacklist,
        removedTweetsCount: removeResults.nModified
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const blacklists = await BlacklistDAO.getAll();
      res.status(200).json(blacklists);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const blacklist = await BlacklistDAO.findById(req.params.blacklistId);
      if (!blacklist) {
        return res.status(404).send({
          message: "blacklist not found with id " + req.params.blacklistId
        });
      }
      res.status(200).json(blacklist);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).send({
          message: "Blacklist content can not be empty"
        });
      }

      const blacklist = await BlacklistDAO.findByIdAndUpdate(
        req.params.blacklistId,
        {
          name: req.body.name
        },
        { new: true }
      );

      if (!blacklist) {
        return res.status(404).send({
          message: "blacklist not found with id " + req.params.blacklistId
        });
      }
      res.status(200).json(blacklist);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const blacklist = await BlacklistDAO.findByIdAndRemove(
        req.params.blacklistId
      );
      if (!blacklist) {
        return res.status(404).send({
          message: "blacklist not found with id " + req.params.blacklistId
        });
      }
      res.status(200).json(blacklist);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { BlacklistController };
