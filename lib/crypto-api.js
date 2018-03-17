const request = require('request-promise')
const commaNumber = require('comma-number')
const cache = require('../lib/cache').cacheClient();

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

function getBxApiResponse() {
  return cache.getAsync('bx-api-response')
    .then((apiResponse) => {
      if (apiResponse) {
        return apiResponse
      } else {
        return request("https://bx.in.th/api/")
          .then((output) => cache.putAsync('bx-api-response', output, 60000, getBxApiResponse))
      }
    })
}

function getCoindeskApiResponse() {
  return cache.getAsync('coindesk-api-response')
    .then((apiResponse) => {
      if (apiResponse) {
        return apiResponse
      } else {
        return request("https://api.coindesk.com/v1/bpi/currentprice.json")
          .then((output) => cache.putAsync('coindesk-api-response', output, 60000, getCoindeskApiResponse))
      }
    })

}

const getLatestPrice = (triggerMsg) => {
  console.time('call-bx-api');
  return Promise.all([getBxApiResponse(), getCoindeskApiResponse()])
    .then((output) => {
      console.timeEnd('call-bx-api');
      const bxJson = JSON.parse(output[0])
      const bxObject = findBxObject(bxJson, triggerMsg)
      if (bxObject) {
        let usdPriceText = ''

        if (triggerMsg === 'BTC') {
          const coindeskJson = JSON.parse(output[1])
          usdPriceText = ` (ตลาดโลก $${coindeskJson.bpi.USD.rate})`
        }

        const lastPrice = commaNumber(bxObject.last_price)
        const change = bxObject.change
        const emoji = parseFloat(change) >= 0 ? '👍' : '🔻'
        const text = `ราคา ${triggerMsg.toUpperCase()} ตอนนี้เท่ากับ ${lastPrice} บาท${usdPriceText}, เปลี่ยนแปลง ${change}% ${emoji}`
        return [
          {
            type: 'text',
            text: text
          }
        ]
      } else if (triggerMsg === 'HELP') {
        return [
          {
            type: 'text',
            text: `🐼 Panda Bot รองรับการดูราคา ทองคำ (GOLD) และ สกุลเงิน ดังนี้: ${getSupportedCurrencies(bxJson).join(', ')}`
          }
        ];
      } else {
        return null
      }
    })
}

module.exports = {
  getLatestPrice
}