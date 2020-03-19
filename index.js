require("dotenv").config();
require("./server/server");

const Twitter = require("twit");
const Big = require("big-js");

const maxTweets = 200;
const tweetsPerQuery = 100;

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

let options = {
  q: "#MesDeLamemoria OR #24DeMarzo OR #ConstruimosMemoria -filter:retweets -filter:replies filter:images",
  tweet_mode: "extended",
  count: tweetsPerQuery,
  include_entities: true,
};

let tweetCount = 0;

const getTweets = (maxId) => {
  if (maxId) {
    options['max-id'] = Big(maxId).minus(1).toString();
  }
  console.log(options);
  client.get(
    "search/tweets",
    options,
    function(error, tweets, response) {
      if (error) {
        console.log(`Processed ${tweetCount}. And got an error.`);
        console.error(error);
        return;
      }
      if (tweets.statuses.length === 0) {
        console.log(`No more tweets. Totals ${tweetCount}.`);
        return;
      }

      const { statuses } = tweets;

      statuses.forEach(function(tweet) {
        if (
          tweet.entities &&
          tweet.entities.media &&
          tweet.entities.media.length > 0
        ) {
          tweet.entities.media.forEach(function(m) {
            // console.log(m.media_url);
          });
          tweetCount++;
        }
      });
      console.log(statuses[statuses.length - 1].id);
      getTweets(statuses[statuses.length - 1].id);
    }
  );
}

if (process.env.CRON_ACTIVE && process.env.CRON_ACTIVE === "true") {
  getTweets(null);
} else {
  console.log(".env CRON_ACTIVE not set to 'false' or undefined. CRON to fetch Tweets will not run.")
}
