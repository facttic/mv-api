/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const TweetSchema = mongoose.Schema({
  id_str: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  full_text: {
    type: String,
    trim: true,
    required: true,
  },
  hastags: [{
    type: String,
    trim: true,
    required: true,
  }]
  // name: {
  //   type: String,
  //   trim: true,
  //   required: true,
  //   index: true,
  // }
}, { collection: 'tweet' });

module.exports = {
  TweetSchema,
};
