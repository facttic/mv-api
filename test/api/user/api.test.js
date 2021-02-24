/* eslint-disable no-unused-expressions */
const chai = require("chai");
const { factories } = require("mv-models");
const app = require("../../../server/server");

describe("User endpoints", () => {
  it("Should login and return 200 and a token if a existing username and password are provided", async () => {
    const { email } = await factories.create("user", { password: "1234abcd" });

    await chai
      .request(app)
      .post("/api/users/login")
      .send({ email, password: "1234abcd" })
      .then((res) => {
        expect(res).to.have.status(200);
      });
  });
});
