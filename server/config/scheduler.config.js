const schedule = require('node-schedule');
const { getTweets } = require('../CRON/twitter');
const { TweetCrawlStatusDAO } = require("../api/tweet_crawl_status/dao");
 
class SchedulerConfig {
  static init() {
    if (process.env.CRON_ACTIVE && process.env.CRON_ACTIVE === "true") {
      return schedule.scheduleJob("*/15 * * * *", async () => {
        const lastTweetCrawlStatus = await TweetCrawlStatusDAO.getLast();
        let since_id = null;
        if (lastTweetCrawlStatus) {
          since_id = lastTweetCrawlStatus.tweet_id_str;
        }
        getTweets(since_id, null);
      });
    } else {
      console.log(".env variable CRON_ACTIVE was not set to 'true' or undefined. CRON to fetch Tweets will not run.")
    }
  }
}

module.exports = { SchedulerConfig }
