/* eslint camelcase:0 */
const Twitter = require("twitter");
const { PostDAO } = require("mv-models");
const { PostUserDAO } = require("../api/post_user/dao");
const { DenyListDAO } = require("../api/deny_list/dao");
const { PostCrawlStatusDAO } = require("../api/post_crawl_status/dao");

const maxTweets = process.env.TWITTER_CRAWLER_MAX_TWEETS || 1400;
const tweetsPerQuery = process.env.TWITTER_CRAWLER_MAX_TWEETS_PER_QUERY || 100;

const splitString = (value, index) => {
  return [value.substring(0, index), value.substring(index)];
};

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

let tweetCount = 0;

const resetTwitterCron = () => {
  tweetCount = 0;
};

const options = {
  tweet_mode: "extended",
  count: tweetsPerQuery,
  include_entities: true,
};

const processStatuses = async (statuses) => {
  const myArrayOfTweets = [];
  for (const tweet of statuses) {
    const denyListed = await DenyListDAO.isDenyListed(tweet.user.id_str);
    if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0 && !denyListed) {
      const myUsefulTweet = {
        post_created_at: parseInt(Date.parse(tweet.created_at) / 1000),
        post_id_str: tweet.id_str,
        full_text: tweet.full_text,
        hashtags: [],
        media: [],
        user: {
          id_str: tweet.user.id_str,
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          location: tweet.user.location,
          profile_image_url: tweet.user.profile_image_url,
          profile_image_url_https: tweet.user.profile_image_url_https,
        },
        geo: tweet.geo,
        coordinates: tweet.coordinates,
      };
      tweet.entities.media.forEach(function (m) {
        // eslint-disable-next-line no-useless-escape
        const [baseUrl, format] = m.media_url_https.split(/\.(?=[^\.]+$)/);
        myUsefulTweet.media.push({
          media_url: m.media_url,
          media_url_https: m.media_url_https,
          media_url_thumb: `${baseUrl}?format=${format}&name=thumb`,
          media_url_small: `${baseUrl}?format=${format}&name=small`,
          media_url_medium: `${baseUrl}?format=${format}&name=medium`,
          media_url_large: `${baseUrl}?format=${format}&name=large`,
          sizes: m.sizes,
        });
      });
      if (tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {
        tweet.entities.hashtags.forEach(function (h) {
          myUsefulTweet.hashtags.push(h.text);
        });
      }
      myUsefulTweet.source = "twitter";
      myArrayOfTweets.push(myUsefulTweet);
      tweetCount++;
    }
  }
  return myArrayOfTweets;
};

const getTweets = async (sinceId, maxId, hashtags) => {
  if (sinceId) {
    options.since_id = sinceId;
    delete options.max_id;
  } else if (maxId) {
    const maxIdLength = maxId.length;
    const [start, end] = splitString(maxId, maxIdLength - 4);
    const endInt = parseInt(end) - 1;
    options.max_id = `${start}${endInt}`;
  }

  options.q = `${hashtags.join(" OR ")} -filter:retweets -filter:replies filter:images`;

  client.get("search/tweets", options, async function (error, tweets, response) {
    if (error) {
      console.log(
        `Processed ${tweetCount}. And got the error below. With the following options: ${JSON.stringify(
          options,
        )}`,
      );
      console.error(error);
      return;
    }
    if (tweets.statuses.length === 0) {
      console.log("We're still fetching tweets! But there was nothing new.");
      return;
    }
    if (tweetCount >= maxTweets) {
      console.log(`Hit maxTweets soft limit. Totals ${tweetCount}.`);
      return;
    }

    const { statuses } = tweets;
    const myArrayOfTweets = await processStatuses(statuses);

    PostDAO.insertMany(myArrayOfTweets)
      .then(async (tweetResults) => {
        const { id_str: id_str_bottom } = statuses[statuses.length - 1];
        const { id_str: id_str_top, created_at: created_at_top } = statuses[0];

        await PostCrawlStatusDAO.createNew({
          post_id_str: id_str_top,
          post_created_at: created_at_top,
          source: "twitter",
        });
        let users;
        if (!sinceId) {
          return getTweets(sinceId, id_str_bottom, hashtags);
        } else {
          users = await PostUserDAO.saveCount();
        }
        console.log(
          `We're still fetching tweets! Inserted ${tweetResults.insertedCount}. Total users: ${
            users && users.count
          }`,
        );
      })
      .catch((err) => {
        console.log("Something failed at saving many. And got the error below");
        console.error(err);
      });
  });
};

module.exports = { getTweets, resetTwitterCron };
