/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const moment = require("moment");

const { TwitterUsersSchema } = require("./model");
const { TweetDAO } = require("../tweet/dao");

TwitterUsersSchema.statics.saveCount = async function saveCount() {
  const removed = await this.model("TwitterUsers").remove();
  const count = await TweetDAO.countUsers();
  const _twitterUsers = new TwitterUsersDAO({count});
  const new_twitterUsers = await _twitterUsers.save();
  return new_twitterUsers;
}

const TwitterUsersDAO = mongoose.model("TwitterUsers", TwitterUsersSchema);

module.exports = { TwitterUsersDAO };
