import {
  DASHBOARD_ACTIVE_COIN_NATIVE_OPIDS,
  DASHBOARD_ACTIVE_COIN_SENDTO,
} from '../storeType';
import translate from '../../translate/translate';
import {
  triggerToaster,
  getDashboardUpdate,
} from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';

export const sendNativeTx = (coin, _payload) => {
  let payload;
  let _apiMethod;

  if ((_payload.addressType === 'public' && // transparent
      _payload.sendTo.length !== 95 && _payload.sendTo.length !== 78) || !_payload.sendFrom) {
    _apiMethod = 'sendtoaddress';
  } else { // private
    _apiMethod = 'z_sendmany';
  }

  return dispatch => {
    payload = {
      mode: null,
      chain: coin,
      cmd: _apiMethod,
      rpc2cli,
      token,
      params:
        (_payload.addressType === 'public' && _payload.sendTo.length !== 95 && _payload.sendTo.length !== 78) || !_payload.sendFrom ?
        (_payload.subtractFee ?
          [
            _payload.sendTo,
            _payload.amount,
            '',
            '',
            true,
          ]
          :
          [
            _payload.sendTo,
            _payload.amount,
          ]
        )
        :
        [
          _payload.sendFrom,
          [{
            address: _payload.sendTo,
            amount: _payload.amount
          }],
          1,
          _payload.ztxFee || 0.0001,
        ],
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.sendNativeTx') + ' (code: sendNativeTx)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then((response) => {
      const _response = response.text().then((text) => { return text; });
      return _response;
    })
    .then((json) => {
      if (json.indexOf('"code":') > -1) {
        if (json.indexOf('"code":-4') > -1) {
          dispatch(
            triggerToaster(
              translate('API.' + (JSON.parse(json).error.message.indexOf('too large') > -1 ? 'TX_TOO_LARGE' : 'WALLETDAT_MISMATCH')) + (' (debug info: ' + json),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'info',
              false
            )
          );
        } else if (json.indexOf('"code":-5') > -1) {
          dispatch(
            triggerToaster(
              translate('TOASTR.INVALID_ADDRESS', coin),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error',
            )
          );
        } else {
          dispatch(
            triggerToaster(
              JSON.parse(json).error.message,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
        }
      } else {
        dispatch(sendToAddressState(JSON.parse(json).result));
        dispatch(
          triggerToaster(
            translate('TOASTR.TX_SENT_ALT'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
        Store.dispatch(getDashboardUpdate(coin));
      }
    });
  }
}

export function getKMDOPIDState(json) {
  return {
    type: DASHBOARD_ACTIVE_COIN_NATIVE_OPIDS,
    opids: json,
  }
}

// remove?
export const getKMDOPID = (opid, coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'z_getoperationstatus',
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.txDataFail') + ' (code: getKMDOPID)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;
      dispatch(getKMDOPIDState(json));
    });
  };
}

export const sendToAddressPromise = (coin, address, amount) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'sendtoaddress',
      rpc2cli,
      token,
      params: [
        address,
        amount,
        'KMD interest claim request',
        'KMD interest claim request',
        true,
      ],
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.sendNativeTx') + ' (code: sendToAddressPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
      Store.dispatch(getDashboardUpdate(coin));
    });
  });
}

export const sendToAddressState = (json) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SENDTO,
    lastSendToResponse: json,
  }
}

export const clearLastSendToResponseState = () => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SENDTO,
    lastSendToResponse: null,
  }
}

export const validateAddressPromise = (coin, address) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'validateaddress',
      params: [ address ],
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${Config.agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.validateAddress') + ' (code: validateAddressPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export const clearOPIDs = (coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'z_getoperationresult',
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.txDataFail') + ' (code: clearOPIDs)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;

      if (json.length) {
        dispatch(
          triggerToaster(
            translate('SEND.ALL_OPID_CLEARED'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
        Store.dispatch(getDashboardUpdate(coin));
      }
    });
  };
}

// transparentLimit and shieldedLimit set to 0 to use as many as can fit into 1 tx
export const zmergeToAddressPromise = (coin, src, dest, fee = 0.0001, transparentLimit = 50, shieldedLimit = 10) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'z_mergetoaddress',
      rpc2cli,
      token,
      params: [
        src,
        dest,
        fee,
        transparentLimit,
        shieldedLimit,
      ],
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.zmergeToAddressPromise') + ' (code: zmergeToAddressPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
      Store.dispatch(getDashboardUpdate(coin));
    });
  });
}

export const shieldCoinbase = (coin, src, dest, fee = 0.0001, limit = 50) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'z_shieldcoinbase',
      rpc2cli,
      token,
      params: [
        src || '*',
        dest,
        fee,
        limit,
      ],
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.shieldCoinbase') + ' (code: shieldCoinbase)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
      Store.dispatch(getDashboardUpdate(coin));
    });
  });
}
