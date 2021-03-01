const { expect } = require("chai");
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("manifestation", async function () {
  context("obtain_all", async function () {
    it("Should return 200 when trys to get manifestations", async function () {
      await chai
        .request(app)
        .get("/api/manifestations")
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });
  });

  context("create", async function () {
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
    it("Should return 201 when admin try to create manifestation", async function () {
      const newManifestation = await factories.attrs("manifestation");
      const token = this.adminToken;
      await chai
        .request(app)
        .post("/api/manifestations")
        .set("Authorization", token)
        .send(newManifestation)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });
    it("Should return 401 when user try to create manifestation", async function () {
      const newManifestation = await factories.attrs("manifestation");
      const token = this.userToken;
      await chai
        .request(app)
        .post("/api/manifestations")
        .set("Authorization", token)
        .send(newManifestation)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
        });
    });
  });

  context("get_one", async function () {
    beforeEach(async function () {
      this.manifestation = await factories.create("manifestation");
    });
    it("Should return 200 when trys to get one manifestation", async function () {
      const id = this.manifestation._id;
      await chai
        .request(app)
        .get("/api/manifestations/" + id)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });
  });

  context("update", async function () {
    beforeEach(async function () {
      this.manifestation = await factories.create("manifestation");
      this.manifestationWithoutUser = await factories.create("manifestation");
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

    it("Should return 200 when user trys to update manifestation", async function () {
      const manifestationEdit = this.manifestation;
      const id = manifestationEdit._id;
      manifestationEdit.title = "edit";
      const token = this.userToken;
      await chai
        .request(app)
        .put("/api/manifestations/" + id)
        .set("Authorization", token)
        .send(manifestationEdit)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });

    it("Should return 401 when user trys to update manifestation that not has permission to update", async function () {
      const manifestationEdit = this.manifestationWithoutUser;
      const id = manifestationEdit._id;
      manifestationEdit.title = "edit";
      const token = this.userToken;
      await chai
        .request(app)
        .put("/api/manifestations/" + id)
        .set("Authorization", token)
        .send(manifestationEdit)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(403);
        });
    });

    it("Should return 201 when superadmin trys to update manifestation", async function () {
      const manifestationEdit = this.manifestation;
      const id = manifestationEdit._id;
      manifestationEdit.title = "edit";
      const token = this.adminToken;
      await chai
        .request(app)
        .put("/api/manifestations/" + id)
        .set("Authorization", token)
        .send(manifestationEdit)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });

    it("Should return 401 when not logged user trys to update manifestation", async function () {
      const manifestationEdit = this.manifestation;
      const id = manifestationEdit._id;
      manifestationEdit.title = "edit";
      await chai
        .request(app)
        .put("/api/manifestations/" + id)
        .send(manifestationEdit)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
        });
    });

    it("Should return 201 when superadmin trys to update manifestation with a form", async function () {
      const id = this.manifestation._id
      const token = this.adminToken;
      //Este test solo trata de generar un form con 1 campo valido, debido a que el constructor del form
      //de chai es incompatible con el formato enviado del admin y esperado por el endpoint
      //Chai arma estructuras como 'sponsors[0][name]': 'Diebold Incorporated'
      //Admin arma estrutrucas como 'sponsors.0.name': 'Diebold Incorporated',
      //Por lo tanto dejando incompatible el parser del update excepto por estructuras simples como name: 'Amy Fuller' 
      await chai
        .request(app)
        .put("/api/manifestations/" + id)
        .type('form')
        .set("Authorization", token)
        .send({title:"algo"})
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
        });
    });
  });

  context("delete", async function () {
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
    it("Should return 200 when admin delete one manifestation", async function () {
      const id = this.manifestation._id;
      const token = this.adminToken;
      await chai
        .request(app)
        .delete("/api/manifestations/" + id)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
        });
    });

    it("Should return 401 when user try delete one manifestation", async function () {
      const id = this.manifestation._id;
      const token = this.userToken;
      await chai
        .request(app)
        .delete("/api/manifestations/" + id)
        .set("Authorization", token)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
        });
    });

    it("Should return 401 when not logged user try delete one manifestation", async function () {
      const id = this.manifestation._id;
      await chai
        .request(app)
        .delete("/api/manifestations/" + id)
        .then((res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
        });
    });
  });
});
