const _ = require("lodash");
const assert = require("assert");

const { PostDAO } = require("./dao");
const { CacheConfig } = require("../../config/cache.config");

class PostController {
  async createNew(req, res, next) {
    try {
      const post = req.body;
      assert(_.isObject(post), "Post is not a valid object.");

      const newPost = await PostDAO.createNew(post);
      res.status(201).json(newPost);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const cache = CacheConfig.get();
      const { shapedQuery } = req;

      const key = `post_getAll_skip_${shapedQuery.skip}_limit_${shapedQuery.limit}`;
      const value = cache.get(key);

      if (value) {
        return res.status(200).json(value);
      }

      const post = await PostDAO.getAll(shapedQuery);
      cache.set(key, post);
      res.status(200).json(post);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const postDeleted = await PostDAO.delete({ _id: req.params.postId }, req.user._id);
      if (!postDeleted) {
        return res.status(404).send({
          message: "Post not found with id " + req.params.postId,
        });
      }
      const cache = CacheConfig.get();
      cache.flushAll();
      res.status(200).json(postDeleted);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
}

module.exports = { PostController };
