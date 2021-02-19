function getDbUri(config) {
  const dbHost = config.get("db.host");
  const dbPort = config.get("db.port");
  const dbName = config.get("db.name");
  const dbUsername = config.get("db.username");
  const dbPassword = config.get("db.password");
  const dbAuth = config.get("db.auth");

  return `mongodb://${
    dbUsername ? `${dbUsername}:${dbPassword}@` : ""
  }${dbHost}:${dbPort}/${dbName}${dbAuth ? `?authSource=${dbAuth}` : ""}`;
}

module.exports = { getDbUri };
