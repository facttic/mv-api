/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const { PostSchema } = require("./model");

PostSchema.statics.createNew = async function createNew(post) {
  const _post = new PostDAO(post);
  const newPost = await _post.save();
  return newPost;
};

PostSchema.statics.insertMany = async function insertMany(posts) {
  const options = {
    ordered: false,
  };
  const newPosts = await this.model("Post").collection.insertMany(posts, options);
  return newPosts;
};

// Unused for now
// async function queryOembed(posts) {
//   const newSetOfPosts = await Promise.all(
//     posts.map(async (post) => {
//       const { source, post_id_str, user } = post;

//       if (source === "instagram") {
//         const cache = CacheConfig.get();
//         const key = `oembed_${post_id_str}`;
//         const value = cache.get(key);

//         if (value) {
//           console.log("returning from cache");
//           user.profile_image_url_https = value;
//           return post;
//         } else {
//           console.log(`No value for key ${key}`);
//         }

//         try {
//           const results = await axios.get(
//             `https://graph.facebook.com/v9.0/instagram_oembed?url=${user.profile_image_url_https}&fields=thumbnail_url&maxwidth=360`,
//             {
//               headers: {
//                 Authorization: `Bearer ${APP_ID}|${CLIENT_TOKEN}`,
//               },
//             }
//           );
//           user.profile_image_url_https = results.data.thumbnail_url;
//           cache.set(key, results.data.thumbnail_url);
//         } catch (err) {
//           console.log("oembed error", err);
//         }
//       }
//       return post;
//     })
//   );
//   return newSetOfPosts;
// }

PostSchema.statics.getAll = async function getAll({ skip, limit, sort, query }) {
  const postsTotal = await this.model("Post").countDocuments({});

  const postsCount = await this.model("Post")
    .countDocuments({ ...query })
    .skip(skip)
    .limit(limit);

  const posts = await this.model("Post")
    .find({ ...query })
    .skip(skip)
    .limit(limit)
    .sort(sort);

  return {
    count: postsCount,
    list: posts,
    total: postsTotal,
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

PostSchema.statics.findByIdStr = async function findByIdStr(postIdStr, source) {
  const found = await PostDAO.findOne({ post_id_str: postIdStr, source }).exec();
  return found;
};

PostSchema.statics.removeById = async function removeById(_id, userId = null) {
  const deleteResults = await PostDAO.delete({ _id }, userId);
  return deleteResults;
};

PostSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true,
  indexFields: ["deleted"],
});

const PostDAO = mongoose.model("Post", PostSchema);

module.exports = { PostDAO };
