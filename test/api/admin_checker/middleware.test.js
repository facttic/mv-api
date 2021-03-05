const { expect } = require("chai");
const sinon = require("sinon");
const { adminChecker } = require("../../../server/api/middleware/admin-checker");

const mockResponse = () => {
  const res = {};
  res.statusCode = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe("adminChecker", () => {
  it("should 401 if superadmin is false", async () => {
    const mockRequest = (user) => ({
      user,
    });
    const req = mockRequest({ superadmin: false });
    const res = mockResponse();
    const next = sinon.stub();
    await adminChecker(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("AuthenticationError");
  });
});
