const express = require('express')
const request = require('request-promise')
const line = require('@line/bot-sdk')
require('dotenv').config()

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  verify: false
};

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

  if (["btc", "bitcoin"].indexOf(event.message.text.toLowerCase()) >= 0) {
    return request("https://bx.in.th/api/")
      .then((string) => {
        const json = JSON.parse(string)
        const lastBtcThbprice = json["1"].last_price
        const change = json["1"].change
        const text = `ราคา 1 Bitcoin ตอนนี้เท่ากับ ${lastBtcThbprice}, เปลี่ยนแปลง ${change}%`

        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: text
        });
      })
  }

  return Promise.resolve(null);
}

app.listen(process.env.PORT || 3000);
