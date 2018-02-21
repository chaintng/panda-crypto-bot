const cryptoApi = require('../lib/crypto-api')
const goldApi = require('../lib/gold-api')
const historicalChartApi = require('../lib/historical-chart-api')
const line = require('@line/bot-sdk')

const config = require('../config.js')

const client = new line.Client(config);

const webhook = (req, res) => {
  Promise
      .all(req.body.events.map(handleEvent))
      .catch((e) => {
          console.log(e)
      })
  return res.json({status: 'ok'})
}

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve('ok');
  }

  let triggerMsg = event.message.text.toUpperCase()
  triggerMsg = triggerMsg === 'BITCOIN' ? 'BTC' : triggerMsg

  if (triggerMsg === 'GOLD') {
    goldApi.getLatestPrice(triggerMsg)
      .then(message => {
        client.replyMessage(event.replyToken, message);
      })
  } else {
    historicalChartApi.getChartPicture(triggerMsg).then((message) => {
      client.pushMessage(event.source.groupId || event.source.userId, message)
    })
    cryptoApi.getLatestPrice(triggerMsg)
      .then(message => {
        client.replyMessage(event.replyToken, message);
      })
  }
}

module.exports = {
  webhook
}