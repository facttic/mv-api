const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { TweetDAO } = require("./dao");
const { CacheConfig } = require("../../config/cache.config");

class TweetController {
  async createNew(req, res, next) {
    try {
      const tweet = req.body;
      assert(_.isObject(tweet), "Tweet is not a valid object.");

      const newTweet = await TweetDAO.createNew(tweet);
      res.status(201).json(newTweet);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const cache = CacheConfig.get();
      const { shapedQuery } = req;

      const key = `tweets_getAll_skip_${shapedQuery.skip}_limit_${shapedQuery.limit}`;
      const value = cache.get(key);

      if (value) {
        return res.status(200).json(value);
      }

      const tweets = await TweetDAO.getAll(shapedQuery);
      cache.set(key, tweets);
      res.status(200).json(tweets);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const tweetDeleted = await TweetDAO.delete({ _id: req.params.tweetId }, req.user._id);
      if (!tweetDeleted) {
        return res.status(404).send({
          message: "Tweet not found with id " + req.params.hashtagId
        });
      }
      const cache = CacheConfig.get();
      cache.flushAll();
      res.status(200).json(tweetDeleted);
    } catch (err) {
      console.error(er);
      next(err);
    }
  }
}

module.exports = { TweetController };
