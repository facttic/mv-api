/* eslint-disable no-unused-expressions */
const { expect } = require("chai");
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("post", () => {
  context("obtain", () => {
    beforeEach(async function () {
      this.post = await factories.create("post");
    });

    it("Should return 200 when user trys to get post with query", async function () {
      const manifestationId = this.post.manifestation_id.toString();
      await chai
        .request(app)
        .get("/api/posts")
        .query({ manifestationId })
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });

    it("Should return 500 when user trys to get post without proper query", async function () {
      const manifestationId = this.post.manifestation_id;
      await chai
        .request(app)
        .get("/api/posts")
        .query({ manifestationId })
        .then((res) => {
          expect(res).to.have.status(500);
        });
    });

    it("Should return 500 when user trys to get post without query", async function () {
      await chai
        .request(app)
        .get("/api/posts")
        .then((res) => {
          expect(res).to.have.status(422);
        });
    });
  });

  context("delete", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.post = await factories.create("post");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 200 when user trys to delete post with proper query", async function () {
      const manifestationId = this.post.manifestation_id.toString();
      const postId = this.post._id;
      const token = this.userToken;
      await chai
        .request(app)
        .delete("/api/posts/" + postId)
        .query({ manifestationId })
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });

    it("Should return 500 when user trys to delete post without proper query", async function () {
      const manifestationId = this.post.manifestation_id;
      const postId = this.post._id;
      const token = this.userToken;
      await chai
        .request(app)
        .delete("/api/posts/" + postId)
        .query({ manifestationId })
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(500);
        });
    });

    it("Should return 422 when user trys to delete post without query", async function () {
      const postId = this.post._id;
      const token = this.userToken;
      await chai
        .request(app)
        .delete("/api/posts/" + postId)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(422);
        });
    });

    it("Should deny access when trys to delete post without logged user", async function () {
      const manifestationId = this.post.manifestation_id.toString();
      const postId = this.post._id;
      await chai
        .request(app)
        .delete("/api/posts/" + postId)
        .query({ manifestationId })
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });
  });
});
