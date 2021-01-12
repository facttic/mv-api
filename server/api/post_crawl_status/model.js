const mongoose = require("mongoose");

const PostCrawlStatusSchema = mongoose.Schema(
  {
    post_id_str: { type: String, trim: true, required: true, index: true },
    post_created_at: { type: String, trim: true, required: true },
    hashtag: { type: String, trim: true },
    source: { type: String, trim: true, required: true },
  },
  { collection: "post_crawl_status" },
);

module.exports = {
  PostCrawlStatusSchema,
};
