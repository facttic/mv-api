const mongoose = require('mongoose');

const TweetSchema = mongoose.Schema({
  tweet_created_at: { type: String, trim: true, required: true, index: true },
  tweet_id_str: { type: String, trim: true, required: true, index: true },
  full_text: { type: String, trim: true },
  hastags: {
    type: [{ type: String, trim: true, }],
    required: true,
  },
  media: {
    type: [{
      media_url: { type: String, trim: true },
      media_url_https: { type: String, trim: true },
    }],
    required: true,
  },
  user: {
    name: { type: String, trim: true, required: true },
    screen_name: { type: String, trim: true, required: true },
    location: { type: String, trim: true },
    profile_image_url: { type: String, trim: true },
    profile_image_url_https: { type: String, trim: true },
  },
  geo: { },
  coordinates: { },
}, { collection: 'tweet' });

module.exports = {
  TweetSchema,
};
