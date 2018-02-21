const Pageres = require('pageres');
const path = require('path');
const imgur = require('imgur-node-api')
const config = require('../config.js')
imgur.setClientID(config.imgurClientId)
const debug = require('debug')('panda-crypto-bot')

function fetchBitcoinChart() {
  console.time('fetch-bitcoin-chart');
  return new Pageres({delay: 2})
    .src('https://bitcoincharts.com/charts/bitstampUSD', ['1000x500'], {
      crop: true,
      filename: "coinbasechart",
      css: '#header, .adblock, .submenu, .container_12.chartoptions.content { display: none !important; }',
    })
    .dest(__dirname)
    .run()
    .then(() => {
      return new Promise((resolve, reject) => {
        console.timeEnd('fetch-bitcoin-chart');
        console.time('upload-coinbase-chart');
        imgur.upload(path.join(__dirname, 'coinbasechart.png'), function (err, res) {
          console.timeEnd('upload-coinbase-chart');
          if (res.data.link) {
            debug('Crypto Chart Image', res.data.link)
            resolve([{
              type: 'image',
              originalContentUrl: res.data.link,
              previewImageUrl: res.data.link
            }])
          } else {
            reject(err)
          }
        });
      })
    });
}

const getChartPicture = (triggerMsg) => {
  if (triggerMsg === 'BTC') {
    return fetchBitcoinChart()
  }
}

module.exports = {
  getChartPicture
}