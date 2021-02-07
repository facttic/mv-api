const _ = require("lodash");
const assert = require("assert");

const { ManifestationDAO, UserDAO } = require("mv-models");
const { CacheConfig } = require("../../cache");

class ManifestationController {
  async create(req, res, next) {
    try {
      const manifestation = req.body;
      const userId = manifestation.user;
      delete manifestation.user;
      assert(_.isObject(manifestation), "Manifestation is not a valid object.");
      const user = await UserDAO.getById(userId);
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + userId,
        });
      }
      if (user.superadmin || user.manifestation_id) {
        return res.status(404).send({
          message: "User selected is not eligible for this manifestation, please select other",
        });
      }
      const newManifestation = await ManifestationDAO.createNew(manifestation);
      user.manifestation_id = newManifestation._id;
      await UserDAO.udpate(user._id, user);
      res.status(201).json(manifestation);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { query } = req;
      query.skip = parseInt(query.skip);
      query.limit = parseInt(query.limit);

      const manifestation = await ManifestationDAO.getAll(query);
      res.status(200).json({
        data: manifestation.list,
        total: manifestation.total,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const manifestationDeleted = await ManifestationDAO.delete(
        { _id: req.params.manifestationId },
        req.user._id,
      );
      if (!manifestationDeleted) {
        return res.status(404).send({
          message: "Manifestation not found with id " + req.params.manifestationId,
        });
      }
      const cache = CacheConfig.get();
      cache.flushAll();
      res.status(200).json(manifestationDeleted);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  async getOne(req, res, next) {
    try {
      console.log("get one");
      const manifestation = await ManifestationDAO.getById(req.params.manifestationId);
      if (!manifestation) {
        return res.status(404).send({
          message: "manifestation not found with id " + req.params.manifestationId,
        });
      }
      res.status(200).json(manifestation);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const manifestation = req.body;
      assert(_.isObject(manifestation), "Manifestation is not a valid object.");
      const updatedManifestation = await ManifestationDAO.udpate(manifestation.id, manifestation);
      const user = await UserDAO.getById(manifestation.user_id);
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + manifestation.user_id,
        });
      }
      user.manifestation_id = updatedManifestation._id;
      await UserDAO.udpate(user._id, user);
      res.status(201).json(updatedManifestation);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { ManifestationController };
