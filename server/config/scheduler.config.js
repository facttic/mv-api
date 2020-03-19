const schedule = require('node-schedule');
const { getTweets } = require('../CRON/twitter');
 
class SchedulerConfig {
  static init() {
    if (process.env.CRON_ACTIVE && process.env.CRON_ACTIVE === "true") {
      return schedule.scheduleJob('10 * * * *', () => {
        getTweets(null);
      });
    } else {
      console.log(".env variable CRON_ACTIVE was not set to 'true' or undefined. CRON to fetch Tweets will not run.")
    }
  }
}

module.exports = { SchedulerConfig }
