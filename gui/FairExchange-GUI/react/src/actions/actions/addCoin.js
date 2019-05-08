import { ACTIVE_HANDLE } from '../storeType';
import translate from '../../translate/translate';
import Config, {
  token,
  agamaPort,
} from '../../config';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import mainWindow, { staticVar } from '../../util/mainWindow';

import {
  triggerToaster,
  toggleAddcoinModal,
  getDexCoins,
  apiElectrumCoins,
  apiEthereumCoins,
} from '../actionCreators';
import {
  startCurrencyAssetChain,
  startAssetChain,
  startCrypto,
  checkAC,
} from '../../components/addcoin/payload';

export const iguanaActiveHandleState = (json) => {
  return {
    type: ACTIVE_HANDLE,
    isLoggedIn: json.status === 'unlocked' ? true : false,
    handle: json,
  }
}

export const activeHandle = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/auth/status${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.activeHandle') + ' (code: activeHandle)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(
        iguanaActiveHandleState(json)
      );
    });
  }
}

export const apiElectrumAuth = (seed) => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/login`,
      fetchType(
        JSON.stringify({
          seed,
          iguana: true,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumAuth') + ' (code: apiElectrumAuth)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg !== 'error') {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
      } else {
        dispatch(
          triggerToaster(
            translate('TOASTR.INCORRECT_WIF'),
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });
  }
}

export const apiElectrumAddCoin = (coin) => {
  return dispatch => {
    const _urlParams = {
      coin,
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/coins/add${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumAddCoin') + ' (code: apiElectrumAddCoin)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(
        addCoinResult(coin, '0')
      );
    });
  }
}

export const addCoinEth = (coin, network) => {
  let _coin = coin;

  if (network &&
      network.toLowerCase() !== 'ropsten') {
    _coin = (coin + '_' + network).toUpperCase();
    coin = network;
    network = null;
  }

  return dispatch => {
    const _urlParams = {
      coin: network ? (coin + '_' + network).toUpperCase() : coin,
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/coins/add${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.addCoinEth') + ' (code: addCoinEth)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(
        addCoinResult(network ? (coin + '_' + network).toUpperCase() : _coin === 'ETH' ? 'ETH' : _coin, '3')
      );
    });
  }
}

export const addCoin = (coin, mode, startupParams, genproclimit, pubkey) => {
  if (mode === 0 ||
      mode === '0') {
    return dispatch => {
      dispatch(apiElectrumAddCoin(coin));
    }
  } else {
    return dispatch => {
      dispatch(apiGetConfig(coin, mode, startupParams, genproclimit, pubkey));
    }
  }
}

const handleErrors = (response) => {
  let _parsedResponse;

  if (!response.ok) {
    return null;
  } else {
    _parsedResponse = response.text().then((text) => { return text; });
    return _parsedResponse;
  }
}

export const apiHerd = (coin, mode, path, startupParams, genproclimit, pubkey) => {
  let acData;
  let herdData = {
    ac_name: coin,
    ac_options: [
      '-daemon=0',
      '-server',
    ],
  };

  if (staticVar.chainParams[coin]) {
    for (let key in staticVar.chainParams[coin]) {
      if (key === 'genproclimit') {
        if (genproclimit > 0) {
          herdData.ac_options.push(`-genproclimit=${genproclimit}`);
        } else {
          herdData.ac_options.push('-genproclimit=0');
        }
      } else if (
        key === 'addnode' &&
        typeof staticVar.chainParams[coin][key] === 'object') {
        for (let i = 0; i < staticVar.chainParams[coin][key].length; i++) {
          herdData.ac_options.push(`-addnode=${staticVar.chainParams[coin][key][i]}`);
        }
      } else {
        herdData.ac_options.push(`-${key}=${staticVar.chainParams[coin][key]}`);
      }
    }
  }

  if (!staticVar.chainParams[coin] ||
      (staticVar.chainParams[coin] && !staticVar.chainParams[coin].addnode)) {
    herdData.ac_options.push('-addnode=78.47.196.146');
  }

  if (coin === 'ZEC') {
    herdData = {
      ac_name: 'zcashd',
      ac_options: [
        '-daemon=0',
        '-server=1',
      ],
    };
  }

  if (coin === 'KMD') {
    herdData = {
      ac_name: 'komodod',
      ac_options: [
        '-daemon=0',
        '-addnode=78.47.196.146',
      ],
    };
  }

  if (pubkey) {
    herdData.ac_options.push(`-pubkey=${pubkey}`);
  }

  if (startupParams) {
    herdData.ac_custom_param = startupParams.type;

    if (startupParams.value) {
      herdData.ac_custom_param_value = startupParams.value;
    }
  }

  // TODO: switch statement
  if (coin === 'KMD') {
    acData = startCrypto(
      path.result,
      coin,
      mode
    );
  } else {
    const supply = startAssetChain(
      path.result,
      coin,
      mode,
      true
    );
    acData = startAssetChain(
      path.result,
      coin,
      mode
    );
  }

  return dispatch => {
    let _herd;

    if (coin === 'CHIPS') {
      _herd = 'chipsd';
      herdData = {};
    } else {
      _herd = coin !== 'ZEC' ? 'komodod' : 'zcashd';
    }

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/herd`,
      fetchType(
        JSON.stringify({
          herd: _herd,
          options: herdData,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiHerd') + ' (code: apiHerd)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(handleErrors)
    .then((json) => {
      if (json) {
        dispatch(
          addCoinResult(coin, mode)
        );
      } else {
        dispatch(
          triggerToaster(
            `${translate('TOASTR.ERROR_STARTING_DAEMON', coin)} ${translate('TOASTR.PORT_IS_TAKEN', acData)}`,
            translate('TOASTR.SERVICE_NOTIFICATION'),
            'error',
            false
          )
        );
      }
    });
  }
}

export const addCoinResult = (coin, mode) => {
  const modeToValue = {
    '0': 'spv',
    '-1': 'native',
    '1': 'staking',
    '2': 'mining',
    '3': 'eth',
  };

  return dispatch => {
    let _ethAddCoinToaster = `${coin} added`;
    
    if (coin.toLowerCase().indexOf('eth') > -1) {
      if (coin.indexOf('_') > -1 &&
          coin.toLowerCase().indexOf('ropsten') === -1) {
        const _comp = coin.split('_');

        _ethAddCoinToaster = `${_comp[1]} token added`;
      } else {
        _ethAddCoinToaster = `${coin} added`;
      }
    }

    dispatch(
      triggerToaster(
        coin.toLowerCase().indexOf('eth') > -1 ? _ethAddCoinToaster: `${coin} ${translate('TOASTR.STARTED_IN')} ${modeToValue[mode].toUpperCase()} ${translate('TOASTR.MODE')}`,
        translate('TOASTR.COIN_NOTIFICATION'),
        'success'
      )
    );
    dispatch(toggleAddcoinModal(false, false));

    if (Number(mode) === 0) {
      dispatch(activeHandle());
      dispatch(apiElectrumCoins());
      dispatch(getDexCoins());

      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
        dispatch(getDexCoins());
      }, 500);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
        dispatch(getDexCoins());
      }, 1000);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
        dispatch(getDexCoins());
      }, 2000);
    } else if (coin.toLowerCase().indexOf('eth') > -1) {
      dispatch(activeHandle());
      dispatch(apiEthereumCoins());
      dispatch(getDexCoins());

      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiEthereumCoins());
        dispatch(getDexCoins());
      }, 500);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiEthereumCoins());
        dispatch(getDexCoins());
      }, 1000);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiEthereumCoins());
        dispatch(getDexCoins());
      }, 2000);
    } else {
      dispatch(activeHandle());
      dispatch(getDexCoins());

      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(getDexCoins());
      }, 500);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(getDexCoins());
      }, 1000);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(getDexCoins());
      }, 5000);
    }
  }
}

