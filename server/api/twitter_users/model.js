const mongoose = require('mongoose');

const TwitterUsersSchema = mongoose.Schema({
  count: { type: Number, required: true}
}, { collection: 'twitter_users' });

module.exports = {
  TwitterUsersSchema,
};
