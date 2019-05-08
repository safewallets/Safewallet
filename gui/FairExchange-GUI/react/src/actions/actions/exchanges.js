import { triggerToaster } from '../actionCreators';
import {
  EXCHANGES_CACHE,
  EXCHANGES_COINSWITCH_COINS,
} from '../storeType';
import Config, {
  token,
  agamaPort,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';
import translate from '../../translate/translate';
import urlParams from '../../util/url';

export const getExchangesCache = (provider) => {
  return dispatch => {
    const _urlParams = {
      token,
      provider,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/exchanges/cache${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getExchangesCache') + ' (code: getExchangesCache)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(exchangesState(json && json.result ? json.result : json, provider));
    });
  };
}

const exchangesState = (json, provider) => {
  return {
    type: EXCHANGES_CACHE,
    cache: json,
    provider: provider,
  }
};

export const exchangesGetCoins = (provider) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/exchanges/${provider}/coins${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.exchangesGetCoins') + ' (code: exchangesGetCoins)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json && json.result ? json.result : json));
  });
}

export const exchangesGetRate = (provider, src, dest) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      combined: true, // changelly
      src,
      dest,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/exchanges/${provider}/rate${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.exchangesGetRate') + ' (code: exchangesGetRate)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json && json.result ? json.result : json));
  });
}

export const exchangesPlaceOrder = (provider, src, dest, srcAmount, destAmount, destPub, refundPub) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      src,
      dest,
      srcAmount,
      destAmount,
      destPub,
      refundPub,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/exchanges/${provider}/order/place${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.exchangesPlaceOrder') + ' (code: exchangesPlaceOrder)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json && json.result ? json.result : json));
  });
}

export const updateExchangesCacheDeposit = (provider, coin, txid, orderId) => {
  return dispatch => {
    const _urlParams = {
      token,
      provider,
      coin,
      txid,
      orderId,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/exchanges/deposit/update${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.updateExchangesCacheDeposit') + ' (code: updateExchangesCacheDeposit)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(exchangesState(json && json.result ? json.result : json, provider));
      Store.dispatch(getExchangesCache(provider));
    });
  };
}

export const exchangesHistorySync = (provider) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      save: true,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/exchanges/${provider}/history/sync${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.exchangesHistorySync') + ' (code: exchangesHistorySync)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json && json.msg === 'success' ? true : false);
    });
  });
}

export const getExchangesCoinswitchCoins = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      'https://www.atomicexplorer.com/api/exchanges/coinswitch/coins/cached',
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getExchangesCoinswitchCoins') + ' (code: getExchangesCoinswitchCoins)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(getExchangesCoinswitchCoinsState(json && json.result ? json.result : json));
    });
  };
}

const getExchangesCoinswitchCoinsState = (json) => {
  return {
    type: EXCHANGES_COINSWITCH_COINS,
    coins: json,
  }
};