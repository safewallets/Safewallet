import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { triggerToaster } from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  SyncErrorBlocksRender,
  SyncPercentageRender,
  LoadingBlocksRender,
  TranslationComponentsRender,
  ChainActivationNotificationRender,
  VerifyingBlocksRender,
  WalletsProgressRender,
} from './walletsProgress.render';
import mainWindow, { staticVar } from '../../../util/mainWindow';

class WalletsProgress extends React.Component {
  constructor() {
    super();
    this.state = {
      prevProgress: {},
      isWindows: false,
      isWindowsWorkaroundEnabled: false,
    };
    this.isWinSyncPercBelowThreshold = this.isWinSyncPercBelowThreshold.bind(this);
    this.applyWindowsSyncWorkaround = this.applyWindowsSyncWorkaround.bind(this);
  }

  componentWillMount() {
    const _mainWindow = mainWindow;
    const _isWindows = mainWindow.isWindows;

    if (_isWindows) {
      _mainWindow.getMaxconKMDConf()
      .then((res) => {
        if (!res ||
            Number(res) !== 1) {
          this.setState({
            isWindowsWorkaroundEnabled: false,
            isWindows: _isWindows,
          });
        } else {
          this.setState({
            isWindowsWorkaroundEnabled: true,
            isWindows: _isWindows,
          });
        }
      });
    }
  }

