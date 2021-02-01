const _ = require("lodash");
const { UserDAO } = require("mv-models");
const assert = require("assert");
const { CacheConfig } = require("../../cache");

class UserController {
  async create(req, res, next) {
    try {
      const user = req.body;
      assert(_.isObject(user), "user is not a valid object.");
      if (await UserDAO.findByEmail(user.email)) {
        return res.status(404).send({
          message: "Email " + user.email + " is used",
        });
      }
      const newUser = await UserDAO.createNew(user);
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { query } = req;
      const users = await UserDAO.getAll(query);
      const count = await UserDAO.countDocuments();
      console.log(query);
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

  async delete(req, res, next) {
    try {
      console.log("delete called");
      console.log(req.params);
      const userDeleted = await UserDAO.delete({ _id: req.params.userId }, req.user._id);
      if (!userDeleted) {
        return res.status(404).send({
          message: "user not found with id " + req.params.userId,
        });
      }
      const cache = CacheConfig.get();
      cache.flushAll();
      res.status(200).json(userDeleted);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const user = req.body;
      assert(_.isObject(user), "User is not a valid object.");

      const updatedUser = await UserDAO.udpate(user);
      res.status(201).json(updatedUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

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
