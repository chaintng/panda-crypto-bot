const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  imgurClientId: process.env.IMGUR_CLIENT_ID,
  cryptoPage2RichMenuId: process.env.CRYPTO_PAGE_2_RICH_MENU_ID,
  verify: false,
  redisUrl: process.env.REDIS_URL,
};

module.exports = config;
