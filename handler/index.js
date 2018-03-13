const cryptoApi = require('../lib/crypto-api')
const goldApi = require('../lib/gold-api')
const historicalChartApi = require('../lib/historical-chart-api')
const richMenuApi = require('../lib/rich-menu-api')
const line = require('@line/bot-sdk')

const config = require('../config.js')

const client = new line.Client(config);

const webhook = (req, res) => {
  console.log("User id: " + req.body.events[0].source.userId)
  res.json({status: 'ok'})
  return Promise
      .all(req.body.events.map(handleEvent))
      .catch((e) => {
          console.log(e)
      })
}

function handleEvent(event) {
  let triggerMsg;

  if (event.type === 'postback' && event.postback.data) {
    triggerMsg = event.postback.data.toUpperCase()
  } else if (event.type === 'message' && event.message.text) {
    triggerMsg = event.message.text.toUpperCase()
  } else {
    return Promise.resolve('ok');
  }

  triggerMsg = triggerMsg === 'BITCOIN' ? 'BTC' : triggerMsg

  if (triggerMsg === "SUBSCRIBE") {
    // Saving user's subscription here... and return message to user
    return client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: `⏰ ตั้งเวลาการส่งราคาเป็น ${event.postback.params.time} สำเร็จแล้ว`
      }
    ])
  } else if (triggerMsg === 'NEXT') {
    return richMenuApi.nextPage(event.source.userId)
      .then(() => client.pushMessage(event.source.groupId || event.source.userId, [{type: 'text', text: 'เปลี่ยนหน้าสำเร็จ 👌'}]))
  } else if (triggerMsg === 'PREVIOUS') {
    return richMenuApi.previousPage(event.source.userId)
      .then(() => client.pushMessage(event.source.groupId || event.source.userId, [{type: 'text', text: 'เปลี่ยนหน้าสำเร็จ 👌'}]))
  } else if (triggerMsg === 'GOLD') {
    return goldApi.getLatestPrice(triggerMsg)
      .then(message => {
        return client.replyMessage(event.replyToken, message);
      })
  } else {
    const chartPromise = historicalChartApi.getChartPicture(triggerMsg).then((message) => {
      if (message) {
        return client.pushMessage(event.source.groupId || event.source.userId, message)
      }
    })
    const latestPricePromise = cryptoApi.getLatestPrice(triggerMsg)
      .then(message => {
        if (message) {
          return client.replyMessage(event.replyToken, message)
        }
        return Promise.resolve()
      })
    return Promise.all([chartPromise, latestPricePromise])
  }
}

module.exports = {
  webhook
}