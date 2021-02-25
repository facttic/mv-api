/* eslint-disable no-unused-expressions */
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("User endpoints", () => {
  context("login", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", { password: "1234abcd" });
    });

    it("Should login and return 200 and a token if a existing username and password are provided", async function () {
      const { email } = this.user;

      await chai
        .request(app)
        .post("/api/users/login")
        .send({ email, password: "1234abcd" })
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });

    it("Should return 404 when trys login with a wrong password", async function () {
      await chai
        .request(app)
        .post("/api/users/login")
        .send({ email: "wrong", password: "wrong" })
        .then((res) => {
          expect(res).to.have.status(401);
        });
    });
  });
  context("managment", () => {
    beforeEach(async function () {
      this.user = await factories.create("user", {superadmin: false, password: "1234abcd" });
      this.admin = await factories.create("user", {
        email: "su@admin.com",
        superadmin: true,
        password: "adm1234abcd",
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
      const { email } = this.user;
      let agent = chai.request.agent(app);
      await agent
        .post("/api/users/login")
        .send({ email, password: "1234abcd" })
        .then(async function (res) {
          expect(res).to.have.status(200);
          const token = "Bearer " + res.body.token.toString();
          return agent
            .post("/api/users")
            .set("Authorization", token)
            .send(newUser)
            .then((res) => {
              expect(res).to.have.status(401);
            });
        });
      agent.close();
    });

    it("Should permit create new user when is admin", async function () {
      const newUser = await factories.attrs("user");
      const email = "su@admin.com";
      const password = "adm1234abcd";
      let agent = chai.request.agent(app);
      await agent
        .post("/api/users/login")
        .send({ email, password})
        .then(async function (res) {
          expect(res).to.have.status(200);
          const token = "Bearer " + res.body.token.toString();
          return agent
            .post("/api/users")
            .set("Authorization", token)
            .send(newUser)
            .then((res) => {
              expect(res).to.be.json;
              expect(res).to.have.status(201);
            });
        });
      agent.close();
    });
  });
});
