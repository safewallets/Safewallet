import React from 'react';
import translate from '../../../translate/translate';

export const VerifyingBlocksRender = function() {
  return (
    <div className="progress-bar progress-bar-info progress-bar-striped active full-width">
      <span className="full-width">{ translate('INDEX.VERIFYING_BLOCKS') }...</span>
    </div>
  );
};

export const SyncErrorBlocksRender = function() {
  return (
    <div className="progress-bar progress-bar-info progress-bar-striped active full-width">
      <span className="full-width">{ translate('INDEX.SYNC_ERR_BLOCKS') }</span>
    </div>
  );
};

export const SyncPercentageRender = function(syncPercentage, currentBlock, maxHeight) {
  if (this.props.ActiveCoin.rescanInProgress) {
    return (
      <div className="progress-bar progress-bar-info progress-bar-striped active full-width">
        <span className="full-width">{ translate('INDEX.PLEASE_WAIT_UNTIL_RESCAN_FINISHED') }</span>
      </div>
    );
  } else {
    if (syncPercentage === 'Infinity%') {
      return (
        <div
          className="progress-bar progress-bar-info progress-bar-striped active"
          style={{ width: syncPercentage }}>
          <span style={{ width: syncPercentage }}>
            { translate('INDEX.BLOCKS') }:&nbsp;
            { this.props.ActiveCoin.progress.blocks }&nbsp;|&nbsp;
            { translate('INDEX.CONNECTIONS') }:&nbsp;
            { this.props.ActiveCoin.progress.connections }
          </span>
        </div>
      );
    } else {
      return (
        <div
          className="progress-bar progress-bar-info progress-bar-striped active"
          style={{ width: syncPercentage }}>
          <span style={{ width: syncPercentage }}>
            { syncPercentage === '100.00%' ? '100%' : syncPercentage }&nbsp;
            { (this.props.ActiveCoin.progress.blocks || currentBlock) &&
              <span>|&nbsp;
                { this.props.ActiveCoin.progress.blocks || currentBlock }&nbsp;
                { (this.props.ActiveCoin.progress.longestchain || maxHeight) &&
                  <span>/&nbsp;
                  { this.props.ActiveCoin.progress.longestchain || maxHeight }
                  </span>
                }
              &nbsp;
              </span>
            }
            { this.props.ActiveCoin.progress.connections &&
              <span>|&nbsp;
                { translate('INDEX.CONNECTIONS') }:&nbsp;
                { this.props.ActiveCoin.progress.connections }
              </span>
            }
          </span>
        </div>
      );
    }
  }
};

export const LoadingBlocksRender = function() {
  return (
    <div className="progress-bar progress-bar-info progress-bar-striped active full-width">
      <span className="full-width">
      { translate('INDEX.' + (this.props.ActiveCoin.rescanInProgress ? 'PLEASE_WAIT_UNTIL_RESCAN_FINISHED' : 'LOADING_BLOCKS')) }
      </span>
    </div>
  );
};

export const TranslationComponentsRender = function(translationID) {
  const translationComponents = translate(translationID).split('<br>');
  let _items = [];

  for (let i = 0; i < translationComponents.length; i++) {
    _items.push(
      <span key={ `wallets-progress-translate-${Math.random(0, 9) * 10}` }>
        { translationComponents[i] }
        <br />
      </span>
    );
  }

  return _items;
};

export const ChainActivationNotificationRender = function() {
  if (this.props.ActiveCoin.coin !== 'CHIPS') {
    return (
      <div>
        <div className={ 'alert alert-info alert-dismissible margin-bottom-' + (this.state.isWindows && !this.state.isWindowsWorkaroundEnabled && this.isWinSyncPercBelowThreshold() === true && this.props.ActiveCoin && this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin === 'KMD' ? 20 : 50) }>
          <h4>
            { translate('INDEX.ACTIVATING_CHAIN') }&nbsp;
            { this.props.ActiveCoin.rescanInProgress || (this.props.ActiveCoin.progress && this.props.ActiveCoin.progress.code && this.props.ActiveCoin.progress.code === -28 && this.props.ActiveCoin.progress.message === 'Rescanning...') ? (this.renderRescanProgress() ? `: ${this.renderRescanProgress().toFixed(2)}% ${translate('INDEX.PROGRESS_RESCANNING_BLOCKS')}` : translate('INDEX.PROGRESS_RESCANNING_BLOCKS')) : this.renderActivatingBestChainProgress() }
          </h4>
          <p>{ this.renderLB('INDEX.KMD_STARTED') }</p>
        </div>
        { this.state.isWindows &&
          !this.state.isWindowsWorkaroundEnabled &&
          this.isWinSyncPercBelowThreshold() === true &&
          this.props.ActiveCoin &&
          this.props.ActiveCoin.mode === 'native' &&
          this.props.ActiveCoin.coin === 'KMD' &&
          <div className="alert alert-warning alert-dismissible margin-bottom-50">
            <p>{ translate('DASHBOARD.WIN_SYNC_WORKAROUND_CTA_P1') }</p>
            <p className="selectable">{ translate('DASHBOARD.WIN_SYNC_WORKAROUND_CTA_P2') }</p>
            <p className="padding-bottom-15">{ translate('DASHBOARD.WIN_SYNC_WORKAROUND_CTA_P3') }</p>
            <button
              type="button"
              className="btn btn-info waves-effect waves-light win-sync-workaround-btn"
              onClick={ this.applyWindowsSyncWorkaround }>
              { translate('DASHBOARD.APPLY_WORKAROUND') }
            </button>
          </div>
        }
      </div>
    );
  } else {
    return null;
  }
};

export const WalletsProgressRender = function() {
  return (
    <div
      id="edex-footer"
      className="margin-bottom-30 margin-top-10">
      <div>
        { this.renderChainActivationNotification() }
        <div className="row sync-progress-container">
          <div className="col-xs-12">
            <div className="progress">
              { this.renderSyncPercentagePlaceholder() }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};