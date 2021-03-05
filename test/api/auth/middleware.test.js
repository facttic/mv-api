const { expect } = require("chai");
const sinon = require("sinon");
const { auth } = require("../../../server/api/middleware/auth");
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

const mockResponse = () => {
  const res = {};
  res.statusCode = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe("auth", () => {
  beforeEach(async function () {
    this.admin = await factories.create("user", { superadmin: true, password: "adm1234abcd" });
    this.user = await factories.create("user", { superadmin: false, password: "1234abcd" });
    this.userToken = await chai
      .request(app)
      .post("/api/users/login")
      .send({ email: this.user.email, password: "1234abcd" })
      .then(async function (res) {
        return "Bearer " + res.body.token.toString();
      });
  });

  it("should next pass if token is valid", async function () {
    const mockRequest = (header, user, token) => ({
      header,
      user,
      token,
    });
    const req = mockRequest(() => this.userToken, {}, {});
    const res = mockResponse();
    const next = sinon.stub();
    await auth(req, res, next);
    sinon.assert.calledOnce(next);
    expect(req)
      .to.be.an("object")
      .that.has.property("user")
      .to.be.an("object")
      .that.has.property("name")
      .which.equals(this.user.name);
    expect(next.getCall(0).args[0]).to.be.equal(undefined);
  });

  it("should return AuthenticationError if token is invalid", async function () {
    const token =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDQyOTJjZDcxMDkxZTRmYThiYjY0MzMiLCJpYXQiOjE2MTQ5NzU2OTN9.Cv_6B3jiwT7KvbVjD2J4ufGy3SrZZPMLrjwfI6JrOdM";
    const mockRequest = (header, user, token) => ({
      header,
      user,
      token,
    });
    const req = mockRequest(() => token, {}, {});
    const res = mockResponse();
    const next = sinon.stub();
    await auth(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("AuthenticationError");
  });

  it("should return AuthenticationError if token is not present", async function () {
    const mockRequest = (header, user, token) => ({
      header,
      user,
      token,
    });
    const req = mockRequest(() => undefined, {}, {});
    const res = mockResponse();
    const next = sinon.stub();
    await auth(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("AuthenticationError");
  });
});
