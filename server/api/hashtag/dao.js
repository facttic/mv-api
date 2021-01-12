/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");

const { HashtagSchema } = require("./model");

HashtagSchema.statics.createNew = async function createNew(hashtag) {
  const _hashtag = new HashtagDAO(hashtag);
  const newHashtag = await _hashtag.save();
  return newHashtag;
};

HashtagSchema.statics.getAll = async function getAll() {
  const hashtagsCount = await this.model("Hashtag").countDocuments({ deleted: false });
  const hashtags = await this.model("Hashtag").find({});

  return {
    count: hashtagsCount,
    list: hashtags,
  };
};

HashtagSchema.statics.getBySource = async function getBySource(source) {
  const hashtagsCount = await HashtagDAO.countDocuments({ deleted: false, source });
  const hashtags = await HashtagDAO.find({ source });

  return {
    count: hashtagsCount,
    list: hashtags,
  };
};

const HashtagDAO = mongoose.model("Hashtag", HashtagSchema);

module.exports = { HashtagDAO };
