const axios = require('axios');
const dedent = require('dedent-js');

const getMiner = async (wallet) => {
  const response = await axios.post(
    'https://baikalmine.com/api/pool/miner/getMiner',
    {
      type: "pps_plus",
      coin: "eth",
      miner: wallet
    }
  ).catch(error => ({error}));

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

const fromatHashrate = (hs) => {
  return Math.floor(hs / 1000000);
};

const daysUntilPayout = (miner) => {
  const { stats, settings } = miner;
  return Math.ceil((settings.paymentThreshold - stats.balance) / stats.dayliProfit);
}

const handleFirstLaunch = async (event) => {
  const {version, session} = event;
  const text = 'Введите адрес своего кошелька'

  return {
    version,
    session,
    response: {
      text,
      end_session: false,
    },
    session_state: {
      awaiting_wallet_input: true,
    },
  }
};

const handleWalletInput = async (event) => {
  const {version, session, request} = event;

  const wallet = request.command.replace(/ /g,'');
  let {text, tts} = await getMiner(wallet);

  text = 'Адрес сохранен. \n'.concat(text);
  tts = 'Адрес сохранен. \n'.concat(tts);

  return {
    version,
    session,
    response: {
      text,
      tts,
      end_session: false,
    },
    session_state: {
      awaiting_wallet_input: false,
    },
    user_state_update: {
      wallet,
    }
  }
}

const handleResetWallet = async (event) => {
  const {version, session} = event;

  const text = 'Адрес кошелька сброшен, введите новый';

  return {
    version,
    session,
    response: {
      text,
      end_session: false,
    },
    session_state: {
      awaiting_wallet_input: true,
    },
    user_state_update: {
      wallet: null,
    }
  }
}

const handleGetStatus = async (event) => {
  const {version, session, state} = event;

  const {text, tts} = await getMiner(state.user.wallet);
  
  return {
    version,
    session,
    response: {
      text,
      tts,
      end_session: true,
    },
  };
}

const handleHelp = async (event) => {
  const {version, session} = event;

  const text = dedent(`
    Я умею узнавать статус вашей майнинг фермы на пуле baikalmine.com.
    Если ошиблись с вводом адреса, скажите "сбросить адрес".
  `);

  return {
    version,
    session,
    response: {
      text,
      end_session: false,
    },
  };
}

module.exports.handler = async (event) => {
  const {session, request, state} = event;

  if (request.command === 'сбросить адрес') {
    return handleResetWallet(event);
  }
  const helpCommands = ['помощь', 'что ты умеешь'];
  if (helpCommands.includes(request.command)) {
    return handleHelp(event);
  }

  if (state.session.awaiting_wallet_input) {
    return handleWalletInput(event);
  }

  if (!state.user.wallet) {
    if (session.new) {
      return handleFirstLaunch(event);
    }
    
    return handleWalletInput(event);
  }

  return handleGetStatus(event);
};
