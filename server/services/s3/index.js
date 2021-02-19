const { SeaweedFs } = require("./seaweed");
let s3;

function init(provider) {
  switch (provider) {
    case "seaweed":
      s3 = new SeaweedFs();
      break;
    default:
      throw new Error("S3 provider does not exist");
  }
}

module.exports = { init, s3 };
