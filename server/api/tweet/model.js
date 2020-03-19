const mongoose = require('mongoose');

const TweetSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    index: true,
  }
}, { collection: 'tweet' });

module.exports = {
  TweetSchema,
};
