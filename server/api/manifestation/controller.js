const _ = require("lodash");
const assert = require("assert");

const { UserDAO, ManifestationDAO } = require("mv-models");
const { normalizeAndLogError, NotFoundError } = require("../../helpers/errors");
const manifestationService = require("./service");

class ManifestationController {
  async create(req, res, next) {
    try {
      const manifestation = req.body;
      const userIds = manifestation.userIds;
      const users = await UserDAO.getManyByIds(userIds);
      delete manifestation.userIds;
      assert(_.isObject(manifestation), "Manifestation is not a valid object.");
      manifestationService.validateUsersId(userIds, users);
      const newManifestation = await ManifestationDAO.createNew(manifestation);
      await UserDAO.udpateToMany(userIds, { manifestation_id: newManifestation._id });
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
      const { body: manifestation, user, params } = req;

      assert(_.isObject(manifestation), "Manifestation is not a valid object.");

      // 0. Validar superadmin o permisos de acceso
      manifestationService.validateOwnership(manifestation, user);

      // 1. Reasignar usuarios
      manifestation.userIds &&
        user.superadmin &&
        (await manifestationService.assingUsers(manifestation));

      // 2. Procesar campos tipo Array: sponsors y hashtags
      manifestationService.processArrayFields(manifestation);

      // 3. Subir y asociar imágenes
      req.files && (await manifestationService.processFiles(manifestation, req.files));

      // 4. Limpia todos los datos que no concuerdan con el schema
      manifestationService.cleanupStructure(manifestation);

      const updatedManifestation = await ManifestationDAO.udpate(
        params.manifestationId,
        manifestation,
      );
      res.status(201).json(updatedManifestation);
    } catch (error) {
      const throwable = normalizeAndLogError("Manifestation", req, error);
      next(throwable);
    }
  }
}

module.exports = { ManifestationController };
