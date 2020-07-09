/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const moment = require("moment");

const { PostSchema } = require("./model");

PostSchema.statics.createNew = async function createNew(post) {
  const _post = new PostDAO(post);
  const newPost = await _post.save();
  return newPost;
}

PostSchema.statics.insertMany = async function insertMany(posts) {
  const options = {
    ordered: false
  }
  const newPosts = await this.model("Post").collection.insertMany(posts, options);
  return newPosts;
}

PostSchema.statics.getAll = async function getAll({
  skip,
  limit,
  sort,
  query
}) {
  const postsTotal = await this.model("Post").countDocuments({})

  const postsCount = await this.model("Post").countDocuments({ ...query })
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const posts = await this.model("Post").find({ ...query })
    .skip(skip)
    .limit(limit)
    .sort(sort);
  return {
    count: postsCount,
    list: posts,
    total: postsTotal
  };
};

PostSchema.statics.removeByUserId = async function removeById(twitterUserId, userId) {
  const deleteResults = await PostDAO.delete({ "user.id_str": twitterUserId }, userId);
  return deleteResults;
};

PostSchema.statics.countUsers = async function countUsers() {
  const count = await PostDAO.distinct("user.id_str").exec();
  return count.length;
};

PostSchema.statics.removeById = async function removeById(_id, userId = null) {
  const deleteResults = await PostDAO.delete({ _id }, userId);
  return deleteResults;
};

PostSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true, overrideMethods: true, indexFields: ["deleted"] });

const PostDAO = mongoose.model("Post", PostSchema);

module.exports = { PostDAO };
