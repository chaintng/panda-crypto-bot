const config = require('../config.js');
const request = require('request-promise');

const nextPage = userId => request({
  method: 'POST',
  uri: `https://api.line.me/v2/bot/user/${userId}/richmenu/${config.cryptoPage2RichMenuId}`,
  headers: {
    Authorization: `Bearer ${config.channelAccessToken}`,
  },
  json: true,
});

const previousPage = userId => request({
  method: 'DELETE',
  uri: `https://api.line.me/v2/bot/user/${userId}/richmenu`,
  headers: {
    Authorization: `Bearer ${config.channelAccessToken}`,
  },
  json: true,
});

module.exports = {
  nextPage,
  previousPage,
};
