/* eslint camelcase:0 */
const schedule = require("node-schedule");
// const heapdump = require('heapdump');
const { getTweets, resetTwitterCron } = require("../CRON/twitter");
const { getPosts, resetInstagramCron } = require("../CRON/instagram");
const { cleanTweetsMedia } = require("../CRON/media_cleaner");
const { PostCrawlStatusDAO } = require("../api/post_crawl_status/dao");
const { HashtagDAO } = require("../api/hashtag/dao");

const puppeteer = require("puppeteer");

const igUsername = process.env.INSTAGRAM_IMPERSONATE_USERNAME;
const igPassword = process.env.INSTAGRAM_IMPERSONATE_PASSWORD;

class SchedulerConfig {
  static async init() {
    // heapdump.writeSnapshot(function(err, filename) {
    //   console.log('Initial dump written to', filename);
    // });

    if (process.env.MEDIA_CLEANER && process.env.MEDIA_CLEANER === "true") {
      schedule.scheduleJob(process.env.MEDIA_CLEANER_CRON_SCHEDULE || "59 23 * * 0", async () => {
        try {
          cleanTweetsMedia(0);
          console.log("Clean tweets scheduled");
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      console.log(
        ".env variable MEDIA_CLEANER was not set to 'true' or undefined. CRON to clean medias will not run.",
      );
    }

    if (process.env.TWITTER_CRON_ACTIVE && process.env.TWITTER_CRON_ACTIVE === "true") {
      schedule.scheduleJob(`*/${process.env.TWITTER_CRON_TIMELAPSE || 5} * * * *`, async () => {
        // heapdump.writeSnapshot(function(err, filename) {
        //   console.log('Twitter dump written to', filename);
        // });

        try {
          const hashtags = await HashtagDAO.getBySource("twitter");
          const lastTweetCrawlStatus = await PostCrawlStatusDAO.getLast("twitter");

          let since_id = null;
          if (lastTweetCrawlStatus) {
            since_id = lastTweetCrawlStatus.post_id_str;
          }
          if (hashtags && hashtags.list && hashtags.list.length) {
            const hashtag_names = hashtags.list.map((h) => h.name);
            console.log(
              `Twitter CRON: running for a total of ${hashtag_names.length} hashtags.${
                since_id ? ` Starting at id: ${since_id}` : ""
              }`,
            );
            console.log(hashtag_names.join(", "));
            resetTwitterCron();
            return getTweets(since_id, null, hashtag_names);
          } else {
            console.log(
              "Twitter CRON: No hashtags are present in the DDBB. Please add some for the process to run.",
            );
          }
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      console.log(
        ".env variable TWITTER_CRON_ACTIVE was not set to 'true' or undefined. CRON to fetch Tweets will not run.",
      );
    }

    async function processHashtags(hashtags, page) {
      for (const hashtag of hashtags) {
        let since_id = null;
        const { name } = hashtag;
        const lastPostCrawlStatus = await PostCrawlStatusDAO.getLastByHashtag("instagram", name);
        if (lastPostCrawlStatus) {
          since_id = lastPostCrawlStatus.post_id_str;
        }
        console.log(
          `Instagram CRON: running for hashtag ${name}.${
            since_id ? ` Starting at id: ${since_id}` : ""
          }`,
        );
        resetInstagramCron();
        await getPosts(since_id, null, name, page);
      }
    }

    if (process.env.INSTAGRAM_CRON_ACTIVE && process.env.INSTAGRAM_CRON_ACTIVE === "true") {
      schedule.scheduleJob(`*/${process.env.INSTAGRAM_CRON_TIMELAPSE || 5} * * * *`, async () => {
        try {
          const hashtags = await HashtagDAO.getBySource("instagram");

          if (hashtags && hashtags.list && hashtags.list.length) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.setUserAgent(
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
            );

            await page.goto("https://www.instagram.com/accounts/login/", {
              waitUntil: "networkidle2",
            });

            await page.waitForSelector('input[name="username"]');
            await page.type('input[name="username"]', igUsername);
            await page.type('input[name="password"]', igPassword);
            await page.click('button[type="submit"]');
            // Add a wait for some selector on the home page to load to ensure the next step works correctly
            await page.waitForSelector(`img[alt="${igUsername}'s profile picture"]`);
            const result = await processHashtags(hashtags.list, page);

            console.log("closing browser");
            await browser.close();
            return result;
          } else {
            console.log(
              "Instagram CRON: No hashtags are present in the DDBB. Please add some for the process to run.",
            );
          }
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      console.log(
        ".env variable INSTAGRAM_CRON_ACTIVE was not set to 'true' or undefined. CRON to fetch Instagram posts will not run.",
      );
    }
  }
}

module.exports = { SchedulerConfig };
