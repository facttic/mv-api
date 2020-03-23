/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const moment = require("moment");

const { TweetSchema } = require("./model");

TweetSchema.statics.createNew = async function createNew(tweet) {
  const _tweet = new TweetDAO(tweet);
  const newTweet = await _tweet.save();
  return newTweet;
}

TweetSchema.statics.insertMany = async function insertMany(tweets) {
  const options = {
    ordered: false
  }
  const newTweets = await this.model("Tweet").collection.insertMany(tweets, options);
  return newTweets;
}

TweetSchema.statics.getAll = async function getAll({
  skip,
  limit,
  sort,
  query
}) {
  const tweetsTotal = await this.model("Tweet").countDocuments({})

  const tweetsCount = await this.model("Tweet").countDocuments({ ...query })
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const tweets = await this.model("Tweet").find({ ...query })
    .skip(skip)
    .limit(limit)
    .sort(sort);
  return {
    count: tweetsCount,
    list: tweets,
    total: tweetsTotal
  };
};

TweetSchema.statics.removeByUserId = async function removeById(twitterUserId, userId) {
  const deleteResults = await TweetDAO.delete({ "user.id_str": twitterUserId }, userId);
  return deleteResults;
};

TweetSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true, overrideMethods: true, indexFields: ["deleted"] });

const TweetDAO = mongoose.model("Tweet", TweetSchema);

module.exports = { TweetDAO };
