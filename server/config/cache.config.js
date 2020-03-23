// node-cache
const NodeCache = require("node-cache");

let cache;

class CacheConfig {
  static init() {
    const stdTTL = process.env.CACHE_TTL;
    const checkperiod = process.env.checkperiod;
    cache = new NodeCache({ stdTTL, checkperiod, useClones: false });
  }

  static get() {
    return cache;
  }
}

module.exports = { CacheConfig };
