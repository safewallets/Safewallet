import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';
import { staticVar } from '../../../util/mainWindow';

const ExchangesSupportedCoinsModalRender = function() {
  const renderCoins = () => {
    const coins = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges.coinswitchCoins;
    let items = [];

    if (coins &&
        typeof coins === 'object' &&
        coins.length &&
        coins[0].symbol) {
      for (let i = 0; i < coins.length; i++) {
        if (staticVar.electrumServers &&
            staticVar.electrumServers[coins[i].symbol.toLowerCase()]) {

          items.push(
            <div
              key={ coins[i].symbol }
              className="exchanges-supported-coins-tile">
              <img
                src={ `assets/images/cryptologo/btc/${coins[i].symbol.toLowerCase()}.png` }
                alt={ coins[i].name }
                width="30px"
                height="30px" />
                <span className="margin-left-10">{ coins[i].name }</span>
            </div>
          );
        }
      }
    }

    return items;
  };

  return (
    <div onKeyDown={ (event) => this.handleKeydown(event) }>
      <div
        className={ `modal modal-3d-sign exchanges-supported-coins-modal ${this.state.className}` }
        id="kmd_txid_info_mdl">
        <div
          onClick={ this.close }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-lg">
          <div
            onClick={ this.close }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.close }>
                <span>×</span>
              </button>
              <h4 className="modal-title white">
                { translate('EXCHANGES.SUPPORTED_COINS_TO_EXCHANGE') }
              </h4>
            </div>
            <div className="modal-body modal-body-container">
              { renderCoins() }
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </div>
  );
};

export default ExchangesSupportedCoinsModalRender;