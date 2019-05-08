import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';

const ExchangesTOSModalRender = function() {
  return (
    <div onKeyDown={ (event) => this.handleKeydown(event) }>
      <div
        className={ `modal modal-3d-sign exchanges-tos-modal ${this.state.className}` }
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
                { translate('EXCHANGES.EXCHANGE_TOS') }
              </h4>
            </div>
            <div className="modal-body modal-body-container">
              <p>{ translate('EXCHANGES.TOS_P1') } <a onClick={ this.openCoinswitchTOS } className="pointer">{ translate('EXCHANGES.TOS_P2') }</a>. { translate('EXCHANGES.TOS_P3') } <a onClick={ this.openCoinswitchTOS } className="pointer">{ translate('EXCHANGES.TOS_P2') }</a>.</p>
              <p>{ translate('EXCHANGES.TOS_P4') }</p>
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </div>
  );
};

export default ExchangesTOSModalRender;