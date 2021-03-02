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
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email:this.user.email, password:"1234abcd" })
        .then((res) => {
          return "Bearer " + res.body.token.toString();
        });
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

    it("Should return 201 when trys get profile", async function () {
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .post("/api/users/me")
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(201);
          });
      });
    });

    it("Should return 200 when trys logoutall", async function () {
      await this.userLogin().then(async function (res) {
        expect(res).to.have.status(200);
        const token = "Bearer " + res.body.token.toString();
        return await chai
          .request(app)
          .post("/api/users/me/logoutall")
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.have.status(200);
          });
      });
    });

    it("Should return 401 error when trys logout without token", async function () {
      await chai
        .request(app)
        .post("/api/users/me/logout")
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should return error when use an invalid token", async function () {
      const token = this.userToken        
      await chai
      .request(app)
      .post("/api/users/me/logout")
      .set("Authorization", token)
      .then(async (res) => {
        return await chai
          .request(app)
          .post("/api/users/me")
          .set("Authorization", token)
          .then((res) => {
            expect(res).to.have.status(401);
          });
      });
    });
  });
  context("update", () => {
    beforeEach(async function () {
      this.manifestation = await factories.create("manifestation");
      this.user = await factories.create("user", {
        superadmin: false,
        password: "1234abcd",
        manifestation_id: this.manifestation._id,
      });
      this.admin = await factories.create("user", {
        email: "su@admin.com",
        superadmin: true,
        password: "adm1234abcd",
      });
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
      this.adminToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.admin.email, password: "adm1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });

    it("Shouldn't update when trys set superadmin to user is with manifestation", async function () {
      const user = this.user;
      user.superadmin = true;
      const token = this.adminToken;
      await chai
        .request(app)
        .put("/api/users/" + user.id)
        .set("Authorization", token)
        .send(user)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(404);
        });
    });

    it("Should update when user is not an admin", async function () {
      const user = this.user;
      user.name = "edited name";
      const userId = this.user._id;
      const token = this.userToken;
      await chai
        .request(app)
        .put("/api/users/" + userId)
        .set("Authorization", token)
        .send(user)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });

    it("Should update when user is admin", async function () {
      const user = this.user;
      user.name = "edited name";
      const token = this.adminToken;
      await chai
        .request(app)
        .put("/api/users/" + user.id)
        .set("Authorization", token)
        .send(user)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });

    it("Should fail update when data has not id", async function () {
      const newUser = await factories.attrs("user");
      const { id } = this.user;
      const token = this.adminToken;
      await chai
        .request(app)
        .put("/api/users/" + id)
        .set("Authorization", token)
        .send(newUser)
        .then((res) => {
          expect(res).to.have.status(400);
        });
    });
  });

  context("create", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { superadmin: false, password: "1234abcd" });
      this.admin = await factories.create("user", {
        email: "su@admin.com",
        superadmin: true,
        password: "adm1234abcd",
      });
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
      this.adminToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.admin.email, password: "adm1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
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
      const token = this.userToken;
      await chai
        .request(app)
        .post("/api/users")
        .set("Authorization", token)
        .send(newUser)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should permit create new user when is admin", async function () {
      const newUser = await factories.attrs("user");
      const token = this.adminToken;
      await chai
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

  context("delete", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { superadmin: false, password: "1234abcd" });
      this.admin = await factories.create("user", {
        email: "su@admin.com",
        superadmin: true,
        password: "adm1234abcd",
      });
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
      this.adminToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.admin.email, password: "adm1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });
    it("Shouldn't delete user is not an admin", async function () {
      const userId = this.user._id;
      const token = this.userToken;
      await chai
        .request(app)
        .delete("/api/users/" + userId)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should delete user is an admin", async function () {
      const userId = this.user._id;
      const token = this.adminToken;
      await chai
        .request(app)
        .delete("/api/users/" + userId)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });
  });

  context("get", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { superadmin: false, password: "1234abcd" });
      this.admin = await factories.create("user", {
        email: "su@admin.com",
        superadmin: true,
        password: "adm1234abcd",
      });
      this.userToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.user.email, password: "1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
      this.adminToken = await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: this.admin.email, password: "adm1234abcd" })
        .then(async function (res) {
          return "Bearer " + res.body.token.toString();
        });
    });
    it("Should fail when user is not Admin and try to get users", async function () {
      const token = this.userToken;
      await chai
        .request(app)
        .get("/api/users/")
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });

    it("Should get 200 when trys to get one user", async function () {
      const token = this.adminToken;
      const id = this.user._id;
      await chai
        .request(app)
        .get("/api/users/" + id)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });

    it("Should get 404 when trys to get non existent user", async function () {
      const token = this.adminToken;
      const id = "603d479df7f5bc3e2c345dc0";
      await chai
        .request(app)
        .get("/api/users/" + id)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(404);
        });
    });

    it("Should get access when user is Admin and try to get users", async function () {
      const token = this.adminToken;
      await chai
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
