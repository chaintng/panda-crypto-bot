const request = require('request-promise');
const commaNumber = require('comma-number');

const getLatestPrice = () => {
  console.time('call-gold-api');
  return request('http://www.thaigold.info/RealTimeDataV2/gtdata_.txt')
    .then((output) => {
      console.timeEnd('call-bx-api');
      const goldJson = JSON.parse(output);
      return [
        {
          type: 'text',
          text: `ราคา "ทองคำ" ตอนนี้เท่ากับ ${commaNumber(goldJson[4].bid)} บาท (ตลาดโลก $${commaNumber(goldJson[1].bid)}), เปลี่ยนแปลง ${goldJson[4].diff}`,
        },
      ];
    });
};

module.exports = {
  getLatestPrice,
};
