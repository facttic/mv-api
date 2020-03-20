const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { TweetDAO } = require("./dao");

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

      const tweets = await TweetDAO.getAll(shapedQuery);
      res.status(200).json(tweets);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { TweetController };
