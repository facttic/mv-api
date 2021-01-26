const _ = require("lodash");
const assert = require("assert");

const { ManifestationDAO } = require("mv-models");
const { CacheConfig } = require("../../cache");

class ManifestationController {
  async create(req, res, next) {
    try {
      const manifestation = req.body;
      assert(_.isObject(manifestation), "Manifestation is not a valid object.");

      const newManifestation = await ManifestationDAO.createNew(manifestation);
      res.status(201).json(newManifestation);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const cache = CacheConfig.get();
      const { shapedQuery } = req;

      const key = `manifestation_getAll_skip_${shapedQuery.skip}_limit_${shapedQuery.limit}`;
      const value = cache.get(key);

      if (value) {
        return res.status(200).json(value);
      }

      const manifestation = await ManifestationDAO.getAll(shapedQuery);
      cache.set(key, manifestation);
      res.status(200).json(manifestation);
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

      const updatedManifestation = await ManifestationDAO.udpate(manifestation);
      res.status(201).json(updatedManifestation);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { ManifestationController };
