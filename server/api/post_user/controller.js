const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { CacheConfig } = require("../../config/cache.config");
const { PostUserDAO } = require("./dao");

class PostUserController {
  async getUsersCount(req, res, next) {
    try {
      const cache = CacheConfig.get();
      const key = `post_users_count`;
      const value = cache.get(key);

      if (value) {
        return res.status(200).json(value);
      }

      const usersCount = await PostUserDAO.findOne();
      if (!usersCount) {
        return res.status(404).send({
          message: "users count not found",
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

module.exports = { PostUserController };
