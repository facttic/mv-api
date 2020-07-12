const axios = require("axios");
const bigInt = require("big-integer");

const { PostDAO } = require("../api/post/dao");
const { PostUserDAO } = require("../api/post_user/dao");
const { DenyListDAO } = require("../api/deny_list/dao");
const { PostCrawlStatusDAO } = require("../api/post_crawl_status/dao");

const maxPosts = process.env.INSTAGRAM_CRAWLER_MAX_POSTS || 1400;
let postCount = 0;

const processEdges = async (edges, sinceId) => {
  const myArrayOfPosts = [];
  for (const edge of edges) {
    const { node } = edge;
    const denyListed = await DenyListDAO.isDenyListed(node.owner.id);
    if (!denyListed) {
      if (bigInt(node.id).lesserOrEquals(sinceId)) {
        return { myArrayOfPosts, foundLast: true };
      }
      const myUsefulPost = {
        post_created_at: node.taken_at_timestamp,
        post_id_str: node.id,
        full_text: node.edge_media_to_caption &&
          node.edge_media_to_caption.edges &&
          node.edge_media_to_caption.edges.length ? node.edge_media_to_caption.edges[0].node.text : "",
        hashtags: [],
        media: [{
          media_url: node.display_url,
          media_url_https: node.display_url,
          media_url_thumb: node.thumbnail_resources[0].src,
          media_url_small: node.thumbnail_resources[1].src,
          media_url_medium: node.thumbnail_resources[2].src,
          media_url_large:  node.thumbnail_resources[3].src,
          sizes: {
            source: {
              w: node.dimensions.width,
              h: node.dimensions.height,
              resize: "fit",
            },
            thumb: {
              w: node.thumbnail_resources[0].config_width,
              h: node.thumbnail_resources[0].config_height,
              resize: "crop",
            },
            small: {
              w: node.thumbnail_resources[1].config_width,
              h: node.thumbnail_resources[1].config_height,
              resize: "crop",
            },
            medium: {
              w: node.thumbnail_resources[2].config_width,
              h: node.thumbnail_resources[2].config_height,
              resize: "crop",
            },
            large: {
              w: node.thumbnail_resources[3].config_width,
              h: node.thumbnail_resources[3].config_height,
              resize: "crop",
            }
          }
        }],
        user: {
          id_str: node.owner.id,
          name: "",
          screen_name: "",
          location: "",
          profile_image_url: "",
          profile_image_url_https: `https://instagram.com/p/${node.shortcode}`
        },
        geo: "",
        coordinates: ""
      };

      myUsefulPost.source = "instagram";
      myArrayOfPosts.push(myUsefulPost);
      postCount++;
    }
  }
  return { myArrayOfPosts, foundLast: false };
}

const getPosts = async(sinceId, maxId, hashtag) => {
  let url = `https://www.instagram.com/explore/tags/${hashtag}/?__a=1`;

  if (maxId) {
    url += `&max_id=${maxId}`;
  }

  axios.get(url)
    .then(async ({ data }) => {
      const { graphql } = data;
      if (graphql.hashtag.edge_hashtag_to_media.count === 0) {
        return;
      }
      if (postCount >= maxPosts) {
        console.log(`Hit maxPosts soft limit. Totals ${postCount}.`);
        return;
      }

      const { page_info } = graphql.hashtag.edge_hashtag_to_media;
      const { edges } = graphql.hashtag.edge_hashtag_to_media;
      const { myArrayOfPosts, foundLast } = await processEdges(edges, sinceId);

      if (myArrayOfPosts.length) {
        PostDAO.insertMany(myArrayOfPosts)
        .then(async postResults => {
          const { id: id_str_top, taken_at_timestamp: post_created_at } = edges[0].node;
          
          const insertedPostCrawlStatus = await PostCrawlStatusDAO.createNew({ post_id_str: id_str_top, post_created_at, source: "instagram" });
          let users;
          if(page_info.has_next_page && !foundLast) {
            return getPosts(sinceId, page_info.end_cursor, hashtag);
          } else {
            users = await PostUserDAO.saveCount();
          }

          console.log(`We're still fetching posts! Inserted ${postResults.insertedCount}. Total users: ${users && users.count}`);
        })
        .catch(err => {
          console.log("Something failed at saving many. And got the error below");
          console.error(err);
        });
      } else {
        console.log("We're still fetching posts! But there was nothing new.");
      }
    })
    .catch((err) => {
      console.log(`Processed ${postCount}. And got the error below. With the following url: ${url}`);
      console.error(err);
      return;
    });
};

module.exports = { getPosts };
