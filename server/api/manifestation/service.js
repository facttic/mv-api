const { ManifestationDAO, UserDAO } = require("mv-models");
const s3Service = require("../../common/s3");
const formidable = require("formidable");
const pify = require("pify");

function parseFieldToArrayElement(object, key, value) {
  const keys = key.split(".");
  if (object[keys[0]][parseInt(keys[1])]) {
    object[keys[0]][parseInt(keys[1])][keys[2]] = value;
  } else {
    const newObject = {};
    newObject[keys[2]] = value;
    object[keys[0]].push(newObject);
  }
  console.log("PARSE", { key, value });
  console.log("object", object);
}

async function assingUsers(manifestation, usersId) {
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
    user.manifestation_id = manifestation.id;
    await UserDAO.udpate(user._id, user);
  }
}

async function resolveAsForm(req, res) {
  const s3 = s3Service.getInstance();
  const form = formidable({ multiples: true });

  let readableStream;
  form.onPart = async function (part) {
    if (part.filename === "" || !part.mime) {
      return form.handlePart(part);
    }
    console.log("filename", part.filename);
    readableStream = new Stream.Readable({
      read() {},
    });
    console.log("readableStream created", readableStream);

    part.once("error", console.error);
    part.once("end", () => {
      console.log("Done!");
      // readableStream.push(null);
    });

    part.on("data", (buffer) => {
      console.log("getting data", buffer);
      buffer && readableStream.push(buffer);
    });

    console.log("a punto de promise");
    const coso = await s3.client.write(readableStream);
    console.log("coso", coso);
  };

  const asyncParse = await pify(form.parse, { multiArgs: true }).bind(form);
  const [fields, files] = await asyncParse(req);
  delete fields.id;

  const arrayValues = { sponsors: [], hashtags: [] };
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  for (let i = 0; i < keys.length; i++) {
    // ignores data of sponsors and hashtags.
    if (!keys[i].includes("sponsors") && !keys[i].includes("hashtags")) {
      const value = values[i];
      const vquery = {};
      vquery[keys[i]] = value;
      await ManifestationDAO.udpate(req.params.manifestationId, vquery);
    } else {
      // Parse fields like sponsors.0.name to array element.
      parseFieldToArrayElement(arrayValues, keys[i], values[i]);
    }
  }

  await ManifestationDAO.udpate(req.params.manifestationId, arrayValues);

  // for (const [key, value] of Object.entries(files)) {
  //   const fileSaved = await s3.client.write(readableStream);
  // console.log("key", key);
  // console.log("value", value);
  //   console.log("fileSaved", fileSaved);
  // }

  // for (let i = 0; i < filesKeys.length; i++) {
  //   const query = {};
  //   /* Solo estoy usando el nombre del campo del field que viene como image.header.rawFile
  //   para pasarlo a image.header.src y aprobechar el la notación dot para guardar el url. */
  //   const key = filesKeys[i].replace("rawFile", "src");
  //   query[key] = "https://www.instasent.com/blog/wp-content/uploads/2019/09/5a144f339cc68-1.png";
  //   await ManifestationDAO.udpate(req.params.manifestationId, query);
  // }

  const updatedManifestation = await ManifestationDAO.getById(req.params.manifestationId);
  res.status(201).json(updatedManifestation);
}

async function resolveAsJson(req, res) {
  let manifestation = req.body;
  const { id, name, uri } = manifestation;
  assert(_.isObject(manifestation), "Manifestation is not a valid object.");

  const usersId = manifestation.users_id;
  delete manifestation.users_id;
  if (req.user.superadmin) {
    // cuts data for update when admin edits.
    manifestation = { id, name, uri };
    await manifestationService.assingUsers(manifestation, usersId);
  }
  if (!req.user.superadmin) {
    console.log(req.user);
    const user = await UserDAO.getById(req.user._id);
    if (
      user.manifestation_id === null ||
      manifestation.id.toString() !== user.manifestation_id.toString()
    ) {
      throw new PermissionError(
        403,
        `No tiene permisos de edición para la manifestación ${manifestation.name}`,
      );
    }
  }
  const updatedManifestation = await ManifestationDAO.udpate(manifestation.id, manifestation);

  res.status(201).json(updatedManifestation);
}

module.exports = {
  assingUsers,
  resolveAsForm,
  resolveAsJson,
};
