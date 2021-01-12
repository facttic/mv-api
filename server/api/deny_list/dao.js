/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");

const { DenyListSchema } = require("./model");

DenyListSchema.statics.createNew = async function createNew(denyList) {
  const _denyList = new DenyListDAO(denyList);
  const newDenyList = await _denyList.save();
  return newDenyList;
};

DenyListSchema.statics.getAll = async function getAll() {
  const denyListsCount = await this.model("DenyList").countDocuments({ deleted: false });
  const denyLists = await this.model("DenyList").find({});

  return {
    count: denyListsCount,
    list: denyLists,
  };
};

DenyListSchema.statics.isDenyListed = async function isDenyListed(idStr) {
  const denyList = await DenyListDAO.findOne({ user_id_str: idStr });

  return denyList;
};

const DenyListDAO = mongoose.model("DenyList", DenyListSchema);

module.exports = { DenyListDAO };
