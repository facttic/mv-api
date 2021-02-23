const dbHandler = require("mv-models");

exports.mochaHooks = {
  afterEach: async () => await dbHandler.clear(),
  afterAll: async () => await dbHandler.close(),
};
