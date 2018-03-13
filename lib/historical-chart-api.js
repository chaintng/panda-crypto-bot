const Pageres = require('pageres');
const cache = require('memory-cache');
const path = require('path');
const os = require('os');
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
    .dest(os.tmpdir())
    .run()
    .then(() => {
      return new Promise((resolve, reject) => {
        console.timeEnd('fetch-bitcoin-chart');
        console.time('upload-coinbase-chart');
        imgur.upload(path.join(os.tmpdir(), 'coinbasechart.png'), function (err, res) {
          console.timeEnd('upload-coinbase-chart');
          if (res.data.link) {
            debug('Crypto Chart Image', res.data.link)
            resolve(cache.put('btc-chart-image', [{
              type: 'image',
              originalContentUrl: res.data.link,
              previewImageUrl: res.data.link
            }], 60000, fetchBitcoinChart))
          } else {
            reject(err)
          }
        });
      })
    });
}

const getChartPicture = (triggerMsg) => {
  if (triggerMsg === 'BTC') {
    if (cache.get('btc-chart-image')) {
      return Promise.resolve(cache.get('btc-chart-image'))
    }
    return fetchBitcoinChart()
  } else {
    return Promise.resolve(null)
  }
}

module.exports = {
  getChartPicture
}