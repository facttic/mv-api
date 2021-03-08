const { expect } = require("chai");
const sinon = require("sinon");
const { shapeQuery } = require("../../../server/api/middleware/shape-query");
const { ManifestationDAO } = require("mv-models");

const mockResponse = () => {
  const res = {};
  res.statusCode = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe("shape_query", () => {
  it("should pass if query is valid and add shapedQuery to req", async () => {
    const mockRequest = (query) => ({
      query,
    });
    const req = mockRequest({ perPage: 1, page: 1, sortBy: "_id", select: undefined });
    const res = mockResponse();
    const next = sinon.stub();
    const shape = shapeQuery(ManifestationDAO.schema);
    shape(req, res, next);
    sinon.assert.calledOnce(next);
    expect(req).to.be.an("object").that.has.property("shapedQuery");
  });

  it("should raise ValidationError if query has invalid page property", async () => {
    const mockRequest = (query) => ({
      query,
    });
    const req = mockRequest({ perPage: 1, page: "a", sortBy: "_id", select: undefined });
    const res = mockResponse();
    const next = sinon.stub();
    const shape = shapeQuery(ManifestationDAO.schema);
    shape(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("ValidationError");
  });

  it("should raise ValidationError if query has invalid perPage property", async () => {
    const mockRequest = (query) => ({
      query,
    });
    const req = mockRequest({ perPage: "a", page: 1, sortBy: "_id", select: undefined });
    const res = mockResponse();
    const next = sinon.stub();
    const shape = shapeQuery(ManifestationDAO.schema);
    shape(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("ValidationError");
  });

  it("should raise ValidationError if query has invalid sortBy property", async () => {
    const mockRequest = (query) => ({
      query,
    });
    const req = mockRequest({ perPage: 1, page: 1, sortBy: "a_property", select: undefined });
    const res = mockResponse();
    const next = sinon.stub();
    const shape = shapeQuery(ManifestationDAO.schema);
    shape(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("ValidationError");
  });

  it("should raise ValidationError if query has invalid extra field property", async () => {
    const mockRequest = (query) => ({
      query,
    });
    const req = mockRequest({
      perPage: 1,
      page: 1,
      sortBy: "_id",
      select: undefined,
      a_field: "a field",
    });
    const res = mockResponse();
    const next = sinon.stub();
    const shape = shapeQuery(ManifestationDAO.schema);
    shape(req, res, next);
    sinon.assert.calledOnce(next);
    expect(next.getCall(0).args[0])
      .to.be.an("error")
      .that.has.property("name")
      .which.equals("ValidationError");
  });

  it("should pass if query has valid extra field property", async () => {
    const mockRequest = (query) => ({
      query,
    });
    const req = mockRequest({
      perPage: 1,
      page: 1,
      sortBy: "_id",
      select: undefined,
      name: "a name",
    });
    const res = mockResponse();
    const next = sinon.stub();
    const shape = shapeQuery(ManifestationDAO.schema);
    shape(req, res, next);
    sinon.assert.calledOnce(next);
    expect(req)
      .to.be.an("object")
      .that.has.property("shapedQuery")
      .to.be.an("object")
      .that.has.property("query");
  });
});
