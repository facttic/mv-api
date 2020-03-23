const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { CacheConfig } = require("../../config/cache.config");
const { TwitterUsersDAO } = require("./dao");

class TwitterUsersController {

  async getUsersCount(req, res, next) {
    try {
      const cache = CacheConfig.get();
      const key = `twitter_users_count`;
      const value = cache.get(key);

      if (value) {
        return res.status(200).json(value);
      }

      const usersCount = await TwitterUsersDAO.findOne();
      if (!usersCount) {
        return res.status(404).send({
          message: "twitter users count not found"
        });
      }
      cache.set(key, usersCount);
      res.status(200).json(usersCount);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { TwitterUsersController };
