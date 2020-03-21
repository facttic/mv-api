const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { TweetDAO } = require("./dao");

// node-cache
const NodeCache = require("node-cache");
const stdTTL = process.env.CACHE_TTL;
const checkperiod = process.env.checkperiod;
const cache = new NodeCache({ stdTTL, checkperiod, useClones: false });

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
      
      const { shapedQuery } = req;
      const key = `tweets_getAll_skip_${shapedQuery.skip}_limit_${shapedQuery.limit}`;
      const value = cache.get(key);
      
      // check if there are cached tweets
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
}

module.exports = { TweetController };
