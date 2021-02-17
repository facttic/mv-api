const _ = require("lodash");
const { UserDAO } = require("mv-models");
const assert = require("assert");

class UserController {
  async create(req, res, next) {
    try {
      const user = req.body;
      assert(_.isObject(user), "user is not a valid object.");
      const newUser = await UserDAO.createNew(user);
      res.status(201).json(newUser);
    } catch (error) {
      if (error.message.includes("Email is in use")) {
        return res.status(404).send({
          message: "Email is in use",
        });
      }
      if (error.name === "ValidationError") {
        return res.status(404).send({
          message: "Some fields are needed",
        });
      }
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { shapedQuery } = req;
      const users = await UserDAO.getAll(shapedQuery);
      const count = await UserDAO.countDocuments();
      const ret = {
        data: users,
        total: count,
      };
      res.status(200).json(ret);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const user = await UserDAO.findById({ _id: req.params.userId });
      if (!user) {
        return res.status(404).send({
          message: "user not found with id " + req.params.userId,
        });
      }
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const userDeleted = await UserDAO.delete({ _id: req.params.userId }, req.user._id);
      if (!userDeleted) {
        return res.status(404).send({
          message: "user not found with id " + req.params.userId,
        });
      }
      res.status(200).json(userDeleted);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const user = req.body;
      delete user.manifestation_id;
      assert(_.isObject(user), "User is not a valid object.");
      const actualUser = await UserDAO.findById(user.id);
      if (user.superadmin && actualUser.manifestation_id) {
        return res.status(404).send({
          message: "User can't have a manifestation if is superadmin or vice versa",
        });
      }
      const updatedUser = await UserDAO.udpate(user.id, user);
      res.status(201).json(updatedUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async userProfile(req, res, next) {
    // View logged in user profile
    res.status(201).json(req.user);
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
      await UserDAO.findByIdAndUpdate(req.user._id, req.user);
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
