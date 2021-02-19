// node-cache
const NodeCache = require("node-cache");
const config = require("config");

let cache;

class CacheConfig {
  static init() {
    const stdTTL = config.get("cache.ttl");
    const checkPeriod = config.get("cache.checkPeriod");
    cache = new NodeCache({ stdTTL, checkPeriod, useClones: false });
  }

  static get() {
    return cache;
  }
}

module.exports = { CacheConfig };
