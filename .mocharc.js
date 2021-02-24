const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require("chai-http");

chai.use(chaiAsPromised);
chai.use(chaiHttp);
process.env.NODE_ENV = "test";

module.exports = {
  require: ["test/hooks.js", "chai/register-expect"],
  recursive: true,
  reporter: "dot",
};
