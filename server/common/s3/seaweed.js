const WeedClient = require("node-seaweedfs");
const { LoggerConfig } = require("../logger");

class SeaweedFs {
  constructor() {
    const server = process.env.SEAWEEDFS_MAIN_SERVER || "localhost";
    const port = process.env.SEAWEEDFS_MAIN_PORT || 9333;
    this.client = new WeedClient({ server, port });
    process.env.NODE_ENV !== "test" &&
      LoggerConfig.getChild("seaweed.js").info(`Seaweed client connected to ${server}:${port}`);
  }
}

module.exports = { SeaweedFs };
