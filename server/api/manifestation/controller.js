const _ = require("lodash");
const assert = require("assert");
const Stream = require("stream");

const { UserDAO } = require("mv-models");
const { normalizeAndLogError, NotFoundError, PermissionError } = require("../../helpers/errors");
const manifestationService = require("./service");

class ManifestationController {
  async create(req, res, next) {
    try {
      console.log("create");
      const manifestation = req.body;
      const userId = manifestation.user;
      const users = [];
      delete manifestation.user;
      assert(_.isObject(manifestation), "Manifestation is not a valid object.");
      for (const i in userId) {
        const user = await UserDAO.getById(userId[i]);
        if (!user) {
          throw new NotFoundError(404, `User not found with id ${userId}`);
        }
        if (user.superadmin) {
          throw new NotFoundError(
            404,
            `User ${user.name} is not eligible for this manifestation, please select other`,
          );
        }
        users.push(user);
      }
      const newManifestation = await ManifestationDAO.createNew(manifestation);
      for (const i in users) {
        const user = users[i];
        user.manifestation_id = newManifestation._id;
        await UserDAO.udpate(user._id, user);
      }
      res.status(201).json(newManifestation);
    } catch (error) {
      const throwable = normalizeAndLogError("Manifestation", req, error);
      next(throwable);
    }
  }

  async getAll(req, res, next) {
    try {
      const { shapedQuery } = req;
      const manifestation = await ManifestationDAO.getAll(shapedQuery);
      res.status(200).json({
        data: manifestation.list,
        total: manifestation.total,
      });
    } catch (error) {
      const throwable = normalizeAndLogError("Manifestation", req, error);
      next(throwable);
    }
  }

  async delete(req, res, next) {
    try {
      const manifestationDeleted = await ManifestationDAO.delete(
        { _id: req.params.manifestationId },
        req.user._id,
      );
      if (!manifestationDeleted) {
        throw new NotFoundError(
          404,
          `Manifestation not found with id ${req.params.manifestationId}`,
        );
      }
      res.status(200).json(manifestationDeleted);
    } catch (err) {
      const throwable = normalizeAndLogError("Manifestation", req, err);
      next(throwable);
    }
  }

  async getOne(req, res, next) {
    try {
      const manifestation = await ManifestationDAO.getById(req.params.manifestationId);
      if (!manifestation) {
        throw new NotFoundError(
          404,
          `Manifestation not found with id ${req.params.manifestationId}`,
        );
      }
      res.status(200).json(manifestation);
    } catch (error) {
      const throwable = normalizeAndLogError("Manifestation", req, error);
      next(throwable);
    }
  }

  async update(req, res, next) {
    try {
      _.isEmpty(req.body)
        ? await manifestationService.resolveAsForm(req, res)
        : await manifestationService.resolveAsJson(req, res);
    } catch (error) {
      const throwable = normalizeAndLogError("Manifestation", req, error);
      next(throwable);
    }
  }
}

module.exports = { ManifestationController };
