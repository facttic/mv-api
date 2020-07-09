const schedule = require('node-schedule');
const { getTweets } = require('../CRON/twitter');
const { cleanTweetsMedia } = require('../CRON/media_cleaner');
const { TweetCrawlStatusDAO } = require("../api/tweet_crawl_status/dao");
const { HashtagDAO } = require("../api/hashtag/dao");

class SchedulerConfig {
  static init() {
    if (process.env.MEDIA_CLEANER && process.env.MEDIA_CLEANER === "true") {
      schedule.scheduleJob(process.env.MEDIA_CLEANER_CRON_TIMELAPSE || "59 23 * * 0", async () => {
        try {
          cleanTweetsMedia(0);
          console.log("Clean tweets scheduled");
        } catch (err) {
          console.error(err);
        }
      });
    }

    if (process.env.TWITTER_CRON_ACTIVE && process.env.TWITTER_CRON_ACTIVE === "true") {
      return schedule.scheduleJob(`*/${process.env.TWITTER_CRON_TIMELAPSE || 5} * * * *`, async () => {
        try {
          const lastTweetCrawlStatus = await TweetCrawlStatusDAO.getLast();
          const hashtags = await HashtagDAO.getAll();

          let since_id = null;
          if (lastTweetCrawlStatus) {
            since_id = lastTweetCrawlStatus.tweet_id_str;
          }
          if (hashtags && hashtags.list && hashtags.list.length) {
            const hashtag_names = hashtags.list.map(h => h.name);
            return getTweets(since_id, null, hashtag_names);
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
