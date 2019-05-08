import React from 'react';
import { connect } from 'react-redux';
import {
  dashboardChangeActiveCoin,
  getAddressesByAccount,
  getSyncInfo,
  startInterval,
  stopInterval,
  getKMDAddressesNative,
  changeActiveAddress,
  getKMDOPID,
  getNativeTxHistory,
  getKMDBalanceTotal,
  getSyncInfoNative,
  getDebugLog,
  getDashboardUpdate,
  apiElectrumBalance,
  apiElectrumTransactions,
  apiElectrumCoins,
  electrumServerChanged,
  apiEthereumBalance,
  apiEthereumTransactions,
  apiEthereumCoins,
  apiStopCoind,
  getDexCoins,
  activeHandle,
  triggerToaster,
  apiRemoveCoin,
  toggleCoindDownModal,
  dashboardRemoveCoin,
  prices,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import mainWindow from '../../../util/mainWindow';
import translate from '../../../translate/translate';

import CoinTileItemRender from './coinTileItem.render';

const SPV_DASHBOARD_UPDATE_TIMEOUT = 60000;
const ETH_DASHBOARD_UPDATE_TIMEOUT = 60000;
const ACTIVE_HANDLE_TIMEOUT_COIND_NATIVE = 15000;
const ACTIVE_HANDLE_TIMEOUT_COIND_NATIVE_RCP2CLI = 40000;
const COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD = mainWindow.appConfig.native.failedRPCAttemptsThreshold || 10;
const COIND_STOP_MAX_RETRIES = 15;
const PRICES_UPDATE_INTERVAL = 120000; // every 2m

class CoinTileItem extends React.Component {
  constructor() {
    super();
    this.state = {
      activeCoin: null,
      activeCoinMode: null,
      propsUpdatedCounter: 0,
      toggledCoinMenu: null,
      coindStopRetries: {},
    };
    this.autoSetActiveCoin = this.autoSetActiveCoin.bind(this);
    this.toggleCoinMenu = this.toggleCoinMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.stopAllCoind = this.stopAllCoind.bind(this);
  }

  componentWillMount() {
    if (!this.props.ActiveCoin.coin) {
      this.autoSetActiveCoin();
    }

    document.addEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  handleClickOutside(e) {
    const _srcElement = e ? e.srcElement : null;
    
    if (e &&
        _srcElement &&
        _srcElement.offsetParent &&
        _srcElement.offsetParent.className.indexOf('dropdown') === -1 &&
      (_srcElement.offsetParent && _srcElement.offsetParent.className.indexOf('dropdown') === -1)) {
      this.setState({
        toggledCoinMenu: _srcElement.className.indexOf('coin-tile-context-menu-trigger') === -1 ? null : this.state.toggledCoinMenu,
      });
    }
  }

  toggleCoinMenu(coin) {
    this.setState({
      toggledCoinMenu: this.state.toggledCoinMenu === coin ? null : coin,
    });
  }

  openCoindDownModal() {
    Store.dispatch(toggleCoindDownModal(true));
  }

  renderCoinConError(item) {
    const _coins = this.props.ActiveCoin.coins;

    if (this.props.ActiveCoin.getinfoFetchFailures >= COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD &&
        (this.props.ActiveCoin.mode === 'native' &&
        this.props.ActiveCoin.coin === this.state.activeCoin &&
        this.props.ActiveCoin.coin === item.coin &&
        this.state.activeCoin === item.coin &&
        this.state.activeCoinMode === 'native' &&
        this.props.ActiveCoin.mode === this.state.activeCoinMode &&
        this.state.propsUpdatedCounter > 1) ||
        (_coins && _coins[item.coin]) && _coins[item.coin].getinfoFetchFailures >= COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD) {
      return true;
    }
  }

  renderStopAllCoinsButton() {
    const _main = this.props.Main;

    if (_main &&
        _main.coins &&
        _main.coins.native &&
        _main.coins.native.length &&
        _main.coins.native.length > 1) {
      return true;
    }
  }

  renderStopCoinButton() {
    const _main = this.props.Main;

    if (_main &&
        _main.coins &&
        _main.coins.native &&
        _main.coins.native.length) {
      return true;
    }
  }

  renderRemoveCoinButton() {
    const _main = this.props.Main;

    if (_main &&
        _main.coins &&
        ((_main.coins.native &&
          _main.coins.native.length &&
        !Config.native.stopNativeDaemonsOnQuit) ||
        (_main.coins.spv && _main.coins.spv.length) ||
        (_main.coins.eth && _main.coins.eth.length))) {
      return true;
    }
  }

  autoSetActiveCoin(skipCoin) {
    const modes = [
      'native',
      'spv',
      'eth',
    ];
    const allCoins = this.props.Main.coins;
    let _coinSelected = false;
    let _coinMode = {};
    let _mode;
    let _coin;

    if (allCoins) {
      modes.map((mode) => {
        allCoins[mode].map((coin) => {
          if (!_coinSelected &&
              coin !== skipCoin) {
            _coinSelected = true;
            _coin = coin;
            _mode = mode;
          }
          _coinMode[coin] = mode;
        });

        if (_coinMode.KMD &&
            _coinMode.KMD === 'native' &&
            skipCoin !== 'KMD') {
          _coin = 'KMD';
          _mode = 'native';
        } else if (
          _coinMode.KMD &&
          _coinMode.KMD === 'spv' &&
          skipCoin !== 'KMD'
        ) {
          _coin = 'KMD';
          _mode = 'spv';
        }
      });

      setTimeout(() => {
        this._dashboardChangeActiveCoin(_coin, _mode, true);
      }, 100);
    }
  }

  removeCoin(coin, mode) {
    this.setState({
      toggledCoinMenu: null,
    });

    apiRemoveCoin(coin, mode)
    .then((res) => {
      Store.dispatch(
        triggerToaster(
          `${coin} ${translate('TOASTR.COIN_IS_REMOVED')}`,
          translate('TOASTR.COIN_NOTIFICATION'),
          'success'
        )
      );

      Store.dispatch(dashboardRemoveCoin(coin));
      this.autoSetActiveCoin(coin);
      setTimeout(() => {
        Store.dispatch(getDexCoins());
        Store.dispatch(activeHandle());
      }, 500);
    });
  }

  stopCoind(coin, i, _coins) {
    this.setState({
      toggledCoinMenu: null,
      coindStopRetries: {
        [coin]: this.state.coindStopRetries[coin] ? this.state.coindStopRetries[coin] : 0,
      },
    });

    apiStopCoind(coin)
    .then((res) => {
      if (res.msg === 'error') {
        if (!this.state.coindStopRetries[coin]) {
          Store.dispatch(
            triggerToaster(
              translate('TOASTR.COIND_STOP_IN_PROGRESS', coin),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'warning'
            )
          );
        }
        
        if (this.state.coindStopRetries[coin] < COIND_STOP_MAX_RETRIES &&
            this.props.Main.coins.native.indexOf(coin) > -1) {
          setTimeout(() => {
            this.setState({
              coindStopRetries: {
                [coin]: Number(this.state.coindStopRetries) + 1,
              },
            });
            setTimeout(() => {
              this.stopCoind(coin);
            }, 10);
          }, 1500);
        } else {
          Store.dispatch(
            triggerToaster(
              translate('TOASTR.COIN_UNABLE_TO_STOP', coin),
              translate('TOASTR.ERROR'),
              'error'
            )
          );
        }
      } else {
        Store.dispatch(
          triggerToaster(
            `${coin} ${translate('TOASTR.COIN_IS_STOPPED')}`,
            translate('TOASTR.COIN_NOTIFICATION'),
            'success'
          )
        );

        if (!_coins) {
          this.autoSetActiveCoin(coin);
          setTimeout(() => {
            this.setState({
              coindStopRetries: {
                [coin]: 0,
              },
            });
            Store.dispatch(getDexCoins());
            Store.dispatch(activeHandle());
          }, 500);
        }
      }

      if (i && 
          _coins &&
          i === _coins.length - 1) {
        this.autoSetActiveCoin(coin);
        setTimeout(() => {
          Store.dispatch(getDexCoins());
          Store.dispatch(activeHandle());
        }, 500);
      }
    });
  }

  stopAllCoind() {
    const _coins = this.props.Main.coins.native;

    this.setState({
      toggledCoinMenu: null,
    });

    for (let i = 0; i < _coins.length; i++) {
      const coin = _coins[i];

      setTimeout(() => {
        this.stopCoind(coin, i, _coins);
      }, i === 0 ? 0 : i * 2000);
    }
  }

  dispatchCoinActions(coin, mode) {
    const _dashboard = this.props.Dashboard;
    const _coin = this.props.ActiveCoin;
    
    if (_dashboard &&
        _dashboard.activeSection === 'wallets') {
      if (mode === 'native') {
        const syncPercentage = _coin && _coin.progress && (parseFloat(parseInt(_coin.progress.blocks, 10) * 100 / parseInt(_coin.progress.longestchain, 10)).toFixed(2)).replace('NaN', 0);

        if ((syncPercentage < 100 &&
            (!_dashboard.displayCoindDownModal || _coin.getinfoFetchFailures < COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD)) ||
            _coin.rescanInProgress) {
          if (coin === 'KMD') {
            Store.dispatch(getDebugLog('komodo', 50));
          } else {
            Store.dispatch(getDebugLog('komodo', 50, coin));
          }
        }

        if ((!_dashboard.displayCoindDownModal || _coin.getinfoFetchFailures < COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD) &&
            _coin.progress &&
            _coin.progress.blocks &&
            _coin.progress.longestchain &&
            syncPercentage) {
          Store.dispatch(
            getSyncInfoNative(
              coin,
              true,
              _dashboard.skipFullDashboardUpdate,
              _coin.rescanInProgress
            )
          );

          if (!_dashboard.skipFullDashboardUpdate) {
            Store.dispatch(getDashboardUpdate(coin, _coin));
          }
        } else {
          Store.dispatch(
            getSyncInfoNative(
              coin,
              null,
              _dashboard.skipFullDashboardUpdate,
              _coin.rescanInProgress
            )
          );
        }
      } else if (
        mode === 'spv' &&
        _dashboard.electrumCoins &&
        _dashboard.electrumCoins[coin] &&
        _dashboard.electrumCoins[coin].pub
      ) {
        Store.dispatch(apiElectrumBalance(coin, _dashboard.electrumCoins[coin].pub));

        if (this.props.ActiveCoin.activeSection === 'default') {
          Store.dispatch(apiElectrumTransactions(coin, _dashboard.electrumCoins[coin].pub));
        }
      } else if (
        mode === 'eth' &&
        _dashboard.ethereumCoins &&
        _dashboard.ethereumCoins[coin] &&
        _dashboard.ethereumCoins[coin].pub
      ) {
        Store.dispatch(apiEthereumBalance(coin, _dashboard.ethereumCoins[coin].pub));

        if (this.props.ActiveCoin.activeSection === 'default') {
          Store.dispatch(apiEthereumTransactions(coin, _dashboard.ethereumCoins[coin].pub));
        }
      }
    }
  }

  _dashboardChangeActiveCoin(coin, mode, skipCoinsArrUpdate) {
    if (coin !== this.props.ActiveCoin.coin) {
      Store.dispatch(dashboardChangeActiveCoin(coin, mode, skipCoinsArrUpdate));
      setTimeout(() => {
        this.dispatchCoinActions(coin, mode);
      }, 100);

      if (mode === 'native' ||
          mode === 'spv' ||
          mode === 'eth') { // faster coin data load if fully synced
        setTimeout(() => {
          this.dispatchCoinActions(coin, mode);
        }, 1000);
      }

      if (this.props.Interval.interval.sync) {
        Store.dispatch(
          stopInterval(
            'sync',
            this.props.Interval.interval
          )
        );
      }

      if (this.props.Interval.interval.prices) {
        Store.dispatch(
          stopInterval(
            'prices',
            this.props.Interval.interval
          )
        );
      }

      if (mode === 'native') {
        const _iguanaActiveHandle = setInterval(() => {
          this.dispatchCoinActions(coin, mode);
        }, Config.rpc2cli ? ACTIVE_HANDLE_TIMEOUT_COIND_NATIVE_RCP2CLI : ACTIVE_HANDLE_TIMEOUT_COIND_NATIVE);

        Store.dispatch(startInterval('sync', _iguanaActiveHandle));
      } else if (mode === 'spv') {
        const _iguanaActiveHandle = setInterval(() => {
          this.dispatchCoinActions(coin, mode);
        }, SPV_DASHBOARD_UPDATE_TIMEOUT);

        Store.dispatch(startInterval('sync', _iguanaActiveHandle));
      } else if (mode === 'eth') {
        const _iguanaActiveHandle = setInterval(() => {
          this.dispatchCoinActions(coin, mode);
        }, ETH_DASHBOARD_UPDATE_TIMEOUT);

        Store.dispatch(startInterval('sync', _iguanaActiveHandle));
      }

      if (Config.fiatRates) {  
        Store.dispatch(prices(coin, Config.defaultFiatCurrency));

        const _pricesInterval = this.pricesInterval = setInterval(() => {
          Store.dispatch(prices(coin, Config.defaultFiatCurrency));
        }, PRICES_UPDATE_INTERVAL);

        Store.dispatch(startInterval('prices', _pricesInterval));
      }
    }
  }

  componentWillReceiveProps(props) {
    if (this.props &&
        this.props.Dashboard &&
        this.props.Dashboard.eletrumServerChanged &&
        this.props.ActiveCoin.mode === 'spv' &&
        this.props.Dashboard &&
        this.props.Dashboard.activeSection === 'wallets') {
      const _coin = this.props.ActiveCoin.coin;
      const _pub = this.props.Dashboard.electrumCoins[_coin].pub;
      
      Store.dispatch(apiElectrumBalance(_coin, _pub));
      Store.dispatch(apiElectrumTransactions(_coin, _pub));
      Store.dispatch(electrumServerChanged(false));
      setTimeout(() => {
        Store.dispatch(electrumServerChanged(false));
      }, 100);
    }

    this.setState({
      activeCoin: props.ActiveCoin.coin,
      activeCoinMode: props.ActiveCoin.mode,
      // prevent native con error icon flashing on coin switch
      propsUpdatedCounter: this.state.activeCoin === props.ActiveCoin.coin && this.state.activeCoinMode === props.ActiveCoin.mode ? this.state.propsUpdatedCounter + 1 : 0,
    });
  }

  render() {
    return CoinTileItemRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      coins: state.ActiveCoin.coins,
      mode: state.ActiveCoin.mode,
      addresses: state.ActiveCoin.addresses,
      mainBasiliskAddress: state.ActiveCoin.mainBasiliskAddress,
      progress: state.ActiveCoin.progress,
      rescanInProgress: state.ActiveCoin.rescanInProgress,
      getinfoFetchFailures: state.ActiveCoin.getinfoFetchFailures,
      activeSection: state.ActiveCoin.activeSection,
    },
    Dashboard: state.Dashboard,
    Interval: {
      interval: state.Interval.interval,
    },
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(CoinTileItem);