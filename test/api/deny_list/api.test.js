const { expect } = require("chai");
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("deny_list", () => {
  context("obtain_all", () => {
    beforeEach(async function () {
      this.deny_list = await factories.create("deny_list");
    });

    it("Should return 200 when trys to get post with query", async function () {
      const manifestationId = this.deny_list.manifestation_id.toString();
      await chai
        .request(app)
        .get("/api/deny_lists")
        .query({ manifestationId })
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });

    it("Should return 422 when trys to get post without query", async function () {
      await chai
        .request(app)
        .get("/api/deny_lists")
        .then((res) => {
          expect(res).to.have.status(422);
        });
    });
  });

  context("create", () => {
    beforeEach(async function () {
      this.deny_list = await factories.create("deny_list");
      this.user = await factories.create("user", { password: "1234abcd" });
      this.userLogin = async (email = this.user.email, password = "1234abcd") =>
        await chai.request(app).post("/api/users/login").send({ email, password });
    });

    it("Should return 401 when try to create post without login", async function () {
      const deny_list = await factories.attrs("deny_list");
      await chai
        .request(app)
        .post("/api/deny_lists")
        .send(deny_list)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should return 200 when try to create post", async function () {
      const deny_list = await factories.attrs("deny_list");
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .post("/api/deny_lists")
          .set("Authorization", token)
          .send(deny_list)
          .then((res) => {
            console.log(res.text);
            expect(res).to.be.json;
            expect(res).to.have.status(200);
          });
      });
    });
  });

  context("obtain_one", () => {
    beforeEach(async function () {
      this.deny_list = await factories.create("deny_list");
    });

    it("Should return 200 when public user trys to obtain one deny_list", async function () {
      const denyId = this.deny_list._id;
      await chai
        .request(app)
        .get("/api/deny_lists/" + denyId)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });
  });

  context("delete", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.deny_list = await factories.create("deny_list");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 401 when not identified user trys to delete one deny_list", async function () {
      const denyId = this.deny_list._id;
      await chai
        .request(app)
        .delete("/api/deny_lists/" + denyId)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should return 200 when identified user trys to delete one deny_list", async function () {
      const denyId = this.deny_list._id;
      const token = this.userToken;
      await chai
        .request(app)
        .delete("/api/deny_lists/" + denyId)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });
  });

  context("update", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.deny_list = await factories.create("deny_list");
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Should return 401 when not identified user trys to update one deny_list", async function () {
      const denyListModified = await factories.attrs("deny_list");
      const denyId = this.deny_list._id;
      await chai
        .request(app)
        .put("/api/deny_lists/" + denyId)
        .send(denyListModified)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should return 200 when identified user trys to update one deny_list", async function () {
        const denyListModified = await factories.attrs("deny_list");
        const denyId = this.deny_list._id;
        const token = this.userToken;
        await chai
          .request(app)
          .put("/api/deny_lists/" + denyId)
          .send(denyListModified)
          .set("Authorization", token)
          .then((res) => {
            console.log(res.text);
            expect(res).to.be.json;
            expect(res).to.have.status(200);
          });
    });
  });
});