export const _apiGetConfig = (coin, mode, startupParams) => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/getconf`,
      fetchType(
        JSON.stringify({
          chain: 'komodod',
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API._apiGetConfig') + ' (code: _apiGetConfig)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(
      json => dispatch(
        apiHerd(
          coin,
          mode,
          json,
          startupParams
        )
      )
    );
  }
}

export const apiGetConfig = (coin, mode, startupParams, genproclimit, pubkey) => {
  if (coin === 'KMD' &&
      mode === '-1') {
    return dispatch => {
      return fetch(
        `http://127.0.0.1:${agamaPort}/api/getconf`,
        fetchType(
          JSON.stringify({
            chain: 'komodod',
            token,
          })
        ).post
      )
      .catch((error) => {
        console.log(error);
        dispatch(
          triggerToaster(
            translate('API.apiGetConfig') + ' (code: apiGetConfig)',
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      })
      .then(response => response.json())
      .then(
        json => dispatch(
          apiHerd(
            coin,
            mode,
            json,
            startupParams,
            pubkey
          )
        )
      );
    }
  } else {
    return dispatch => {
      return fetch(
        `http://127.0.0.1:${agamaPort}/api/getconf`,
        fetchType(
          JSON.stringify({
            chain: coin,
            token,
          })
        ).post
      )
      .catch((error) => {
        console.log(error);
        dispatch(
          triggerToaster(
            translate('API.apiGetConfig') + ' (code: apiGetConfig)',
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      })
      .then(response => response.json())
      .then(
        json => dispatch(
          apiHerd(
            coin,
            mode,
            json,
            startupParams,
            genproclimit,
            pubkey
          )
        )
      );
    }
  }
}