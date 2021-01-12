const axios = require("axios");
const { PostDAO } = require("mv-models");
const _ = require("lodash");

const limit = 1000;
const sort = "-_id";
let count = 0;

const throttledLog = _.throttle(() => {
  console.log(`Processed ${count}`);
}, 180000);

const verify404Url = async ({ media, _id }) => {
  for (const m of media) {
    try {
      await axios.get(m.media_url_thumb);
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 403)) {
        console.log("[OK] Removed a post with _id:", _id);
        return PostDAO.removeById(_id);
      }
      console.error(
        "[NO-OK] An error ocurred at verify404Url for _id: ",
        _id,
        err.message,
        err.config && err.config.url,
      );
    }
  }
};

const cleanPostsMedia = async (currentPage) => {
  const skip = +limit * +currentPage;
  const nextPage = ++currentPage;

  const posts = await PostDAO.getAll({ skip, limit, sort, query: {} });

  if (posts && posts.list && posts.count) {
    console.log(
      `[OK] Cleaning posts between ${posts.list[0].post_created_at} and ${
        posts.list[posts.list.length - 1].post_created_at
      }`,
    );
    for (const post of posts.list) {
      count++;
      throttledLog();
      await verify404Url(post);
    }
    cleanPostsMedia(nextPage);
  } else {
    console.log(`[OK] Finished cleaning ${count} posts`);
  }
};

module.exports = { cleanPostsMedia };
