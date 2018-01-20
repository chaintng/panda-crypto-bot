
const debug = require('debug')('panda-crypto-bot')
const request = require('request-promise')
const commaNumber = require('comma-number')
const Pageres = require('pageres');
const path = require('path');
const line = require('@line/bot-sdk')
const imgur = require('imgur-node-api')

const config = require('../config.js')

const client = new line.Client(config);
imgur.setClientID(config.imgurClientId)

const webhook = (req, res) => {
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
}

function fetchBitcoinChart() {
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
                imgur.upload(path.join(__dirname, 'coinbasechart.png'), function (err, res) {
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

function findBxObject(bxJson, currency) {
    const currencyKey = Object.keys(bxJson).find((eachKey) => {
        return bxJson[eachKey].primary_currency === 'THB' && bxJson[eachKey].secondary_currency === currency
    })
    return bxJson[currencyKey] || null
}

function getSupportedCurrencies(bxJson) {
    return Object.keys(bxJson).filter((eachKey) => {
        return bxJson[eachKey].primary_currency === 'THB'
    }).map((eachKey) => {
        return bxJson[eachKey].secondary_currency
    })
}

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    let triggerMsg = event.message.text.toUpperCase()
    triggerMsg = triggerMsg === 'BITCOIN' ? 'BTC' : triggerMsg

    return Promise.all([request("https://bx.in.th/api/"), request("https://api.coindesk.com/v1/bpi/currentprice.json")])
        .then((output) => {
            const bxJson = JSON.parse(output[0])
            const bxObject = findBxObject(bxJson, triggerMsg)
            if (bxObject) {
                let usdPriceText = ''
                let imageReply = Promise.resolve([])

                if (triggerMsg === 'BTC') {
                    const coindeskJson = JSON.parse(output[1])
                    usdPriceText = ` (ตลาดโลก $${coindeskJson.bpi.USD.rate})`
                    imageReply = fetchBitcoinChart()
                }

                const lastPrice = commaNumber(bxObject.last_price)
                const change = bxObject.change
                const text = `ราคา ${triggerMsg.toUpperCase()} ตอนนี้เท่ากับ ${lastPrice} บาท${usdPriceText}, เปลี่ยนแปลง ${change}%`

                return imageReply
                    .then((imageReply) => {
                        let replyMessage = [
                            {
                                type: 'text',
                                text: text
                            }
                        ]
                        if (imageReply.length > 0) {
                            replyMessage = replyMessage.concat(imageReply)
                        }
                        return client.replyMessage(event.replyToken, replyMessage);
                    })
            } else if (triggerMsg === 'GOLD') {
                return request('http://www.thaigold.info/RealTimeDataV2/gtdata_.txt')
                    .then((output) => {
                        const goldJson = JSON.parse(output)
                        return client.replyMessage(event.replyToken, [
                            {
                                type: 'text',
                                text: `ราคา "ทองคำ" ตอนนี้เท่ากับ ${commaNumber(goldJson[4].bid)} บาท (ตลาดโลก $${commaNumber(goldJson[1].bid)}), เปลี่ยนแปลง ${goldJson[4].diff}`
                            }
                        ]);
                    })
            } else if (triggerMsg === 'PANDA HELP') {
                return client.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: `Panda Bot รองรับการดูราคา ทองคำ (GOLD) และ สกุลเงิน ดังนี้: ${getSupportedCurrencies(bxJson).join(', ')}`
                    }
                ]);
            } else {
                return Promise.resolve()
            }
        })
}

module.exports = {
    webhook: webhook
}