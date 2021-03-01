const { expect } = require("chai");
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("hashtag", () => {
  context("obtain", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.manifestation = await factories.create("manifestation");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 200 when user trys to get hashtag", async function () {
      const id = this.manifestation._id;
      const token = this.userToken;
      await chai
        .request(app)
        .get("/api/manifestations/" + id + "/hashtags")
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });
  });

  context("create", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.manifestation = await factories.create("manifestation");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 201 when user create hashtag", async function () {
      const id = this.manifestation._id;
      const token = this.userToken;
      const newHashtag = { name: "test", source: "twitter" };
      await chai
        .request(app)
        .post("/api/manifestations/" + id + "/hashtags")
        .set("Authorization", token)
        .send(newHashtag)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });
  });

  context("delete", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.manifestation = await factories.create("manifestation");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 200 when user delete hashtag", async function () {
      const id = this.manifestation._id;
      const hashtagId = this.manifestation.hashtags[0]._id;
      const token = this.userToken;      
      await chai
        .request(app)
        .delete("/api/manifestations/" + id + "/hashtags/" +hashtagId)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });

    it("Should return 404 when user delete non existent hashtag", async function () {
      const id = this.manifestation._id;
      const hashtagId = "not id";
      const token = this.userToken;      
      await chai
        .request(app)
        .delete("/api/manifestations/" + id + "/hashtags/" +hashtagId)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });

    it("Should return 401 when not logged  user try delete hashtag", async function () {
      const id = this.manifestation._id;
      const hashtagId = this.manifestation.hashtags[0]._id;
      const token = this.userToken;      
      await chai
        .request(app)
        .delete("/api/manifestations/" + id + "/hashtags/" +hashtagId)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });
  });

  context("update", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.manifestation = await factories.create("manifestation");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 201 when user update hashtag", async function () {
      const id = this.manifestation._id;
      const token = this.userToken;
      const hashtagId = this.manifestation.hashtags[0]._id;
      const editedHashtag = this.manifestation.hashtags[0];
      editedHashtag.name = "changed";
      await chai
        .request(app)
        .put("/api/manifestations/" + id + "/hashtags/" +hashtagId)
        .set("Authorization", token)
        .send(editedHashtag)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });

    it("Should return 401 when not logged user update hashtag", async function () {
      const id = this.manifestation._id;
      const hashtagId = this.manifestation.hashtags[0]._id;
      const editedHashtag = this.manifestation.hashtags[0];
      editedHashtag.name = "changed";
      await chai
        .request(app)
        .put("/api/manifestations/" + id + "/hashtags/" +hashtagId)
        .send(editedHashtag)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should return 404 when user update non existent hashtag", async function () {
      const id = this.manifestation._id;
      const token = this.userToken;
      const hashtagId = "not id";
      const editedHashtag = this.manifestation.hashtags[0];
      editedHashtag.name = "changed";
      await chai
        .request(app)
        .put("/api/manifestations/" + id + "/hashtags/" +hashtagId)
        .set("Authorization", token)
        .send(editedHashtag)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(404);
        });
    });
  });
});
