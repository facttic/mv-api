/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");

const { BlacklistSchema } = require("./model");

BlacklistSchema.statics.createNew = async function createNew(blacklist) {
  const _blacklist = new BlacklistDAO(blacklist);
  const newBlacklist = await _blacklist.save();
  return newBlacklist;
}

BlacklistSchema.statics.getAll = async function getAll() {
  const blacklistsCount = await this.model("Blacklist").countDocuments({ deleted: false });
  const blacklists = await this.model("Blacklist").find({});

  return {
    count: blacklistsCount,
    list: blacklists
  };
};

BlacklistSchema.statics.isBlacklisted = async function isBlacklisted(id_str) {
  const blacklist = await BlacklistDAO.findOne({ user_id_str: id_str });

  return blacklist;
};

const BlacklistDAO = mongoose.model("Blacklist", BlacklistSchema);

module.exports = { BlacklistDAO };
