const schedule = require('node-schedule');
const { getTweets } = require('../CRON/twitter');
const { TweetCrawlStatusDAO } = require("../api/tweet_crawl_status/dao");
const { HashtagDAO } = require("../api/hashtag/dao");

class SchedulerConfig {
  static init() {
    if (process.env.CRON_ACTIVE && process.env.CRON_ACTIVE === "true") {
      return schedule.scheduleJob(`*/${process.env.CRON_TIMELAPSE || 5} * * * *`, async () => {
        try {
          const lastTweetCrawlStatus = await TweetCrawlStatusDAO.getLast();
          const hashtags = await HashtagDAO.getAll();

          let since_id = null;
          if (lastTweetCrawlStatus) {
            since_id = lastTweetCrawlStatus.tweet_id_str;
          }
          if (hashtags && hashtags.list && hashtags.list.length) {
            const hashtag_names = hashtags.list.map(h => h.name);
            getTweets(since_id, null, hashtag_names);
          } else {
            console.log("No hashtags are present in the DDBB. Please add some for the process to run.")
          }
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      console.log(".env variable CRON_ACTIVE was not set to 'true' or undefined. CRON to fetch Tweets will not run.")
    }
  }
}

module.exports = { SchedulerConfig }
