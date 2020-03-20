const mongoose = require('mongoose');

const TweetCrawlStatusSchema = mongoose.Schema({
  tweet_id_str: { type: String, trim: true, required: true, index: true },
  tweet_created_at: { type: String, trim: true, required: true },
}, { collection: 'tweet_crawl_status' });

module.exports = {
  TweetCrawlStatusSchema,
};
