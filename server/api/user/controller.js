const _ = require("lodash");
const { UserDAO } = require("mv-models");
const assert = require("assert");

const {
  normalizeAndLogError,
  NotFoundError,
  AuthenticationError,
  BadRequestError,
} = require("../../helpers/errors");

class UserController {
  async create(req, res, next) {
    try {
      const user = req.body;
      delete user.cpassword;
      assert(_.isObject(user), "Usuario no es un objeto valido..");
      const newUser = await UserDAO.createNew(user);
      res.status(201).json(newUser);
    } catch (error) {
      const throwable = normalizeAndLogError("User", req, error);
      next(throwable);
      // if (error.message.includes("Email is in use")) {
      //   return res.status(404).send({
      //     message: "Email is in use",
      //   });
      // }
      // if (error.name === "ValidationError") {
      //   return res.status(404).send({
      //     message: "Some fields are needed",
      //   });
      // }
      // console.error(error);
      // next(error);
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
      const throwable = normalizeAndLogError("User", req, error);
      next(throwable);
    }
  }

  async getOne(req, res, next) {
    try {
      const user = await UserDAO.findById({ _id: req.params.userId });
      if (!user) {
        throw new NotFoundError(404, `No se encontró el usuario con el id ${req.params.userId}`);
      }
      res.status(200).json(user);
    } catch (err) {
      const throwable = normalizeAndLogError("User", req, err);
      next(throwable);
    }
  }

  async delete(req, res, next) {
    try {
      const userDeleted = await UserDAO.delete({ _id: req.params.userId }, req.user._id);
      res.status(200).json(userDeleted);
    } catch (err) {
      const throwable = normalizeAndLogError("User", req, err);
      next(throwable);
    }
  }

  async update(req, res, next) {
    try {
      const user = req.body;
      delete user.manifestation_id;
      assert(_.isObject(user), "Usuario no es un objeto valido..");
      if (!user.id) {
        throw new BadRequestError(400, "Se necesita el id del usuario");
      }
      const actualUser = await UserDAO.findById(user.id);
      if (user.superadmin && actualUser.manifestation_id) {
        throw new NotFoundError(
          404,
          "Un usuario no puede ser super administrador si posee una marcha o viceversa",
        );
      }
      const updatedUser = await UserDAO.udpate(user.id, user);
      res.status(201).json(updatedUser);
    } catch (error) {
      const throwable = normalizeAndLogError("User", req, error);
      next(throwable);
    }
  }

  async userProfile(req, res) {
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
      const throwable = normalizeAndLogError("User", req, error);
      next(throwable);
    }
  }

  async logOut(req, res, next) {
    // Log user out of the application
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
      });
      await UserDAO.findByIdAndUpdate(req.user._id, req.user);
      res.status(200).send();
    } catch (error) {
      const throwable = normalizeAndLogError("User", req, error);
      next(throwable);
    }
  }

  async logIn(req, res, next) {
    // Login a registered user
    try {
      const { email, password } = req.body;
      const user = await UserDAO.findByCredentials(email, password);
      if (!user) {
        throw new AuthenticationError(401, "Credenciales incorrectas");
      }
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (error) {
      const throwable = normalizeAndLogError("User", req, error);
      next(throwable);
    }
  }
}

module.exports = { UserController };
