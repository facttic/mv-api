const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { HashtagDAO } = require("./dao");

class HashtagController {

  async createNew(req, res, next) {
    try {
      const hashtag = req.body;
      assert(_.isObject(hashtag), "Hashtag is not a valid object.");

      const newHashtag = await HashtagDAO.createNew(hashtag);
      res.status(201).json(newHashtag);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const hashtags = await HashtagDAO.getAll();
      res.status(200).json(hashtags);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const hashtag = await HashtagDAO.findById(req.params.hashtagId);
      if(!hashtag) {
          return res.status(404).send({
              message: "hashtag not found with id " + req.params.hashtagId
          });            
      }
      res.status(200).json(hashtag);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      if(!req.body.name) {
          return res.status(400).send({
              message: "Hashtag content can not be empty"
          });
      }

      const hashtag = await HashtagDAO.findByIdAndUpdate(req.params.hashtagId, {
        name: req.body.name
      }, {new: true})
      
      if(!hashtag) {
          return res.status(404).send({
              message: "hashtag not found with id " + req.params.hashtagId
          });            
      }
      res.status(200).json(hashtag);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const hashtag = await HashtagDAO.findByIdAndRemove(req.params.hashtagId);
      if(!hashtag) {
          return res.status(404).send({
              message: "hashtag not found with id " + req.params.hashtagId
          });            
      }
      res.status(200).json(hashtag);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

}

module.exports = { HashtagController };
