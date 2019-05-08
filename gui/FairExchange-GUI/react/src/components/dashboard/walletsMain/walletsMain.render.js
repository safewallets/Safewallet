import React from 'react';
import WalletsBalance from '../walletsBalance/walletsBalance';
import WalletsInfo from '../walletsInfo/walletsInfo';
import SendCoin from '../sendCoin/sendCoin';
import WalletsProgress from '../walletsProgress/walletsProgress';
import WalletsData from '../walletsData/walletsData';
import ReceiveCoin from '../receiveCoin/receiveCoin';
import {
  getCoinTitle,
  isSafecoinCoin,
} from '../../../util/coinHelper';
import translate from '../../../translate/translate';

const _skipCoins = [
  'SAFE',
  'JUMBLR',
  'MESH',
  'MVP',
];

const WalletsMainRender = function() {
  const _coin = this.props.ActiveCoin.coin;

  return (
    <div className="page margin-left-0">
      <div className="padding-top-0">
        <div
          id="fairexchange-header-div"
          className="background-color-white"
          style={ this.getCoinStyle('transparent') }>
          <ol className={ 'coin-logo breadcrumb' + (_skipCoins.indexOf(_coin) > -1 ? ' coin-logo-wide' : '') + ' native-coin-logo' }>
            <li className="header-fairexchange-section">
              { this.getCoinStyle('title') &&
                <img
                  className={ 'coin-icon' + (_coin === 'SAFE' ? ' safe' : '') }
                  src={ this.getCoinStyle('title') } />
              }
              { _coin === 'SAFE' &&
                <img
                  className="safe-mobile-icon"
                  src={ `assets/images/cryptologo/btc/${_coin.toLowerCase()}.png` } />
              }
              { _skipCoins.indexOf(_coin) === -1 &&
                <span className="margin-left-20 fairexchange-section-image">
                  { translate(((this.props.ActiveCoin.mode === 'spv' || this.props.ActiveCoin.mode === 'native') && isSafecoinCoin(_coin) ? 'ASSETCHAINS.' : 'CRYPTO.') + _coin.toUpperCase()) }
                </span>
              }
            </li>
          </ol>
        </div>
        <div className="page-content page-content-native">
          { this.props.ActiveCoin.mode === 'native' &&
            <WalletsProgress />
          }
          <div className="row">
            <WalletsBalance />
            <ReceiveCoin />
            <WalletsData />
            <SendCoin />
            <WalletsInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletsMainRender;