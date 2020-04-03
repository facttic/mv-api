const axios = require('axios');
const { TweetDAO } = require("../api/tweet/dao");
const _ = require("lodash");

const limit = 1000;
const sort = "-_id";
let count = 0;

throttledLog = _.throttle(() => { console.log(`Processed ${count}`) }, 180000);

const verify404Url = async ({media, _id}) => {
  for (const m of media) {
    try {
      result = await axios.get(m.media_url_thumb)
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        console.log("[OK] Removed a tweet with _id:", _id);
        return TweetDAO.removeById(_id);
      }
      console.error("[NO-OK] An error ocurred at verify404Url for _id: ", _id, err.message, err.config && err.config.url);
    }
  }
}

const cleanTweetsMedia = async (currentPage) => {
  const skip = +limit * (+currentPage);
  const nextPage = ++currentPage;

  const tweets = await TweetDAO.getAll({ skip, limit, sort, query: {} });

  if (tweets && tweets.list && tweets.count) {
    console.log(`[OK] Cleaning tweets between ${tweets.list[0].tweet_created_at} and ${tweets.list[tweets.list.length - 1].tweet_created_at}`);
    for (const tweet of tweets.list) {
      count++;
      throttledLog();
      await verify404Url(tweet);
    }
    cleanTweetsMedia(nextPage);
  } else {
    console.log(`[OK] Finished cleaning ${count} tweets`);
  }
}

module.exports = { cleanTweetsMedia };
