const WeedClient = require("node-seaweedfs");

class SeaweedFs {
  constructor() {
    const server = process.env.SEAWEEDFS_MAIN_SERVER || "localhost";
    const port = process.env.SEAWEEDFS_MAIN_PORT || 9333;
    this.client = new WeedClient({ server, port });
  }
}

module.exports = { SeaweedFs };
