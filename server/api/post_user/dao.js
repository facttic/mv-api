/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");

const { PostUserSchema } = require("./model");
const { PostDAO } = require("../post/dao");

PostUserSchema.statics.saveCount = async function saveCount() {
  await this.model("PostUser").remove();
  const count = await PostDAO.countUsers();
  const _postUser = new PostUserDAO({ count });
  const newPostUser = await _postUser.save();
  return newPostUser;
};

const PostUserDAO = mongoose.model("PostUser", PostUserSchema);

module.exports = { PostUserDAO };
