const _ = require("lodash");
const assert = require("assert");
// const formidable = require("formidable");
// const pify = require("pify");

const { ManifestationDAO, UserDAO } = require("mv-models");

const { normalizeAndLogError, NotFoundError } = require("../../helpers/errors");

class ManifestationController {
  async create(req, res, next) {
    try {
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

  async assingUsers(res, reqUser, manifestation, usersId, updatedManifestation) {
    if (reqUser.superadmin) {
      // remove manifestations from all users that have it
      const usersWithThisManifestation = await UserDAO.find({
        manifestation_id: manifestation.id,
      });
      for (const i in usersWithThisManifestation) {
        const user = usersWithThisManifestation[i];
        user.manifestation_id = null;
        await UserDAO.udpate(user._id, user);
      }
      // re assigns users selected
      for (const i in usersId) {
        const user = await UserDAO.getById(usersId[i]);
        if (!user) {
          throw new NotFoundError(404, `User not found with id ${usersId[i]}`);
        }
        user.manifestation_id = updatedManifestation._id;
        await UserDAO.udpate(user._id, user);
      }
    }
  }

  async update(req, res, next) {
    try {
      // TODO finish implementation once defined if
      // react-admin will send Base64 encode or multi-part form data

      // const form = formidable({ multiples: true });
      // const asyncParse = await pify(form.parse, { multiArgs: true }).bind(form);
      // // const asyncParse = util.promisify(form.parse).bind(form);
      // const [fields, files] = await asyncParse(req);
      // console.log("results", fields, files);

      // // form.parse(req, (err, fields, files) => {
      // //   if (err) {
      // //     console.error(err);
      // //   }
      // //   console.log("fields", fields);
      // //   console.log("files", files);
      // // });

      // const manifestation = fields;

      // foreach(files, (file) => const url = files.saveS3();
      //   manifestaion.loqueva.url = url
      // );
      const manifestation = req.body;
      assert(_.isObject(manifestation), "Manifestation is not a valid object.");
      const usersId = manifestation.users_id;
      delete manifestation.users_id;
      const updatedManifestation = await ManifestationDAO.udpate(manifestation.id, manifestation);
      new ManifestationController().assingUsers(
        res,
        req.user,
        manifestation,
        usersId,
        updatedManifestation,
      );
      res.status(201).json(updatedManifestation);
    } catch (error) {
      const throwable = normalizeAndLogError("Manifestation", req, error);
      next(throwable);
    }
  }
}

module.exports = { ManifestationController };
