import React from 'react';
import { connect } from 'react-redux';
import {
  getExchangesCache,
  exchangesGetRate,
  exchangesHistorySync,  
  toggleExchangesOrderInfoModal,
  apiElectrumBalancePromise,
  apiEthereumBalancePromise,
  apiElectrumBalance,
  dashboardChangeActiveCoin,
  triggerToaster,
  sendToAddressState,
  exchangesPlaceOrder,
  updateExchangesCacheDeposit,
  pricesPromise,
  apiGetRemoteBTCFees,
  apiGetLocalBTCFees,
  apiElectrumSendPreflight,
  apiEthereumGasPrice,
  apiEthereumSend,
  apiEthereumSendERC20Preflight,
  toggleExchangesTOSModal,
  toggleExchangesSupportedCoinsModal,
  getExchangesCoinswitchCoins,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import ExchangesRender, {
  RenderExchangeHistory,
  RenderNewOrderForm,
} from './exchanges.render';
import translate from '../../../translate/translate';
import devlog from '../../../util/devlog';
import {
  explorerList,
  isKomodoCoin,
} from 'agama-wallet-lib/src/coin-helpers';
import {
  isPositiveNumber,
  fromSats,
  toSats,
  parseBitcoinURL,
} from 'agama-wallet-lib/src/utils';
import { formatEther } from 'ethers/utils/units';
import { getAddress } from 'ethers/utils/address';
import coinFees from 'agama-wallet-lib/src/fees';
import erc20ContractId from 'agama-wallet-lib/src/eth-erc20-contract-id';

const { shell } = window.require('electron');
const EXCHANGES_CACHE_UPDATE_INTERVAL = 60; // sec
const EXCHANGES_COINSWITCH_COINS_UPDATE_INTERVAL = 120; // sec

const providers = [
  'coinswitch',
  'changelly',
];

// TODO: modify agama-wallet-lib to include explorer paths for pub addr and txid
//       coinswitch check for identical orders with no_deposit flag

class Exchanges extends React.Component {
  constructor() {
    super();
    this.state = {
      provider: providers[0],
      newExchangeOrder: false,
      processing: false,
      buyFixedDestCoin: false,
      syncHistoryProgressing: false,
      exchangeCacheUpdateProgress: false,
      newExchangeOrderDetails: {
        currentBalance: 'none',
        step: 0,
        orderStep: 0,
        depositStep: 0,
        orderId: null,
        amount: 0,
        coinSrc: null,
        coinDest: null,
        rate: null,
        minAmount: null,
        exchangeRate: null,
        fiatPrices: null,
        //exchangeOrder: {"orderId":"5a3c3bc4-7005-45c6-a106-4580aeb52f53","exchangeAddress":{"address":"QjibDEZiKV33xiNR7prhMAU4VanXGvZUN5","tag":null},"destinationAddress":{"address":"GNA1Hwa4vf3Y9LHZoMAYmGEngN2rmMTCU3","tag":null},"createdAt":1544871347246,"status":"timeout","inputTransactionHash":null,"outputTransactionHash":null,"depositCoin":"qtum","destinationCoin":"game","depositCoinAmount":null,"destinationCoinAmount":0,"validTill":1544914547246,"userReferenceId":null,"expectedDepositCoinAmount":9.60589756391216,"expectedDestinationCoinAmount":237},
        exchangeOrder: null,
        sendCoinState: null,
      },
    };
    this.depositsRuntimeCache = {
      coinswitch: {},
    };
    this.coinsSrcList = null;
    this.coinsDestList = null;
    this.defaultExchangeOrderState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    this.exchangesCacheInterval = null;
    this.coinswitchCoinsInterval = null;
    this._toggleExchangesOrderInfoModal = this._toggleExchangesOrderInfoModal.bind(this);
    this.toggleCreateOrder = this.toggleCreateOrder.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.clearOrder = this.clearOrder.bind(this);
    this.setSendAmountAll = this.setSendAmountAll.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.loadTestData = this.loadTestData.bind(this);
    this.prevStep = this.prevStep.bind(this);
    this.sendCoinCB = this.sendCoinCB.bind(this);
    this.makeDeposit = this.makeDeposit.bind(this);
    this.toggleBuyFixedDestCoin = this.toggleBuyFixedDestCoin.bind(this);
    this.syncHistory = this.syncHistory.bind(this);
    this._toggleExchangesTOSModal = this._toggleExchangesTOSModal.bind(this);
    this._toggleExchangesSupportedCoinsModal = this._toggleExchangesSupportedCoinsModal.bind(this);
    this.updateCache = this.updateCache.bind(this);
  }

  updateCache() {
    Store.dispatch(getExchangesCache(this.state.provider));

    this.setState({
      exchangeCacheUpdateProgress: true,
    });

    setTimeout(() => {
      this.setState({
        exchangeCacheUpdateProgress: false,
      });
    }, 1000);
  }

  _toggleExchangesTOSModal() {
    Store.dispatch(toggleExchangesTOSModal(true));
  }

  _toggleExchangesSupportedCoinsModal() {
    Store.dispatch(toggleExchangesSupportedCoinsModal(true));
  }

  syncHistory() {
    this.setState({
      syncHistoryProgressing: true,
    });

    exchangesHistorySync(this.state.provider)
    .then((res) => {
      if (res) {
        this.setState({
          syncHistoryProgressing: false,
        });
        Store.dispatch(getExchangesCache(this.state.provider));
        Store.dispatch(
          triggerToaster(
            translate('EXCHANGES.COINSWITCH_ORDERS_HISTORY_SYNCED'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
      } else {
        this.setState({
          syncHistoryProgressing: false,
        });
        Store.dispatch(
          triggerToaster(
            translate('EXCHANGES.COINSWITCH_FAILED_TO_SYNC_HISTORY'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
      }
    });
  }

  toggleBuyFixedDestCoin() {
    let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    _newState.amount = '';

    this.setState({
      buyFixedDestCoin: !this.state.buyFixedDestCoin,
      newExchangeOrderDetails: _newState,
    });
  }

  makeDeposit(orderId) {
    const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.state.provider];
    
    devlog(_cache[orderId]);
    
    let _newState = {};
    _newState.orderStep = 0;
    _newState.step = 1;
    _newState.exchangeOrder = _cache[orderId];

    devlog(_newState);

    Store.dispatch(dashboardChangeActiveCoin(_cache[orderId].depositCoin.toUpperCase(), 'spv'));
    Store.dispatch(apiElectrumBalance(_cache[orderId].depositCoin.toUpperCase(), this.props.Dashboard.electrumCoins[_cache[orderId].depositCoin.toUpperCase()].pub));

    this.setState({
      newExchangeOrder: true,
      newExchangeOrderDetails: _newState,
    });
    Store.dispatch(getExchangesCache(this.state.provider));
  }

  findDeposits(orderId) {
    const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.state.provider];
    let _items = [];

    if (_cache &&
        _cache.deposits) {
      for (let key in _cache.deposits) {
        if (_cache.deposits[key] === orderId) {
          _items.push(_cache.deposits[key]);
        }
      }
    }

    return _items;
  }

  testDepositResponse() {
    Store.dispatch(sendToAddressState({ txid: 'test' }));
  }

  componentWillReceiveProps(nextProps) {
    // TODO: use runtime deposits flat array
    if (nextProps &&
        nextProps.ActiveCoin.lastSendToResponse &&
        nextProps.ActiveCoin.lastSendToResponse.txid &&
        this.state.newExchangeOrderDetails &&
        this.state.newExchangeOrderDetails.exchangeOrder &&
        !this.depositsRuntimeCache.coinswitch[this.state.newExchangeOrderDetails.exchangeOrder.orderId]) {
      devlog('exchanges update deposit');

      this.depositsRuntimeCache.coinswitch[this.state.newExchangeOrderDetails.exchangeOrder.orderId] = nextProps.ActiveCoin.lastSendToResponse.txid;
      
      Store.dispatch(
        updateExchangesCacheDeposit(
          this.state.provider,
          this.state.newExchangeOrderDetails.exchangeOrder.depositCoin.toLowerCase(),
          nextProps.ActiveCoin.lastSendToResponse.txid,
          this.state.newExchangeOrderDetails.exchangeOrder.orderId
        )
      );
    }
  }

  sendCoinCB(state) {
    devlog('sendCoinCB', state);

    let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    _newState.sendCoinState = state;

    this.setState({
      processing: false,
      newExchangeOrderDetails: _newState,
    });
  }

  openExplorerWindow(item, type, coin) {
    let url;

    if (erc20ContractId[coin]) {
      url = `${explorerList.ETH}${item}`;
    } else {
      url = explorerList[coin].split('/').length - 1 > 2 ? `${explorerList[coin]}${item}` : `${explorerList[coin]}/tx/${item}`;      
      
      if (type === 'pub') {
        url = url.replace('/tx/', '/address/');
      }
    }

    return shell.openExternal(url);
  }

  prevStep() {
    let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    _newState.orderStep--;

    if (!this.state.buyFixedDestCoin) {
      _newState.amount = Number(Number(_newState.amount * this.state.newExchangeOrderDetails.exchangeRate.rate).toFixed(8)); 
    }

    this.setState({
      processing: false,
      newExchangeOrderDetails: _newState,
    });
  }

  loadTestData() {
    let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    _newState.coinSrc = 'KMD|spv';
    _newState.coinDest = 'GAME|spv';
    _newState.amount = 30;

    this.setState({
      newExchangeOrderDetails: _newState,
    });
  }

  nextStep() {
    // TODO: move to backend, account for tx fee, amount validation
    devlog('state', this.state);

    if (this.state.newExchangeOrderDetails.orderStep === 0) {
      const srcCoinSym = this.state.newExchangeOrderDetails.coinSrc.split('|')[0].toLowerCase();
      const destCoinSym = this.state.newExchangeOrderDetails.coinDest.split('|')[0].toLowerCase();

      this.setState({
        processing: true,
      });

      exchangesGetRate(
        this.state.provider,
        srcCoinSym,
        destCoinSym
      )
      .then((exchangeRate) => {
        devlog('rate', exchangeRate);

        if (this.state.provider === 'coinswitch') {
          if (exchangeRate.data) {
            let valid = true;
            let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
            _newState.exchangeRate = exchangeRate.data;

            if (!this.state.buyFixedDestCoin) {
              _newState.amount = Number(_newState.amount / exchangeRate.data.rate).toFixed(8);

              if (Number(_newState.amount) > Number(this.state.newExchangeOrderDetails.currentBalance)) {
                const _maxBuy = Number(Number((this.state.newExchangeOrderDetails.currentBalance - fromSats(staticVar.spvFees[srcCoinSym])) * exchangeRate.data.rate).toFixed(8));

                Store.dispatch(
                  triggerToaster(
                    `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('EXCHANGES.YOU_CAN_BUY_UP_TO')} ${_maxBuy} ${destCoinSym.toUpperCase()} ${translate('EXCHANGES.MAX_SM')}.`,
                    translate('TOASTR.WALLET_NOTIFICATION'),
                    'error'
                  )
                );
                valid = false;
                this.setState({
                  processing: false,
                });
              }
            }

            if (valid) {
              pricesPromise(
                [srcCoinSym, destCoinSym],
                Config.defaultFiatCurrency
              )
              .then((prices) => {
                _newState.prices = prices;
                _newState.orderStep = 1;

                this.setState({
                  processing: false,
                  newExchangeOrderDetails: _newState,
                });

                devlog('prices', prices);
              });
            }
          } else {
            this.setState({
              processing: false,
            });
            Store.dispatch(
              triggerToaster(
                translate('EXCHANGES.THIS_PAIR_IS_NOT_AVAILABLE'),
                translate('TOASTR.ERROR'),
                'error'
              )
            );
          }
        }
      });
    } else if (this.state.newExchangeOrderDetails.orderStep === 1) {
      const srcCoinSym = this.state.newExchangeOrderDetails.coinSrc.split('|')[0].toLowerCase();
      const destCoinSym = this.state.newExchangeOrderDetails.coinDest.split('|')[0].toLowerCase();

      this.setState({
        processing: true,
      });

      //provider, src, dest, srcAmount, destAmount, destPub, refundPub
      exchangesPlaceOrder(
        this.state.provider,
        srcCoinSym,
        destCoinSym,
        this.state.newExchangeOrderDetails.amount,
        0,
        this.props.Dashboard.electrumCoins[destCoinSym.toUpperCase()].pub,
        this.props.Dashboard.electrumCoins[srcCoinSym.toUpperCase()].pub,
      )
      .then((order) => {
        devlog('order place', order);

        if (order.data) {
          Store.dispatch(dashboardChangeActiveCoin(srcCoinSym.toUpperCase(), 'spv'));
          Store.dispatch(apiElectrumBalance(srcCoinSym.toUpperCase(), this.props.Dashboard.electrumCoins[srcCoinSym.toUpperCase()].pub));

          setTimeout(() => {
            let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
            _newState.orderStep = 2;
            _newState.exchangeOrder = order.data;

            this.setState({
              processing: false,
              newExchangeOrderDetails: _newState,
            });
          }, 100);
        } else {
          this.setState({
            processing: false,
          });
          Store.dispatch(
            triggerToaster(
              translate('EXCHANGES.SOMETHING_WENT_WRONG'),
              translate('TOASTR.ERROR'),
              'error'
            )
          );
        }
      });
    } else if (this.state.newExchangeOrderDetails.orderStep === 2) {
      let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
      _newState.orderStep = 0;
      _newState.step = 1;

      this.setState({
        newExchangeOrderDetails: _newState,
      });
      Store.dispatch(getExchangesCache(this.state.provider));
    }
  }

  setSendAmountAll() {
    const srcCoinSym = this.state.newExchangeOrderDetails.coinSrc.split('|')[0].toUpperCase();
    let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    _newState.amount = this.state.newExchangeOrderDetails.currentBalance - fromSats(staticVar.spvFees[srcCoinSym]);

    this.setState({
      newExchangeOrderDetails: _newState,
    });
  }

  clearOrder() {
    const _coinsList = JSON.parse(JSON.stringify(this.props.Main.coins));
    this.coinsSrcList = _coinsList;
    this.coinsDestList = _coinsList;

    this.setState({
      buyFixedDestCoin: false,
      newExchangeOrderDetails: this.defaultExchangeOrderState,
    });
  }

  updateSelectedCoin(e, type) {
    if (e &&
        e.value) {
      const _coin = e.value.split('|');
      let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
      _newState[type === 'src' ? 'coinSrc' : 'coinDest'] = e.value;

      if (type === 'src') {
        _newState.amount = '';
        _newState.currentBalance = '...';

        if (_coin[1] === 'spv') {
          apiElectrumBalancePromise(
            _coin[0],
            this.props.Dashboard.electrumCoins[_coin[0]].pub
          )
          .then((res) => {
            let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
            _newState.currentBalance = res.msg === 'success' ? res.result.balance : 'none';

            this.setState({
              newExchangeOrderDetails: _newState,
            });
          });
        } else if (_coin[1] === 'eth') {
          apiEthereumBalancePromise(
            _coin[0],
            this.props.Dashboard.ethereumCoins[_coin[0]].pub
          )
          .then((res) => {
            let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
            _newState.currentBalance = res.msg === 'success' ? res.result.balance : 'none';

            this.setState({
              newExchangeOrderDetails: _newState,
            });
          });
        }
      }
  
      this.setState({
        newExchangeOrderDetails: _newState,
      });

      let _coins = JSON.parse(JSON.stringify(this.props.Main.coins));
      _coins[_coin[1]].splice(_coins[_coin[1]].indexOf(_coin[0].toUpperCase()), 1);
      
      if (type === 'src') {
        this.coinsDestList = _coins;
      } else {
        this.coinsSrcList = _coins;
      }
    }
  }

  updateInput(e) {
    let _newState = JSON.parse(JSON.stringify(this.state.newExchangeOrderDetails));
    _newState[e.target.name.split('-')[1]] = e.target.value;

    this.setState({
      newExchangeOrderDetails: _newState,
    });
  }

  toggleCreateOrder() {
    let _coinsList = JSON.parse(JSON.stringify(this.props.Main.coins));

    if (this.state.provider === 'coinswitch') {
      const coinswitchCoins = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges.coinswitchCoins;

      if (coinswitchCoins &&
          typeof coinswitchCoins === 'object' &&
          coinswitchCoins.length &&
          coinswitchCoins[0].symbol) {
        let coinswitchCoinsFlat = [];

        for (let i = 0; i < coinswitchCoins.length; i++) {
          coinswitchCoinsFlat.push(coinswitchCoins[i].symbol.toUpperCase());
        }

        for (let i = 0; i < _coinsList.spv.length; i++) {
          if (coinswitchCoinsFlat.indexOf(_coinsList.spv[i]) === -1) {
            _coinsList.spv.splice(i, 1);
          }
        }
      }
    }

    this.coinsSrcList = _coinsList;
    this.coinsDestList = _coinsList;

    this.setState({
      newExchangeOrderDetails: this.defaultExchangeOrderState,
      newExchangeOrder: !this.state.newExchangeOrder,
    });
  }

  _toggleExchangesOrderInfoModal(orderId) {
    Store.dispatch(toggleExchangesOrderInfoModal(orderId));
  }

  toggleExchangeProvider(provider) {
    this.setState({
      provider,
    });
    Store.dispatch(getExchangesCache(provider));
  }

  componentWillMount() {
    Store.dispatch(getExchangesCache(this.state.provider));
    Store.dispatch(getExchangesCoinswitchCoins());

    this.exchangesCacheInterval = setInterval(() => {
      Store.dispatch(getExchangesCache(this.state.provider));
    }, EXCHANGES_CACHE_UPDATE_INTERVAL * 1000);

    this.coinswitchCoinsInterval = setInterval(() => {
      Store.dispatch(getExchangesCoinswitchCoins());
    }, EXCHANGES_COINSWITCH_COINS_UPDATE_INTERVAL * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.exchangesCacheInterval);
    clearInterval(this.coinswitchCoinsInterval);
  }

  renderCoinOption(option) {
    return (
      <div>
        <img
          src={ `assets/images/cryptologo/${option.icon.toLowerCase()}.png` }
          alt={ option.label }
          width="30px"
          height="30px" />
          <span className="margin-left-10">{ option.label }</span>
      </div>
    );
  }

  render() {
    return ExchangesRender.call(this);
  }

  _RenderExchangeHistory() {
    return RenderExchangeHistory.call(this);
  }

  _RenderNewOrderForm() {
    return RenderNewOrderForm.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: state.ActiveCoin,
    Main: state.Main,
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(Exchanges);