/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const moment = require("moment");

const { PostCrawlStatusSchema } = require("./model");

PostCrawlStatusSchema.statics.createNew = async function createNew(postCrawlStatus) {
  const _postCrawlStatus = new PostCrawlStatusDAO(postCrawlStatus);
  const newPostCrawlStatus = await _postCrawlStatus.save();
  return newPostCrawlStatus;
}

PostCrawlStatusSchema.statics.getLast = async function getLast(source) {
  // post_id_str: -1 biggest on top
  const lastPostCrawlStatus = await PostCrawlStatusDAO.findOne({ source }).sort({_id: -1}).exec();
  return lastPostCrawlStatus;
};

PostCrawlStatusSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true, overrideMethods: true, indexFields: ["deleted"] });

const PostCrawlStatusDAO = mongoose.model("PostCrawlStatus", PostCrawlStatusSchema);

module.exports = { PostCrawlStatusDAO };
