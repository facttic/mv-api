const axios = require('axios');
const { TweetDAO } = require("../api/tweet/dao");

const limit = 1000;
const sort = "-tweet_id_str";
let count = 0;

const verify404Url = async ({media, _id}) => {
  for (const m of media) {
    try {
      const result = await axios.get(m.media_url_thumb);
      if (result.status === 404) {
        return TweetDAO.removeById(_id);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return TweetDAO.removeById(_id);
      }
      // console.error(err);
    }
  }
  return false;
}

const cleanTweetsMedia = async (currentPage) => {
  const skip = +limit * (+currentPage - 1);
  const nextPage = currentPage++;
  
  const tweets = await TweetDAO.getAll({ skip, limit, sort, query: {} });

  if (tweets && tweets.list && tweets.list.length) {
    for (const tweet of tweets.list) {
      count++;
      console.log(`Running ${count}. With ${tweet.media.length}`);
      verify404Url(tweet);
    }
    return cleanTweetsMedia(nextPage);
  } else {
    console.log(`Finished cleaning ${count} tweets`);
  }
}

module.exports = { cleanTweetsMedia };
