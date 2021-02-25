const { UserController } = require("./controller");
const auth = require("../middleware/auth");
const { shapeQuery } = require("../middleware/shape-query");
const { adminChecker } = require("../middleware/admin-checker");
const { UserDAO } = require("mv-models");

class UserRoutes {
  static init(router) {
    const userController = new UserController();
    router
      .route("/users/")
      .post(auth, adminChecker, userController.create)
      .get(shapeQuery(UserDAO.schema), auth, adminChecker, userController.getAll);
    router
      .route("/users/:userId")
      .get(auth, adminChecker, userController.getOne)
      .delete(auth, adminChecker, userController.delete)
      .put(auth, userController.update);
    router.route("/users/login").post(userController.logIn);
    router.route("/users/me").post(auth, userController.userProfile);
    router.route("/users/me/logout").post(auth, userController.logOut);
    router.route("/users/me/logoutall").post(auth, userController.logOutAll);
  }
}

module.exports = { UserRoutes };
