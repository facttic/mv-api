const _ = require("lodash");
const { UserDAO } = require("mv-models");
const path = require("path");
const config = require("config");
const shorthash = require("shorthash2");
const pify = require("pify");
const mv = require("mv");

const s3Service = require("../../common/s3");
const seaweedHelper = require("../../helpers/seaweed");
const { NotFoundError, PermissionError } = require("../../helpers/errors");

function cleanupStructure(manifestation) {
  const keys = Object.keys(manifestation);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].includes("id")) {
      delete manifestation[keys[i]];
    }
  }
}

function parseFieldToArrayElement(object, key, value) {
  const keys = key.split(".");
  if (object[keys[0]][parseInt(keys[1])]) {
    object[keys[0]][parseInt(keys[1])][keys[2]] = value;
  } else {
    const newObject = {};
    newObject[keys[2]] = value;
    object[keys[0]].push(newObject);
  }
}

function processArrayFields(manifestation) {
  const arrayValues = { sponsors: [], hashtags: [] };
  const keys = Object.keys(manifestation);
  const values = Object.values(manifestation);

  for (let i = 0; i < keys.length; i++) {
    // ignores data of sponsors and hashtags.
    if (!keys[i].includes("sponsors") && !keys[i].includes("hashtags")) {
      const value = values[i];
      const vquery = {};
      vquery[keys[i]] = value;
      // await ManifestationDAO.udpate(req.params.manifestationId, vquery);
    } else {
      // Parse fields like sponsors.0.name to array element.
      parseFieldToArrayElement(arrayValues, keys[i], values[i]);
    }
  }
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
    throw new NotFoundError(404, `User not found with id ${idNotFound}`);
  }
  users.forEach((user) => {
    if (user.superadmin) {
      throw new NotFoundError(
        404,
        `User ${user.name} is not eligible for this manifestation, please select other`,
      );
    }
  });
}

async function assingUsers(manifestation) {
  const usersIds = manifestation.userIds;
  delete manifestation.userIds;
  const users = await UserDAO.getManyByIds(usersIds);
  validateUsersId(usersIds, users);
  // remove manifestations from all users that have it
  const usersWithThisManifestation = await UserDAO.find({
    manifestation_id: manifestation.id,
  });
  const uids = [];
  usersWithThisManifestation.forEach(async (user) => {
    uids.push(user._id);
  });
  // re assigns users selected

  await UserDAO.udpateToMany(uids, { manifestation_id: null });
  users.forEach((user) => {
    user.manifestation_id = manifestation.id;
  });
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
};
