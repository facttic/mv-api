// node-cache
const NodeCache = require("node-cache");

let cache;

class CacheConfig {
  static init() {
    const stdTTL = process.env.CACHE_TTL;
    const checkPeriod = process.env.CACHE_CHECKPERIOD;
    cache = new NodeCache({ stdTTL, checkPeriod, useClones: false });
  }

  static get() {
    return cache;
  }
}

module.exports = { CacheConfig };
