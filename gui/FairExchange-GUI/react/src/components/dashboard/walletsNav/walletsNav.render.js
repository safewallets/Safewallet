import React from 'react';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import mainWindow, { staticVar } from '../../../util/mainWindow';

const WalletsNavWithWalletRender = function() {
  const _coin = this.props.ActiveCoin.coin;
  const _mode = this.props.ActiveCoin.mode;
  const _electrumCoin = this.props.Dashboard.electrumCoins ? this.props.Dashboard.electrumCoins[_coin] : null;
  const _ethereumCoin = this.props.Dashboard.ethereumCoins ? this.props.Dashboard.ethereumCoins[_coin] : null;
  
  return (
    <div>
      <div
        className={ 'page-header page-header-bordered header-easydex padding-bottom-40 margin-bottom-30 ' + (_mode === 'spv' || _mode === 'eth' ? 'page-header--spv' : 'page-header--native') }
        id="header-dashboard">
        { this.props.ActiveCoin &&
          this.props.ActiveCoin.mode === 'spv' &&
          <div>
            <strong>{ translate('INDEX.MY') } { this.props && this.props.ActiveCoin ? _coin : '-' } { translate('INDEX.ADDRESS') }: </strong>
            <span className="blur selectable">
              {
                (mainWindow.multisig &&
                mainWindow.multisig.addresses &&
                mainWindow.multisig.addresses[_coin.toUpperCase()]) || 
                (this.props &&
                this.props.Dashboard &&
                _electrumCoin &&
                _electrumCoin.pub ? _electrumCoin.pub : '-')
              }
            </span>
            <button
              className="btn btn-default btn-xs clipboard-edexaddr"
              onClick={ () => this.copyMyAddress(_electrumCoin.pub) }>
              <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
            </button>
          </div>
        }
        { this.props.ActiveCoin &&
          this.props.ActiveCoin.mode === 'eth' &&
          <div>
            <strong>{ translate('INDEX.MY') } { this.props && this.props.ActiveCoin ? _coin : '-' } { translate('INDEX.ADDRESS') }: </strong>
            <span className="blur selectable">{
              this.props &&
              this.props.Dashboard &&
              _ethereumCoin &&
              _ethereumCoin.pub ? _ethereumCoin.pub : '-'
            }</span>
            <button
              className="btn btn-default btn-xs clipboard-edexaddr"
              onClick={ () => this.copyMyAddress(_ethereumCoin.pub) }>
              <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
            </button>
          </div>
        }
        <div className="page-header-actions">
          <div id="kmd_header_button">
            <button
              type="button"
              className="btn btn-info waves-effect waves-light"
              onClick={ this.toggleNativeWalletInfo }
              disabled={ this.props.ActiveCoin.activeSection === 'settings' }>
              <i className="icon fa-info"></i>
            </button>
            <button
              type="button"
              className="btn btn-dark waves-effect waves-light"
              onClick={ this.toggleNativeWalletTransactions }
              disabled={ this.props.ActiveCoin.activeSection === 'default' }>
              <i className="icon md-view-dashboard"></i> <span className="placeholder">{ translate('INDEX.TRANSACTIONS') }</span>
            </button>
            { this.props.ActiveCoin &&
              (_mode === 'native' || _mode === 'eth' || (_mode === 'spv' && !mainWindow.isWatchOnly())) &&
              <button
                type="button"
                className="btn btn-primary waves-effect waves-light"
                onClick={ () => this.toggleSendCoinForm(!this.props.ActiveCoin.send) }
                disabled={
                  this.checkTotalBalance() <= 0 ||
                  this.props.ActiveCoin.activeSection === 'send'
                }>
                <i className="icon fa-send"></i> <span className="placeholder">{ translate('INDEX.SEND') }</span>
              </button>
            }
            <button
              type="button"
              className="btn btn-success waves-effect waves-light"
              onClick={ () => this.toggleReceiveCoinForm(!this.props.ActiveCoin.receive) }
              disabled={ this.props.ActiveCoin.activeSection === 'receive' }>
              <i className="icon fa-inbox"></i> <span className="placeholder">{ translate('INDEX.RECEIVE') }</span>
            </button>
            { (_mode === 'spv' && mainWindow.isWatchOnly()) &&
              <i
                className="icon fa-question-circle settings-help"
                data-tip={ translate('INDEX.LITE_MODE_WATCHONLY') }
                data-for="walletsNav"></i>
            }
            <ReactTooltip
              id="walletsNav"
              effect="solid"
              className="text-top" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletsNavWithWalletRender;