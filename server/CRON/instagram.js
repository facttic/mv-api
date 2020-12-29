const axios = require("axios");
const bigInt = require("big-integer");

const { PostDAO } = require("../api/post/dao");
const { PostUserDAO } = require("../api/post_user/dao");
const { DenyListDAO } = require("../api/deny_list/dao");
const { PostCrawlStatusDAO } = require("../api/post_crawl_status/dao");

const { SeaweedConfig } = require("../config/seaweed.config");

const maxPosts = process.env.INSTAGRAM_CRAWLER_MAX_POSTS || 1400;

const igUsername = process.env.INSTAGRAM_IMPERSONATE_USERNAME;
const igPassword = process.env.INSTAGRAM_IMPERSONATE_PASSWORD;

let postCount = 0;
let insertedCrawlStatus = false;
let reqHeaders;

const login = async () => {
  try {
    let response = await axios.get("https://www.instagram.com");

    let csrftoken = response.headers["set-cookie"]
      .find((cookie) => cookie.match("csrftoken="))
      .split(";")[0]
      .split("=")[1];

    let mid = response.headers["set-cookie"]
      .find((cookie) => cookie.match("mid="))
      .split(";")[0]
      .split("=")[1];

    const headers = {
      cookie: `ig_cb=1; csrftoken=${csrftoken}; mid=${mid};`,
      referer: "https://www.instagram.com/",
      "x-csrftoken": csrftoken,
      "X-CSRFToken": csrftoken,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36",
    };

    const payload = `username=${igUsername}&enc_password=${encodeURIComponent(
      `#PWD_INSTAGRAM_BROWSER:0:${Math.ceil(
        new Date().getTime() / 1000
      )}:${igPassword}`
    )}`;

    response = await axios({
      method: "post",
      url: "https://www.instagram.com/accounts/login/ajax/",
      data: payload,
      headers,
    });

    if (!response.data.user) {
      throw { error: "User not found" };
    } else if (!response.data.authenticated) {
      throw { error: "Password is wrong" };
    } else {
      csrftoken = response.headers["set-cookie"]
        .find((cookie) => cookie.match("csrftoken="))
        .split(";")[0];

      let ds_user_id = response.headers["set-cookie"]
        .find((cookie) => cookie.match("ds_user_id="))
        .split(";")[0]
        .split("=")[1];

      let ig_did = response.headers["set-cookie"]
        .find((cookie) => cookie.match("ig_did="))
        .split(";")[0]
        .split("=")[1];

      let rur = response.headers["set-cookie"]
        .find((cookie) => cookie.match("rur="))
        .split(";")[0]
        .split("=")[1];

      let sessionid = response.headers["set-cookie"]
        .find((cookie) => cookie.match("sessionid="))
        .split(";")[0]
        .split("=")[1];

      const cookies = {
        csrftoken,
        ds_user_id,
        ig_did,
        rur,
        sessionid,
        mid,
      };

      let cookiesString = "";

      Object.keys(cookies).forEach((key) => {
        cookiesString += `${key}=${cookies[key]}; `;
      });

      const csrf = cookies.csrftoken;

      reqHeaders = {
        cookie: cookiesString,
        referer: "https://www.instagram.com/",
        "x-csrftoken": csrf,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36",
      };
    }
  } catch (error) {
    console.log(error);
    if ((error.response.data.message = "checkpoint_required")) {
      console.log("Account blocked");
    }
  }
};

const resetInstagramCron = () => {
  postCount = 0;
  insertedCrawlStatus = false;
};

