const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { TwitterUsersDAO } = require("./dao");

class TwitterUsersController {

  async getUsersCount(req, res, next) {
    try {
      const usersCount = await TwitterUsersDAO.findOne();
      if (!usersCount) {
        return res.status(404).send({
          message: "twitter users count not found"
        });
      }
      res.status(200).json(usersCount);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = { TwitterUsersController };
