const { UserDAO } = require("mv-models");

class UserController {
  async create(req, res, next) {}

  async getAll(req, res, next) {}

  async delete(req, res, next) {}

  async update(req, res, next) {}

  async userProfile(req, res, next) {
    // View logged in user profile
    res.send(req.user);
  }

  async logOutAll(req, res, next) {
    // Log user out of all devices
    try {
      req.user.tokens.splice(0, req.user.tokens.length);
      await req.user.save();
      res.send();
    } catch (error) {
      res.status(500).send(error);
      next(error);
    }
  }

  async logOut(req, res, next) {
    // Log user out of the application
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
      });
      await req.user.save();
      res.send();
    } catch (error) {
      res.status(500).send(error);
      next(error);
    }
  }

  async logIn(req, res, next) {
    // Login a registered user
    try {
      const { email, password } = req.body;
      const user = await UserDAO.findByCredentials(email, password);
      if (!user) {
        return res.status(401).send({ error: "Login failed! Check authentication credentials" });
      }
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (error) {
      res.status(400).send(error);
      next(error);
    }
  }
}

module.exports = { UserController };