const storeImage = async (image) => {
  const client = SeaweedConfig.get();

  console.log("image", image);

  const response = await axios.get(image, { responseType: "stream" });

  try {
    // const fileInfo = await client.write(image);
    const fileInfo = await client.write(response);
    return fileInfo;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const processEdges = async (edges, sinceId) => {
  const myArrayOfPosts = [];
  for (const edge of edges) {
    const { node } = edge;
    if (sinceId && bigInt(node.id).lesserOrEquals(sinceId)) {
      return { myArrayOfPosts, foundLast: true };
    }

    const denyListed = await DenyListDAO.isDenyListed(node.owner.id);
    const exists = await PostDAO.findByIdStr(node.id, "instagram");

    if (!denyListed && !exists) {
      const myUsefulPost = {
        post_created_at: node.taken_at_timestamp,
        post_id_str: node.id,
        full_text:
          node.edge_media_to_caption &&
          node.edge_media_to_caption.edges &&
          node.edge_media_to_caption.edges.length
            ? node.edge_media_to_caption.edges[0].node.text
            : "",
        hashtags: [],
        media: [
          {
            media_url: node.display_url,
            media_url_https: node.display_url,
            media_url_thumb: node.thumbnail_resources[0].src,
            media_url_small: node.thumbnail_resources[1].src,
            media_url_medium: node.thumbnail_resources[2].src,
            media_url_large: node.thumbnail_resources[3].src,
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
              },
            },
          },
        ],
        user: {
          id_str: node.owner.id,
          name: "",
          screen_name: "",
          location: "",
          profile_image_url: "",
          profile_image_url_https: `https://instagram.com/p/${node.shortcode}`,
        },
        geo: "",
        coordinates: "",
      };

      // const fileInfo = await storeImage(node.thumbnail_resources[0].src);

      myUsefulPost.source = "instagram";
      myArrayOfPosts.push(myUsefulPost);
      postCount++;
    }
  }
  return { myArrayOfPosts, foundLast: false };
};

const getPosts = async (sinceId, maxId, hashtag) => {
  let url = `https://www.instagram.com/explore/tags/${hashtag}/?__a=1`;

  await login();

  if (maxId) {
    url += `&max_id=${maxId}`;
  }

  await axios
    .get(url, reqHeaders)
    .then(async (response) => {
      let softLimit = false;
      const { graphql } = response.data;

      if (
        !graphql ||
        !graphql.hashtag ||
        graphql.hashtag.edge_hashtag_to_media.count === 0
      ) {
        console.log(
          `Processed ${postCount}. There was nothing at the following url: ${url}`
        );
        return;
      }
      if (postCount >= maxPosts) {
        console.log(`Hit maxPosts soft limit. Totals ${postCount}.`);
        softLimit = true;
      }

      const { page_info } = graphql.hashtag.edge_hashtag_to_media;
      const { edges } = graphql.hashtag.edge_hashtag_to_media;
      const { myArrayOfPosts, foundLast } = await processEdges(edges, sinceId);

      if (myArrayOfPosts.length) {
        await PostDAO.insertMany(myArrayOfPosts)
          .then(async (postResults) => {
            if (!insertedCrawlStatus) {
              const {
                id: id_str_top,
                taken_at_timestamp: post_created_at,
              } = edges[0].node;
              await PostCrawlStatusDAO.createNew({
                post_id_str: id_str_top,
                post_created_at,
                source: "instagram",
                hashtag,
              });
              insertedCrawlStatus = true;
            }
            let users;
            if (page_info.has_next_page && !foundLast && !softLimit) {
              return getPosts(sinceId, page_info.end_cursor, hashtag);
            } else {
              users = await PostUserDAO.saveCount();
            }

            console.log(
              `We're still fetching posts! Processed ${postCount}. Inserted ${
                postResults.insertedCount
              }. Total users: ${users && users.count}`
            );
          })
          .catch((err) => {
            console.log(
              "Something failed at saving many. And got the error below"
            );
            console.error(err);
          });
      } else {
        console.log("We're still fetching posts! But there was nothing new.");
      }
    })
    .catch((err) => {
      console.log(
        `Processed ${postCount}. And got the error below. With the following url: ${url}`
      );
      console.error(err);
      return;
    });
};

module.exports = { getPosts, resetInstagramCron };
