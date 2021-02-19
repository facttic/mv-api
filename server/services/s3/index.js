const { SeaweedConfig } = require("./seaweed");
let s3;

function init(provider) {
  switch (provider) {
    case "seaweed":
      s3 = SeaweedConfig.init();
      break;
    default:
      throw new Error("S3 provider does not exist");
  }
}

module.exports = { init, s3 };
