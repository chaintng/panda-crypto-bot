const request = require('request-promise')
const commaNumber = require('comma-number')


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

const getLatestPrice = (triggerMsg) => {
  console.time('call-bx-api');
  return Promise.all([request("https://bx.in.th/api/"), request("https://api.coindesk.com/v1/bpi/currentprice.json")])
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
        const text = `ราคา ${triggerMsg.toUpperCase()} ตอนนี้เท่ากับ ${lastPrice} บาท${usdPriceText}, เปลี่ยนแปลง ${change}%`
        return [
          {
            type: 'text',
            text: text
          }
        ]
      } else if (triggerMsg === 'PANDA HELP') {
        return [
          {
            type: 'text',
            text: `Panda Bot รองรับการดูราคา ทองคำ (GOLD) และ สกุลเงิน ดังนี้: ${getSupportedCurrencies(bxJson).join(', ')}`
          }
        ];
      }
    })
}

module.exports = {
  getLatestPrice
}