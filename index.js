const express = require('express')
const request = require('request-promise')
const line = require('@line/bot-sdk')
const commaNumber = require('comma-number')
require('dotenv').config()

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  verify: false
};

const BTC_THB_KEY = 1
const OMG_THB_KEY = 26
const btcTriggeredKeyword = ["bitcoin", "btc"]
const omgTriggeredKeyword = ["omg"]

const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
      console.log(result)
      return res.json(result)
    })
    .catch((e) => {
      console.log(e)
      return res.send("Error")
    })
});

const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const allKeyword = btcTriggeredKeyword.concat(omgTriggeredKeyword)
  const triggerMsg = event.message.text.toLowerCase()
  if (allKeyword.indexOf(triggerMsg) >= 0) {
    return Promise.all([request("https://bx.in.th/api/"), request("https://api.coindesk.com/v1/bpi/currentprice.json")])
      .then((output) => {
        const bxJson = JSON.parse(output[0])
        let quoteKey
        let usdPriceText = ''
        if (btcTriggeredKeyword.indexOf(triggerMsg) >= 0) {
          quoteKey = BTC_THB_KEY
          const coindeskJson = JSON.parse(output[1])
          usdPriceText = ` (ตลาดโลก $${coindeskJson.bpi.USD.rate})`
        } else if (omgTriggeredKeyword.indexOf(triggerMsg) >= 0) {
          quoteKey = OMG_THB_KEY
        }
        const lastPrice = commaNumber(bxJson[quoteKey].last_price)
        const change = bxJson[quoteKey].change
        const text = `ราคา ${triggerMsg.toUpperCase()} ตอนนี้เท่ากับ ${lastPrice} บาท${usdPriceText}, เปลี่ยนแปลง ${change}%`

        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: text
        });
      })
  }

  return Promise.resolve(null);
}

app.listen(process.env.PORT || 3000);
