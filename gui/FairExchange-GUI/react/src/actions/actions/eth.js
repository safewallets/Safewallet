import {
  DASHBOARD_ETHEREUM_BALANCE,
  DASHBOARD_ETHEREUM_TRANSACTIONS,
  DASHBOARD_ETHEREUM_COINS,
} from '../storeType';
import translate from '../../translate/translate';
import Config, {
  token,
  agamaPort,
} from '../../config';
import {
  triggerToaster,
  sendToAddressState,
  activeHandle,
} from '../actionCreators';
import Store from '../../store';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import mainWindow from '../../util/mainWindow';
import erc20ContractId from 'agama-wallet-lib/src/eth-erc20-contract-id';

export const apiEthereumAuth = (seed) => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/auth`,
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
          translate('API.apiEthereumAuth') + ' (code: apiEthereumAuth)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg !== 'error') {
        dispatch(activeHandle());
        dispatch(apiEthereumCoins());
      } else {
        dispatch(
          triggerToaster(
            translate('TOASTR.INCORRECT_ETH_PRIV'),
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });
  }
}

export const apiEthereumCoins = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/coins${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiEthereumCoins') + ' (code: apiEthereumCoins)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(apiEthereumCoinsState(json));
    });
  }
}

export const apiEthereumCoinsState = (json) => {
  return {
    type: DASHBOARD_ETHEREUM_COINS,
    ethereumCoins: json.result,
  }
}

export const apiEthereumKeys = (seed) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/keys`,
      fetchType(
        JSON.stringify({
          seed,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiEthereumKeys') + ' (code: apiEthereumKeys)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiEthereumBalance = (coin, address) => {
  const _coin = coin;
  let network = coin.toLowerCase().indexOf('eth_') > -1 ? coin.split('_') : null;
  let symbol;

  if (erc20ContractId[coin.toUpperCase()]) {
    network = null;
    symbol = coin;
    coin = 'ETH';
  }
  
  return dispatch => {
    let _urlParams = {
      token,
      address,
      coin,
    };

    if (network) {
      _urlParams.network = network[1].toLowerCase();
    }
    
    if (symbol) {
      _urlParams.symbol = symbol;
    }

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/balance${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiEthereumBalance') + ' (code: apiEthereumBalance)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (mainWindow.activeCoin === _coin) {
        dispatch(apiEthereumBalanceState(json));
      }
    });
  }
}

export const apiEthereumBalanceState = (json) => {
  return {
    type: DASHBOARD_ETHEREUM_BALANCE,
    balance: json.result,
  }
}

export const apiEthereumTransactions = (coin, address) => {  
  const _coin = coin;
  let network = coin.toLowerCase().indexOf('eth_') > -1 ? coin.split('_') : null;
  let symbol;

  if (erc20ContractId[coin.toUpperCase()]) {
    network = null;
    symbol = coin;
    coin = 'ETH';
  }

  return dispatch => {
    let _urlParams = {
      token,
      address,
      coin,
    };
  
    if (symbol) {
      _urlParams.symbol = symbol;
    }

    if (network) {
      _urlParams.network = network[1].toLowerCase();
    }

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/transactions${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiEthereumTransactions') + ' (code: apiEthereumTransactions)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (mainWindow.activeCoin === _coin) {
        dispatch(apiEthereumTransactionsState(json));
      }
    });
  }
}

export const apiEthereumTransactionsState = (json) => {
  if (json) {
    json = json.result;
  } else {
    json = {
      error: 'error',
    };
  }

  if (json &&
      json.error) {
    json = null;
  } else if (
    !json ||
    !json.length
  ) {
    json = 'no data';
  }

  return {
    type: DASHBOARD_ETHEREUM_TRANSACTIONS,
    txhistory: json,
  }
}

export const apiEthereumGasPrice = () => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/gasprice/${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiEthereumGasPrice') + ' (code: apiEthereumGasPrice)',
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

export const apiEthereumSend = (coin, dest, amount, speed, push) => {
  const network = coin.toLowerCase().indexOf('eth_') > -1 ? coin.split('_') : null;
  
  return dispatch => {
    // const json = {"msg":"success","result":{"nonce":0,"gasPrice":{"_hex":"0x012a05f200"},"gasLimit":{"_hex":"0x5208"},"to":"0xe1a3157378E6bcAF3a5391D582F2e7175f94588C","value":{"_hex":"0x038d7ea4c68000"},"data":"0x","chainId":1,"v":37,"r":"0x61e2d5c59eca0fe085bea0ba8a1f3ce1285a70acc4f08766da85dda626446796","s":"0x4dc9707147d549f65c3f40a86d1764e40035bac08ce15bb4d851c56c3726fc18","from":"0xe1a3157378E6bcAF3a5391D582F2e7175f94588C","hash":"0xb40c11a96265a30a6871d966db24f60b2579e5af045559b7801b749a72557433","txid":"0xb40c11a96265a30a6871d966db24f60b2579e5af045559b7801b749a72557433"}};
    // Store.dispatch(sendToAddressState(json.msg === 'error' ? json : json.result));
    let _urlParams = {
      token,
      coin,
      amount,
      dest,
      speed,
      push,
    };

    if (erc20ContractId[coin]) {
      delete _urlParams.coin;
      _urlParams.symbol = coin;
    } else {
      if (network) {
        _urlParams.network = network[1].toLowerCase();
      }
    }

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/createtx${erc20ContractId[coin] ? '/erc20' : ''}${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiEthereumSend') + ' (code: apiEthereumSend)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(sendToAddressState(json.msg === 'error' ? json : json.result));
    });
  }
}

export const apiEthereumSendERC20Preflight = (symbol, dest, amount, speed) => {
  return new Promise((resolve, reject) => {
    //const json = {"msg":"success","result":{"gasLimit":"37042","gasPrice":8400000000,"feeWei":311152800000000,"fee":"0.0003111528","maxBalance":{"balance":"0.1784354316","balanceWei":"178435431600000000"},"balanceAfterFeeWei":178124278800000000,"balanceAferFee":"0.1781242788","notEnoughBalance":false}};
    //resolve(json);
    
    const _urlParams = {
      token,
      symbol,
      amount,
      dest,
      speed,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/createtx/erc20${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiEthereumSend') + ' (code: apiEthereumSend)',
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

export const apiEthereumBalancePromise = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _coin = coin;
    let network = coin.toLowerCase().indexOf('eth_') > -1 ? coin.split('_') : null;
    let symbol;

    if (erc20ContractId[coin.toUpperCase()]) {
      network = null;
      symbol = coin;
      coin = 'ETH';
    }
    
    let _urlParams = {
      token,
      address,
      coin,
    };

    if (network) {
      _urlParams.network = network[1].toLowerCase();
    }
    
    if (symbol) {
      _urlParams.symbol = symbol;
    }

    fetch(
      `http://127.0.0.1:${agamaPort}/api/eth/balance${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiEthereumBalance') + ' (code: apiEthereumBalancePromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}