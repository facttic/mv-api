const { expect } = require("chai");
const sinon = require("sinon");
const { manifestationChild } = require("../../../server/api/middleware/manifestation-child");

const mockResponse = () => {
  const res = {};
  res.statusCode = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe("manifestation_child", () => {
  it("should return validation error if query doenst have manifestationID", async () => {
    const mockRequest = () => ({
      query: {},
    });
    const req = mockRequest();
    const res = mockResponse();
    const next = sinon.stub();
    await manifestationChild(req, res, next);

    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("ValidationError");
  });

  it("should alter request if query have manifestationID", async () => {
    const mockRequest = () => ({
      query: { manifestationId: "6043e917673b6432481adba2" },
      params: {},
    });
    const req = mockRequest();
    const res = mockResponse();
    const next = sinon.stub();
    await manifestationChild(req, res, next);

    sinon.assert.calledOnce(next);
    expect(req)
      .to.be.an("object")
      .that.has.property("params")
      .to.be.an("object")
      .that.has.property("manifestationId")
      .which.equals("6043e917673b6432481adba2");
    expect(req).to.be.an("object").that.not.has.property("manifestationId");
  });
});
