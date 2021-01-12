const mongoose = require("mongoose");

const PostUserSchema = mongoose.Schema(
  {
    count: { type: Number, required: true },
  },
  { collection: "post_user" },
);

module.exports = {
  PostUserSchema,
};
