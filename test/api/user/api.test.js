/* eslint-disable no-unused-expressions */
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("user", () => {
  context("login", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
      this.userLogin = async (email = this.user.email, password = "1234abcd") =>
        await chai.request(app).post("/api/users/login").send({ email, password });
    });

    it("Should login and return 200 and a token if a existing username and password are provided", async function () {
      const { email } = this.user;

      await chai
        .request(app)
        .post("/api/users/login")
        .send({ email, password: "1234abcd" })
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });

    it("Should return 401 when trys login with a wrong password", async function () {
      await this.userLogin("wrongemail", "wrongpassword").then((res) => {
        expect(res).to.have.status(401);
      });
    });

    it("Should return 200 when trys logout", async function () {
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .post("/api/users/me/logout")
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.have.status(200);
          });
      });
    });

    it("Should return error when trys logout without token", async function () {
      await chai
        .request(app)
        .post("/api/users/me/logout")
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });
  });
  context("managment", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { superadmin: false, password: "1234abcd" });
      this.admin = await factories.create("user", {
        email: "su@admin.com",
        superadmin: true,
        password: "adm1234abcd",
      });
      this.userLogin = async (email = this.user.email, password = "1234abcd") =>
        await chai.request(app).post("/api/users/login").send({ email, password });
      this.adminLogin = async (email = this.admin.email, password = "adm1234abcd") =>
        await chai.request(app).post("/api/users/login").send({ email, password });
    });

    it("Should reject access to create when request not posess token", async function () {
      const newUser = await factories.attrs("user");
      await chai
        .request(app)
        .post("/api/users")
        .send(newUser)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should reject access to create when user is not an admin", async function () {
      const newUser = await factories.attrs("user");
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .post("/api/users")
          .set("Authorization", token)
          .send(newUser)
          .then((res) => {
            expect(res).to.have.status(401);
          });
      });
    });

    it("Should permit create new user when is admin", async function () {
      const newUser = await factories.attrs("user");
      await this.adminLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .post("/api/users")
          .set("Authorization", token)
          .send(newUser)
          .then((res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(201);
          });
      });
    });

    it("Shouldn't delete user is not an admin", async function () {
      const userId = this.user._id;
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .delete("/api/users/" + userId)
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.have.status(401);
          });
      });
    });

    it("Should delete user is an admin", async function () {
      const userId = this.user._id;
      await this.adminLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .delete("/api/users/" + userId)
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.have.status(200);
          });
      });
    });

    it("Should update when user is not an admin", async function () {
      const user = this.user;
      user.name = "edited name";
      const userId = this.user._id;
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .put("/api/users/" + userId)
          .set("Authorization", token)
          .send(user)
          .then((res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(201);
          });
      });
    });

    it("Should update when user is admin", async function () {
      const user = this.user;
      user.name = "edited name";
      await this.adminLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .put("/api/users/" + user.id)
          .set("Authorization", token)
          .send(user)
          .then((res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(201);
          });
      });
    });

    it("Should fail update when data has not id", async function () {
      const newUser = await factories.attrs("user");
      const { id } = this.user;
      await this.adminLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .put("/api/users/" + id)
          .set("Authorization", token)
          .send(newUser)
          .then((res) => {
            expect(res).to.have.status(400);
          });
      });
    });

    it("Should fail when user is not Admin and try to get users", async function () {
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .get("/api/users/")
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.have.status(401);
          });
      });
    });

    it("Should get access when user is Admin and try to get users", async function () {
      await this.adminLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .get("/api/users/")
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
          });
      });
    });

  });
});
