import translate from '../../translate/translate';
import mainWindow, { staticVar } from '../../util/mainWindow';
import config from '../../config';
import { kmdAssetChains } from 'agama-wallet-lib/src/coin-helpers';
import { sortObject } from 'agama-wallet-lib/src/utils';

// TODO: detect if ac has electrums or not

const _disabledAC = {
  spv: [
    'axo',
    'etomic',
    'mesh',
    'ceal',
    'dsec',
    'pirate',
    'mtst3',
  ],
  native: [
    'vrsc',
    'spltest',
  ],
  all: [
    'mvp',
  ],
};

// sort coins by their title
let coinsList = [];
let _coins = {};

for (let i = 0; i < kmdAssetChains.length; i++) {
  _coins[translate('ASSETCHAINS.' + kmdAssetChains[i].toUpperCase())] = kmdAssetChains[i];
}

_coins = sortObject(_coins);

for (let key in _coins) {
  coinsList.push(_coins[key]);
}

const addCoinOptionsAC = (activeCoins) => {
  let _assetChains;
  let _items = [];

  _assetChains = coinsList;

  for (let i = 0; i < _assetChains.length; i++) {
    const _coinlc = _assetChains[i].toLowerCase();
    const _coinuc = _assetChains[i].toUpperCase();
    let availableModes;

    if (_disabledAC.spv.indexOf(_coinlc) === -1) {
      availableModes = 'spv|native';
    } else {
      availableModes = 'native'
    }

    if (_disabledAC.native.indexOf(_coinlc) > -1) {
      availableModes = 'spv';
    }

    if (staticVar.arch !== 'x64') {
      availableModes = 'spv';
    }

    if (_disabledAC.all.indexOf(_coinlc) === -1 &&
        (activeCoins === 'skip' || (activeCoins !== 'skip' &&
         activeCoins &&
         activeCoins.spv &&
         activeCoins.native &&
         activeCoins.spv.indexOf(_coinuc) === -1 &&
         activeCoins.native.indexOf(_coinuc) === -1))) {
      const _placeholder = translate(`ASSETCHAINS.${_coinuc}`);

      _items.push({
        label: `${_placeholder}${_placeholder.indexOf('(') === -1 && _placeholder !== _coinuc ? ' (' + _coinuc + ')' : ''}`,
        icon: `btc/${_coinlc}`,
        value: `${_coinuc}|${availableModes}`,
      });
    }
  }

  if (config.experimentalFeatures) {
    const _customAssetChains = {
      mining: [
      ],
      staking: [
      ],
    };

    for (let key in _customAssetChains) {
      for (let i = 0; i < _customAssetChains[key].length; i++) {
        const _customuc = _customAssetChains[key][i].toUpperCase();
        const _customlc = _customAssetChains[key][i].toLowerCase();
        const _placeholder = translate(`ASSETCHAINS.${_customuc}`);

        _items.push({
          label: _placeholder + (_placeholder.indexOf('(') === -1 && _placeholder !== _customuc ? ` (${_customuc})` : ''),
          icon: `btc/${_customlc}`,
          value: `${_customuc}|${key}`,
        });
      }
    }
  }

  return _items;
}

export default addCoinOptionsAC;