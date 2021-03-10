const _ = require("lodash");
const { UserDAO, ManifestationDAO } = require("mv-models");
const path = require("path");
const config = require("config");
const shorthash = require("shorthash2");
const pify = require("pify");
const mv = require("mv");

const s3Service = require("../../common/s3");
const seaweedHelper = require("../../helpers/seaweed");
const { NotFoundError, PermissionError, ValidationError } = require("../../helpers/errors");

async function valideateUpdateUri(manifestation) {
  const manifestationByUri = await ManifestationDAO.getByQuery({
    query: { uri: manifestation.uri },
  });
  if (
    manifestationByUri.length > 0 &&
    manifestationByUri[0]._id.toString() !== manifestation.id.toString()
  ) {
    throw new ValidationError(422, `Ya existe una marcha con la uri ${manifestation.uri}`);
  }
}

async function valideateCreateUri(manifestation) {
  const manifestationByUri = await ManifestationDAO.getByQuery({
    query: { uri: manifestation.uri },
  });
  if (manifestationByUri.length > 0) {
    throw new ValidationError(422, `Ya existe una marcha con la uri ${manifestation.uri}`);
  }
}

function cleanupStructure(manifestation) {
  const keys = Object.keys(manifestation);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].includes("id")) {
      delete manifestation[keys[i]];
    }
  }
}

function processArrayFields(manifestation) {
  const keys = Object.keys(manifestation);
  const values = Object.values(manifestation);
  const parsedManifestation = {};
  for (let i = 0; i < keys.length; i++) {
    _.set(parsedManifestation, keys[i], values[i]);
  }
  return parsedManifestation;
}

function validateUsersId(userIds, users) {
  if (userIds && userIds.length !== users.length) {
    let idNotFound = "";
    userIds.forEach((userId) => {
      let found = false;
      users.forEach((user) => {
        found = userId.toString() === user._id.toString();
      });
      if (!found) {
        idNotFound = userId;
      }
    });
    throw new NotFoundError(404, `No existe el usuario con id ${idNotFound}`);
  }
  users.forEach((user) => {
    if (user.superadmin) {
      throw new NotFoundError(
        404,
        `El usuario ${user.name} no es elegible para esta manifestación`,
      );
    }
  });
}

async function assingUsers(manifestation) {
  const usersIds = manifestation.userIds;
  delete manifestation.userIds;
  const users = await UserDAO.getManyByIds(usersIds);
  validateUsersId(usersIds, users);
  const usersWithThisManifestation = await UserDAO.find({
    manifestation_id: manifestation.id,
  });
  const uids = [];
  usersWithThisManifestation.forEach(async (user) => {
    uids.push(user._id);
  });
  // remove manifestations from all users that have it
  await UserDAO.udpateToMany(uids, { manifestation_id: null });
  // re assigns users selected
  await UserDAO.udpateToMany(usersIds, { manifestation_id: manifestation.id });
}

function validateOwnership({ id, name }, { superadmin, manifestation_id: manifestationId }) {
  if (!superadmin && (!manifestationId || id.toString() !== manifestationId.toString())) {
    throw new PermissionError(403, `No tiene permisos de edición para la manifestación ${name}`);
  }
}

async function processFiles(manifestation, files) {
  const s3 = s3Service.getInstance();

  // TODO: check for multifiles upload
  // and iterate over the results
  for (const file in files) {
    let uploadResults;
    const renamedFile = file.toString().replace("rawFile", "src");
    let src;
    try {
      uploadResults = await s3.client.write(files[file].path);
      src = seaweedHelper.parseResultsToSrc(uploadResults);
    } catch (error) {
      // if the file server is down
      // move to local public static served folder
      // and use that as source
      if (!error.message || !error.message.includes("ECONNREFUSED")) {
        throw error;
      }
      const fileName = `${shorthash(files[file].name)}${path.extname(files[file].name)}`;
      await pify(mv)(files[file].path, path.join(__dirname, "../..", "public", fileName));
      src = `${config.get("api.public")}/pubresources/${fileName}`;
    }

    _.set(manifestation, renamedFile, src);
  }
}

module.exports = {
  assingUsers,
  validateOwnership,
  processArrayFields,
  processFiles,
  cleanupStructure,
  validateUsersId,
  valideateUpdateUri,
  valideateCreateUri,
};
