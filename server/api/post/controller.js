const _ = require("lodash");
const assert = require("assert");

const { PostDAO } = require("mv-models");
const { CacheConfig } = require("../../common/cache");

const { normalizeAndLogError } = require("../../helpers/errors");

class PostController {
  /**
   * This method is not in use for now
   * Post creation is performed by CRON directly
   * through the DAOs
   */
  async createNew(req, res, next) {
    try {
      const post = req.body;
      assert(_.isObject(post), "Post is not a valid object.");

      const newPost = await PostDAO.createNew(post);
      res.status(201).json(newPost);
    } catch (error) {
      const throwable = normalizeAndLogError("Post", req, error);
      next(throwable);
    }
  }

  async getAll(req, res, next) {
    try {
      const cache = CacheConfig.get();
      const { shapedQuery } = req;
      const { manifestationId } = req.params;

      const key = `post_getAll_manifestationId_${manifestationId}_skip_${shapedQuery.skip}_limit_${shapedQuery.limit}`;
      const value = cache.get(key);

      if (value) {
        return res.status(200).json(value);
      }

      const posts = await PostDAO.getAllByManifestationId(manifestationId, shapedQuery);
      cache.set(key, posts);

      res.status(200).json(posts);
    } catch (error) {
      const throwable = normalizeAndLogError("Post", req, error);
      next(throwable);
    }
  }

  async delete(req, res, next) {
    try {
      const { manifestationId, postId } = req.params;

      const postDeleted = await PostDAO.removeByIdByManifestationId(
        manifestationId,
        postId,
        req.user._id,
      );

      const cache = CacheConfig.get();
      cache.flushAll();

      res.status(200).json(postDeleted);
    } catch (err) {
      const throwable = normalizeAndLogError("manifestationChild", req, err);
      next(throwable);
    }
  }
}

module.exports = { PostController };
