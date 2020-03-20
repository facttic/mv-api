const mongoose = require('mongoose');

const TweetCrawlStatusSchema = mongoose.Schema({
  
}, { collection: 'tweet_crawl_status' });

module.exports = {
  TweetCrawlStatusSchema,
};
