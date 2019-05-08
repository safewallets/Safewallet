import translate from '../../translate/translate';
import mainWindow, { staticVar } from '../../util/mainWindow';
import config from '../../config';
import { cryptoCoins } from '../../util/coinHelper';
import { sortObject } from 'agama-wallet-lib/src/utils';
import erc20ContractId from 'agama-wallet-lib/src/eth-erc20-contract-id';

let _prepCoinsList;
let coins = cryptoCoins;
let _activeCoins;
let _disableETH;

// disable non kmd coins
// TODO: move eth to a separate render
if (!config.experimentalFeatures) {
  coins = coins.slice(0, 2);
}

// sort coins by their title
let _coins = [];
let coinsList = [];

for (let i = 0; i < cryptoCoins.length; i++) {
  _coins[translate('CRYPTO.' + cryptoCoins[i].toUpperCase())] = cryptoCoins[i];
}

_coins = sortObject(_coins);

for (let key in _coins) {
  if (config.experimentalFeatures ||
      (!config.experimentalFeatures && (_coins[key] === 'KMD' || _coins[key] === 'CHIPS'))) {
    coinsList.push(_coins[key]);
  }
}

coins = coinsList;

const prepCoinsList = (options) => {
  const availableKMDModes = staticVar.arch === 'x64' ? 'spv|native' : 'spv';
  let _items = [];
  
  if (options.filterNonActive) {
    if (_activeCoins.spv &&
        _activeCoins.spv.length) {
      for (let i = 0; i < _activeCoins.spv.length; i++) {
        _items.push({
          label: `${translate('CRYPTO.' + _activeCoins.spv[i])} (${_activeCoins.spv[i]})`,
          icon: `btc/${_activeCoins.spv[i]}`,
          value: `${_activeCoins.spv[i]}|spv`,
        });
      }
    }

    if (config.experimentalFeatures) {
      if (_activeCoins.eth.indexOf('eth') > -1) {
        _items.push({
          label: `${translate('CRYPTO.ETH')} (ETH)`,
          icon: 'eth/ETH',
          value: 'ETH',
        });
      }

      if (!_disableETH &&
          _activeCoins.eth &&
          _activeCoins.eth.length) {
        for (let i = 0; i < _activeCoins.eth.length; i++) {
          if (_activeCoins.eth[i] !== 'eth' ||
              _activeCoins.eth[i] !== 'eth_ropsten') {
            _items.push({
              label: `${translate('CRYPTO.' + _activeCoins.eth[i])} (${_activeCoins.eth[i]})`,
              icon: `eth/${_activeCoins.eth[i]}`,
              value: `ETH|${_activeCoins.eth[i]}`,
            });
          }
        }
      }
    }
  } else {
    for (let i = 0; i < coins.length; i++) {
      try {
        const _coinlc = coins[i].toLowerCase();
        const _coinuc = coins[i].toUpperCase();
        
        if (staticVar.electrumServers &&
            staticVar.electrumServers[_coinlc] &&
            (_activeCoins === 'skip' || (_activeCoins !== 'skip' &&
            _activeCoins &&
            _activeCoins.spv &&
            _activeCoins.native &&
            _activeCoins.spv.indexOf(_coinuc) === -1 &&
            _activeCoins.native.indexOf(_coinuc) === -1))) {
          _items.push({
            label: `${translate('CRYPTO.' + coins[i])} (${coins[i]})`,
            icon: `btc/${coins[i]}`,
            value: `${coins[i]}|${coins[i] === 'KMD' ? availableKMDModes : 'spv'}`,
          });
        }
      } catch (e) {
        console.warn(`electron remote error addcoin ${e}`);
      }
    }

    if (config.experimentalFeatures &&
        !_disableETH) {
      _items.push({
        label: `${translate('CRYPTO.ETH')} (ETH)`,
        icon: 'eth/ETH',
        value: 'ETH',
      }, {
        label: `${translate('CRYPTO.ETH_ROPSTEN')} (TESTNET)`,
        icon: 'eth/ETH',
        value: 'ETH|ropsten',
      });

      for (let key in erc20ContractId) {
        _items.push({
          label: `${translate('CRYPTO.' + key)} (${key})`,
          icon: `eth/${key}`,
          value: `ETH|${key}`,
        });
      }
    }
  }

  _prepCoinsList = _items;

  return _items;
};

const addCoinOptionsCrypto = (activeCoins, disableETH, filterNonActive) => {
  _activeCoins = activeCoins;
  _disableETH = disableETH;

  return prepCoinsList({
    filterActiveCoins: false,
    filterNonActive,
  });
}

export default addCoinOptionsCrypto;