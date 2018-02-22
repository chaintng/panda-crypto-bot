const request = require('request-promise')
const commaNumber = require('comma-number')
const cache = require('memory-cache');

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

function getCryptoApiResponse() {
  let requestBx, requestCoindesk

  if (cache.get('bx-api-response')) {
    requestBx = Promise.resolve(cache.get('bx-api-response'))
  } else {
    requestBx = request("https://bx.in.th/api/")
      .then((output) => cache.put('bx-api-response', output, 60000))
  }

  if (cache.get('coindesk-api-response')) {
    requestCoindesk = Promise.resolve(cache.get('coindesk-api-response'))
  } else {
    requestCoindesk = request("https://api.coindesk.com/v1/bpi/currentprice.json")
      .then((output) => cache.put('coindesk-api-response', output, 60000))
  }

  return Promise.all([requestBx, requestCoindesk])
}

const getLatestPrice = (triggerMsg) => {
  console.time('call-bx-api');
  return getCryptoApiResponse()
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