const _ = require("lodash");
const assert = require("assert");

const { ManifestationDAO } = require("mv-models");

const { normalizeAndLogError, NotFoundError, BadRequestError } = require("../../helpers/errors");

class HashtagController {
  async createNew(req, res, next) {
    try {
      const manifestation = await ManifestationDAO.getById(req.params.manifestationId);
      const hashtag = req.body;
      assert(_.isObject(hashtag), "La manifestación no es un objeto valido.");

      const newHashtag = await manifestation.newHashtag(hashtag);
      res.status(201).json(newHashtag);
    } catch (error) {
      const throwable = normalizeAndLogError("Hashtag", req, error);
      next(throwable);
    }
  }

  async getAll(req, res, next) {
    try {
      const manifestation = await ManifestationDAO.getById(req.params.manifestationId);
      const hashtags = await manifestation.getAllHashtags();
      res.status(200).json(hashtags);
    } catch (error) {
      const throwable = normalizeAndLogError("Hashtag", req, error);
      next(throwable);
    }
  }

  // async getOne(req, res, next) {
  //   try {
  //     const hashtag = await HashtagDAO.findById(req.params.hashtagId);
  //     if (!hashtag) {
  //       return res.status(404).send({
  //         message: "hashtag not found with id " + req.params.hashtagId,
  //       });
  //     }
  //     res.status(200).json(hashtag);
  //   } catch (error) {
  //     console.error(error);
  //     next(error);
  //   }
  // }

  async update(req, res, next) {
    try {
      if (!req.body.name) {
        throw new BadRequestError(400, "El contenido del hashtag no puede ser vacío");
      }
      const { manifestationId, hashtagId } = req.params;
      const manifestation = await ManifestationDAO.getById(manifestationId);

      const hashtag = await manifestation.updateHashtag(hashtagId, {
        name: req.body.name,
      });

      if (!hashtag) {
        throw new NotFoundError(404, "No se encontró el Hashtag con id  " + hashtagId);
      }

      res.status(200).json(hashtag);
    } catch (error) {
      const throwable = normalizeAndLogError("Hashtag", req, error);
      next(throwable);
    }
  }

  async delete(req, res, next) {
    try {
      const { manifestationId, hashtagId } = req.params;

      const manifestation = await ManifestationDAO.getById(manifestationId);
      const hashtag = await manifestation.deleteHashtag(hashtagId);

      if (!hashtag) {
        throw new NotFoundError(404, "No se encontró el Hashtag con id " + hashtagId);
      }

      res.status(200).json(hashtag);
    } catch (error) {
      const throwable = normalizeAndLogError("Hashtag", req, error);
      next(throwable);
    }
  }
}

module.exports = { HashtagController };
