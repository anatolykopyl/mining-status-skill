const dedent = require('dedent-js');

const getMiner = require('./getMiner');

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
    Для начала работы введите адрес своего кошелька, открыв этот навык на телефоне.
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

  const handlers = {
    'помощь': handleHelp,
    'что ты умеешь': handleHelp,
    'сбросить адрес': handleResetWallet,
  }

  if (handlers.hasOwnProperty(request.command)) {
    return handlers[request.command](event);
  }

  if (!state.user.wallet && session.new) {
    return handleFirstLaunch(event);
  }

  if (state.session.awaiting_wallet_input || !state.user.wallet) {
    return handleWalletInput(event);
  }

  return handleGetStatus(event);
};
