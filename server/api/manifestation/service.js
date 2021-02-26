const { UserDAO } = require("mv-models");

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

module.exports = {
  assingUsers,
};
