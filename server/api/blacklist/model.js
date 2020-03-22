const mongoose = require('mongoose');

const BlacklistSchema = mongoose.Schema({
  user_id_str: { type: String, trim: true, required: true }
}, { collection: 'blacklist' });

module.exports = {
  BlacklistSchema,
};
