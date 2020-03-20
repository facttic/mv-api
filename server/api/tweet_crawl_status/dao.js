/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const moment = require("moment");

const { TweetCrawlStatusSchema } = require("./model");

TweetCrawlStatusSchema.statics.createNew = async function createNew(tweetCrawlStatus) {
  const _tweetCrawlStatus = new TweetCrawlStatusDAO(tweetCrawlStatus);
  const newTweetCrawlStatus = await _tweetCrawlStatus.save();
  return newTweetCrawlStatus;
}

TweetCrawlStatusSchema.statics.getLast = async function getLast() {
  // tweet_id_str: -1 biggest on top
  const lastTweetCrawlStatus = await this.model("TweetCrawlStatus").findOne().sort({tweet_id_str: -1}).exec();
  
  return lastTweetCrawlStatus;
};

TweetCrawlStatusSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true, overrideMethods: true, indexFields: ["deleted"] });

const TweetCrawlStatusDAO = mongoose.model("TweetCrawlStatus", TweetCrawlStatusSchema);

module.exports = { TweetCrawlStatusDAO };
