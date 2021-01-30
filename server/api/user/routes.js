const { UserController } = require("./controller");
const auth = require("../middleware/auth");

class UserRoutes {
  static init(router) {
    const userController = new UserController();
    router.route("/users/").post(auth, userController.create);
    router.route("/users/").get(auth, userController.getAll);
    router.route("/users/:userId").delete(auth, userController.delete);
    router.route("/users/login").post(userController.logIn);
    router.route("/users/:userId").post(auth, userController.update);
    router.route("/users/me").get(auth, userController.userProfile);
    router.route("/users/me/logout").post(auth, userController.logOut);
    router.route("/users/me/logoutall").post(auth, userController.logOutAll);
  }
}

module.exports = { UserRoutes };
