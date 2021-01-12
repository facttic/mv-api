const mongoose = require("mongoose");

class DBConfig {
  static init() {
    const DB_URI = process.env.MONGODB_URI;

    mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      autoIndex: process.env.NODE_ENV === "development",
      useUnifiedTopology: true,
    });
    mongoose.connection.on("error", (error) => {
      console.error(error);
    });
  }
}

module.exports = { DBConfig };
