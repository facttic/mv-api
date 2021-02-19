const WeedClient = require("node-seaweedfs");

let seaweedfs;

class SeaweedConfig {
  static init() {
    const server = process.env.SEAWEEDFS_MAIN_SERVER || "localhost";
    const port = process.env.SEAWEEDFS_MAIN_PORT || 9333;
    seaweedfs = new WeedClient({ server, port });
    return seaweedfs;
  }

  static get() {
    return seaweedfs;
  }
}

module.exports = { SeaweedConfig };
