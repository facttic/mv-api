const { UserController } = require("./controller");
const auth = require("../middleware/auth");

class UserRoutes {
  static init(router) {
    const userController = new UserController();
    /* router.post('/users', async (req, res) => {
        // Create a new user
        try {
            const user = new User(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })
        } catch (error) {
            res.status(400).send(error)
        }
    }) */
    router.route("/users/login").post(userController.logIn);
    router.route("/users/me").get(auth, userController.userProfile);
    router.route("/users/me/logout").post(auth, userController.logOut);
    router.route("/users/me/logoutall").post(auth, userController.logOutAll);
  }
}

module.exports = { UserRoutes };
