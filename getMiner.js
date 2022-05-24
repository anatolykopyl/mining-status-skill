const axios = require('axios');
const dedent = require('dedent-js');

const fromatHashrate = (hs) => {
  return Math.floor(hs / 1000000);
};

const daysUntilPayout = (miner) => {
  const { stats, settings } = miner;
  return Math.ceil((settings.paymentThreshold - stats.balance) / stats.dayliProfit);
}

module.exports = async (wallet) => {
  const response = await axios.post(
    'https://baikalmine.com/api/pool/miner/getMiner',
    {
      type: "pps_plus",
      coin: "eth",
      miner: wallet
    }
  ).catch(error => {
    console.error(error);
    return {error};
  });

  if (response.error) {
    const text = dedent(`
      Ошибка получения данных, проверьте правильность введенного кошелька.
      "${wallet}"
    `);
    const tts = dedent(`
      Ошибка получения данных, проверьте правильность введенного кошелька.
      "${wallet}"
    `);

    return { text, tts };
  }

  const miner = response.data;

  const text = dedent(`
    Работает ${miner.workers.online} из ${miner.workers.total},
    хешрейт ${fromatHashrate(miner.hashrate.reported)} MH/s.
    До выплаты осталось ${daysUntilPayout(miner)} дней.
  `);
  const tts = dedent(`
    Работает ${miner.workers.online} из ${miner.workers.total},
    хешр+ейт ${fromatHashrate(miner.hashrate.reported)} мегах+ешей в секунду.
    До выплаты осталось ${daysUntilPayout(miner)} дней.
  `);

  return {text, tts};
};
