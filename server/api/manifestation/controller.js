const _ = require("lodash");
const assert = require("assert");
// const formidable = require("formidable");
// const pify = require("pify");

const { ManifestationDAO, UserDAO } = require("mv-models");

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
          return res.status(404).send({
            message: "User not found with id " + userId,
          });
        }
        if (user.superadmin) {
          return res.status(404).send({
            message:
              "User " + user.name + " is not eligible for this manifestation, please select other",
          });
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
      console.error(error);
      next(error);
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
      res.status(404).send({
        message: "manifestation not found with id " + req.params.manifestationId,
      });
      next(error);
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
          return res.status(404).send({
            message: "User not found with id " + usersId[i],
          });
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
      console.error(error);
      next(error);
    }
  }
}

module.exports = { ManifestationController };
