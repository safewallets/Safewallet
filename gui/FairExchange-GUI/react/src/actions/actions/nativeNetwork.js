import {
  DASHBOARD_ACTIVE_COIN_NET_PEERS,
  DASHBOARD_ACTIVE_COIN_NET_TOTALS,
} from '../storeType';
import translate from '../../translate/translate';
import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import fetchType from '../../util/fetchType';

export const getNativePeers = (coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'getpeerinfo',
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
          translate('API.getNativePeers') + ' (code: getNativePeers)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;
      dispatch(getNativePeersState(json));
    });
  };
}

export const getNativeNettotals = (coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'getnettotals',
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
          translate('API.getNativeNettotals') + ' (code: getNativeNettotals)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;
      dispatch(getNativeNettotalsState(json));
    });
  };
}

export const getNativePeersState = (json) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_NET_PEERS,
    peers: json,
  }
}

export const getNativeNettotalsState = (json) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_NET_TOTALS,
    totals: json,
  }
}