  applyWindowsSyncWorkaround() {
    const _mainWindow = mainWindow;

    _mainWindow.setMaxconKMDConf(1)
    .then((res) => {
      if (res) {
        this.setState({
          isWindowsWorkaroundEnabled: true,
        });

        Store.dispatch(
          triggerToaster(
            translate('DASHBOARD.WIN_SYNC_WORKAROUND_APPLIED'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );

        setTimeout(() => {
          mainWindow.appExit();
        }, 2000);
      } else {
        Store.dispatch(
          triggerToaster(
            translate('DASHBOARD.WIN_SYNC_WORKAROUND_APPLY_FAILED'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
      }
    });
  }

  componentWillReceiveProps(props) {
    const _coin = props.ActiveCoin;

    if (_coin &&
      _coin.progress &&
        Number(_coin.progress.longestchain) === 0) {
      let _progress = _coin.progress;

      if (this.state.prevProgress &&
          this.state.prevProgress.longestchain &&
          Number(this.state.prevProgress.longestchain) > 0) {
        _progress.longestchain = this.state.prevProgress.longestchain;
      }

      this.setState(Object.assign({}, this.state, {
        prevProgress: _progress,
      }));
    } else {
      this.setState(Object.assign({}, this.state, {
        prevProgress: props.ActiveCoin.progress,
      }));
    }

    if (this.isWinSyncPercBelowThreshold() !== -777 &&
        this.state.isWindowsWorkaroundEnabled &&
        !this.isWinSyncPercBelowThreshold()) {
      const _mainWindow = mainWindow;

      _mainWindow.setMaxconKMDConf()
      .then((res) => {
        if (res) {
          this.setState({
            isWindowsWorkaroundEnabled: false,
          });

          Store.dispatch(
            triggerToaster(
              translate('DASHBOARD.WIN_SYNC_WORKAROUND_REVERTED'),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'info',
              false
            )
          );
        } else {
          Store.dispatch(
            triggerToaster(
              translate('DASHBOARD.WIN_SYNC_WORKAROUND_APPLY_FAILED'),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
        }
      });
    }
  }

  isWinSyncPercBelowThreshold() {
    const _prevProgress = this.state.prevProgress;

    if (_prevProgress &&
        _prevProgress.longestchain &&
        _prevProgress.blocks &&
        _prevProgress.longestchain > 0 &&
        _prevProgress.blocks > 0) {
      if (Number(_prevProgress.blocks) * 100 / Number(_prevProgress.longestchain) < 30) {
        return true;
      }
    } else {
      return -777;
    }
  }

  renderChainActivationNotification() {
    const _progress = this.props.ActiveCoin.progress;

    if (_progress) {
      if ((!_progress.blocks && !_progress.longestchain) ||
          (_progress.blocks < _progress.longestchain) ||
          this.props.ActiveCoin.rescanInProgress) {
        return ChainActivationNotificationRender.call(this);
      }
    } else {
      if (this.props.ActiveCoin.rescanInProgress) {
        return ChainActivationNotificationRender.call(this);
      } else {
        return null;
      }
    }
  }

  parseActivatingBestChainProgress() {
    const _debugLogProps = this.props.Settings.debugLog;
    let _debugLogLine;

    if (_debugLogProps.indexOf('\n') > -1) {
      const _debugLogMulti = _debugLogProps.split('\n');

      for (let i = 0; i < _debugLogMulti.length; i++) {
        if (_debugLogMulti[i].indexOf('progress=') > -1) {
          _debugLogLine = _debugLogMulti[i];
        }
      }
    } else {
      _debugLogLine = _debugLogProps;
    }

    if (_debugLogLine) {
      const temp = _debugLogLine.split(' ');
      let currentBestChain;
      let currentProgress;

      for (let i = 0; i < temp.length; i++) {
        if (temp[i].indexOf('height=') > -1) {
          currentBestChain = temp[i].replace('height=', '');
        }

        if (temp[i].indexOf('progress=') > -1) {
          currentProgress = Number(temp[i].replace('progress=', '')) * 1000;

          if (currentProgress > 100) {
            currentProgress = Number(temp[i].replace('progress=', '')) * 100;
          }
        }
      }

      const _coinProgress = this.props.ActiveCoin.progress;

      if (_coinProgress.remoteKMDNode &&
        _coinProgress.remoteKMDNode.blocks) {
        const longestHeight = _coinProgress.remoteKMDNode.blocks;

        return [
          currentBestChain,
          currentProgress,
          longestHeight
        ];
      } else {
        return [
          currentBestChain,
          currentProgress
        ];
      }
    }
  }

  renderSyncPercentagePlaceholder() {
    const _progress = this.props.ActiveCoin.progress;

    // activating best chain
    if (_progress &&
        _progress.code &&
        _progress.code === -28 &&
        this.props.Settings.debugLog) {
      if (_progress.message === 'Activating best chain...') {
        const _parseProgress = this.parseActivatingBestChainProgress();

        if (_parseProgress &&
            _parseProgress[1]) {
          return SyncPercentageRender.call(this, `${_parseProgress[1].toFixed(2)}%`, _parseProgress[0], _parseProgress[2] ? _parseProgress[2] : null);
        } else {
          return LoadingBlocksRender.call(this);
        }
      } else if (_progress.message === 'Verifying blocks...') {
        return VerifyingBlocksRender.call(this);
      }
    }

    if (_progress &&
        _progress.blocks === 0) {
      return SyncErrorBlocksRender.call(this);
    }

    if (_progress &&
        _progress.blocks &&
        _progress.blocks > 0) {
      const syncPercentage = (parseFloat(parseInt(_progress.blocks, 10) * 100 / parseInt(Number(_progress.longestchain) || Number(this.state.prevProgress.longestchain), 10)).toFixed(2) + '%').replace('NaN', 0);
      return SyncPercentageRender.call(this, syncPercentage === 1000 ? 100 : syncPercentage);
    }

    return LoadingBlocksRender.call(this);
  }

  renderLB(translationID) {
    return TranslationComponentsRender.call(this, translationID);
  }

  renderRescanProgress() {
    const _coinProgress = this.props.ActiveCoin.progress;

    if (this.props.Settings.debugLog.indexOf('Still rescanning') > -1 &&
        ((this.props.ActiveCoin.rescanInProgress) || (_coinProgress && _coinProgress.code && _coinProgress.code === -28 && _coinProgress.message === 'Rescanning...'))) {
      const temp = this.props.Settings.debugLog.split(' ');
      let currentProgress;

      for (let i = 0; i < temp.length; i++) {
        if (temp[i].indexOf('Progress=') > -1) {
          currentProgress = Number(temp[i].replace('Progress=', '')) * 100;
        }
      }

      return currentProgress;
    } else {
      return null;
    }
  }

  renderActivatingBestChainProgress() {
    const _coinProgress = this.props.ActiveCoin.progress;
    const _debugLog = this.props.Settings.debugLog;

    if (this.props.Settings &&
        _debugLog &&
        !this.props.ActiveCoin.rescanInProgress) {
      if (_debugLog.indexOf('UpdateTip') > -1 &&
          !_coinProgress &&
          !_coinProgress.blocks) {
        const temp = _debugLog.split(' ');
        let currentBestChain;
        let currentProgress;

        for (let i = 0; i < temp.length; i++) {
          if (temp[i].indexOf('height=') > -1) {
            currentBestChain = temp[i].replace('height=', '');
          }
          if (temp[i].indexOf('progress=') > -1) {
            currentProgress = Number(temp[i].replace('progress=', '')) * 100;
          }
        }

        // fallback to local data if remote node is inaccessible
        const _remoteNode = this.props.ActiveCoin.progress.remoteKMDNode;
        if (_remoteNode &&
            !_remoteNode.blocks) {
          return (
            `: ${currentProgress}% (${ translate('INDEX.ACTIVATING_SM') })`
          );
        } else {
          if (_remoteNode &&
              _remoteNode.blocks) {
            return(
              `: ${Math.floor(currentBestChain * 100 / _remoteNode.blocks)}% (${ translate('INDEX.BLOCKS_SM') } ${currentBestChain} / ${_remoteNode.blocks})`
            );
          }
        }
      } else if (
          _debugLog.indexOf('Still rescanning') > -1 &&
          !_coinProgress ||
          !_coinProgress.blocks
      ) {
        const temp = _debugLog.split(' ');
        let currentProgress;

        for (let i = 0; i < temp.length; i++) {
          if (temp[i].indexOf('Progress=') > -1) {
            currentProgress = Number(temp[i].replace('Progress=', '')) * 100;
          }
        }

        // activating best chain
        if (_coinProgress &&
            _coinProgress.code &&
            _coinProgress.code === -28 &&
            _debugLog) {
          const _blocks = this.parseActivatingBestChainProgress();

          if (_blocks &&
              _blocks[0]) {
            return (
              `: ${_blocks[0]} (${ translate('DASHBOARD.CURRENT_BLOCK_SM') })`
            );
          } else {
            return null;
          }
        } else {
          if (currentProgress) {
            return (
              `: ${currentProgress.toFixed(2)}% (${ translate('INDEX.RESCAN_SM') })`
            );
          } else {
            return null;
          }
        }
      } else if (_debugLog.indexOf('Rescanning last') > -1) {
        return (
          `: (${ translate('INDEX.RESCANNING_LAST_BLOCKS') })`
        );
      } else if (
        _debugLog.indexOf('LoadExternalBlockFile:') > -1 ||
        _debugLog.indexOf('Reindexing block file') > -1
      ) {
        return (
          `: (${ translate('INDEX.REINDEX') })`
        );
      } else {
        return (
          <span> ({ translate('INDEX.DL_BLOCKS') })</span>
        );
      }
    }
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin) {
      return WalletsProgressRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    Dashboard: state.Dashboard,
    Settings: {
      debugLog: state.Settings.debugLog,
    },
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
      progress: state.ActiveCoin.progress,
      rescanInProgress: state.ActiveCoin.rescanInProgress,
    },
  };
};

export default connect(mapStateToProps)(WalletsProgress);