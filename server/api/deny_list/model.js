const mongoose = require("mongoose");

const DenyListSchema = mongoose.Schema(
  {
    user_id_str: { type: String, trim: true, required: true },
  },
  { collection: "deny_list" },
);

module.exports = {
  DenyListSchema,
};
