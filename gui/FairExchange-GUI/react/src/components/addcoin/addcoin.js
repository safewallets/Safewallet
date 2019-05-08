import React from 'react';
import { connect } from 'react-redux';
import translate from '../../translate/translate';
import Config from '../../config';
import {
  addCoin,
  addCoinEth,
  toggleAddcoinModal,
  triggerToaster,
  apiGetCoinList,
  apiPostCoinList,
  toggleZcparamsFetchModal,
} from '../../actions/actionCreators';
import Store from '../../store';
import zcashParamsCheckErrors from '../../util/zcashParams';
import mainWindow, { staticVar } from '../../util/mainWindow';
import { pubkeyToAddress } from 'agama-wallet-lib/src/keys';
import bitcoinjsNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';

import CoinSelectorsRender from './coin-selectors.render';
import AddCoinRender from './addcoin.render';

const SEED_TRIM_TIMEOUT = 5000;

class AddCoin extends React.Component {
  constructor() {
    super();
    this.state = {
      coins: [],
      defaultCoinState: {
        selectedCoin: null,
        spvMode: {
          disabled: true,
          checked: false,
        },
        nativeMode: {
          disabled: true,
          checked: false,
        },
        miningMode: {
          disabled: true,
          checked: false,
        },
        stakingMode: {
          disabled: true,
          checked: false,
        },
        mode: -2,
        daemonParam: null,
        genProcLimit: 1,
      },
      display: false,
      actionsMenu: false,
      className: 'hide',
      isExperimentalOn: false,
      // staking ac
      loginPassphrase: '',
      seedInputVisibility: false,
      seedExtraSpaces: false,
      trimPassphraseTimer: null,
      usePubkey: false,
    };
    this.existingCoins = null;
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.activateCoin = this.activateCoin.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.addNewItem = this.addNewItem.bind(this);
    this.activateAllCoins = this.activateAllCoins.bind(this);
    this.toggleActionsMenu = this.toggleActionsMenu.bind(this);
    this.saveCoinSelection = this.saveCoinSelection.bind(this);
    this.loadCoinSelection = this.loadCoinSelection.bind(this);
    this.verifyZcashParamsExist = this.verifyZcashParamsExist.bind(this);
    this.updateLoginPassPhraseInput = this.updateLoginPassPhraseInput.bind(this);
    this.toggleSeedInputVisibility = this.toggleSeedInputVisibility.bind(this);
    this.toggleUsePubkey = this.toggleUsePubkey.bind(this);
  }

  toggleUsePubkey() {
    this.setState({
      usePubkey: !this.state.usePubkey,
    });
  }

  toggleSeedInputVisibility() {
    this.setState({
      seedInputVisibility: !this.state.seedInputVisibility,
    });
  }

  updateLoginPassPhraseInput(e) {
    const newValue = e.target.value;

    clearTimeout(this.state.trimPassphraseTimer);

    const _trimPassphraseTimer = setTimeout(() => {
      if (newValue[0] === ' ' ||
          newValue[newValue.length - 1] === ' ') {
        this.setState({
          seedExtraSpaces: true,
        });
      } else {
        this.setState({
          seedExtraSpaces: false,
        });
      }
    }, SEED_TRIM_TIMEOUT);

    this.setState({
      trimPassphraseTimer: _trimPassphraseTimer,
      [e.target.name]: newValue,
    });
  }

  verifyZcashParamsExist(mode) {
    return new Promise((resolve, reject) => {
      if (Number(mode) === -1 ||
          Number(mode) === 1 ||
          Number(mode) === 2) {
        const _res = mainWindow.zcashParamsExist;
        const __errors = zcashParamsCheckErrors(_res);

        if (__errors) {
          mainWindow.zcashParamsExistPromise()
          .then((res) => {
            const _errors = zcashParamsCheckErrors(res);
            mainWindow.zcashParamsExist = res;

            if (_errors) {
              Store.dispatch(
                triggerToaster(
                  _errors,
                  'Komodod',
                  'error',
                  false
                )
              );
              Store.dispatch(toggleZcparamsFetchModal(true));
              Store.dispatch(toggleZcparamsFetchModal(true));
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      } else {
        resolve(true);
      }
    });
  }

  saveCoinSelection() {
    apiPostCoinList(this.state.coins)
    .then((json) => {
      this.toggleActionsMenu();
    });
  }

  loadCoinSelection() {
    apiGetCoinList()
    .then((json) => {
      if (json.msg !== 'error') {
        this.setState(Object.assign({}, this.state, {
          coins: json.result,
          actionsMenu: false,
        }));
      } else {
        Store.dispatch(
          triggerToaster(
            translate('TOASTR.SELECTION_NOT_FOUND'),
            translate('TOASTR.COIN_SELECTION'),
            'info'
          )
        );
      }
    });
  }

  updateDaemonParam(e, index) {
    let _coins = this.state.coins;

    _coins[index] = Object.assign({}, _coins[index], {
      [e.target.name]: e.target.value,
    });

    this.setState(Object.assign({}, this.state, {
      coins: _coins,
    }));
  }

  toggleActionsMenu() {
    this.setState(Object.assign({}, this.state, {
      actionsMenu: !this.state.actionsMenu,
    }));
  }

  componentWillMount() {
    this.addNewItem();

    this.setState({
      isExperimentalOn: mainWindow.appConfig.experimentalFeatures,
    });
  }

  componentWillReceiveProps(props) {
    const addCoinProps = props ? props.AddCoin : null;

    this.existingCoins = props && props.Main ? props.Main.coins : null;

    if (addCoinProps &&
        addCoinProps.display !== this.state.display) {
      this.setState(Object.assign({}, this.state, {
        className: addCoinProps.display ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          display: addCoinProps.display,
          className: addCoinProps.display ? 'show in' : 'hide',
        }));

        if (!addCoinProps.display) {
          setTimeout(() => {
            this.removeCoin();
            this.addNewItem();
          }, 100);
        }
      }, addCoinProps.display ? 50 : 300);
    }
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
        { option.value.indexOf('ETH|') > -1 &&
          option.value !== 'ETH|ropsten' &&
          <div className="badge badge--erc20">ERC20</div>
        }
      </div>
    );
  }

  updateSelectedCoin(e, index) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      const coin = e.value.split('|');
      const defaultMode = coin[1];
      const modeToValue = { // TODO: move to utils
        spv: 0,
        native: -1,
        staking: 1,
        mining: 2,
      };
      const _value = e.value;
      let _coins = this.state.coins;

      _coins[index] = {
        selectedCoin: _value,
        spvMode: {
          disabled: _value.indexOf('spv') > -1 ? false : true,
          checked: defaultMode === 'spv' ? true : false,
        },
        nativeMode: {
          disabled: _value.indexOf('native') > -1 ? false : true,
          checked: defaultMode === 'native' ? true : false,
        },
        stakingMode: {
          disabled: _value.indexOf('staking') > -1 ? false : true,
          checked: defaultMode === 'staking' ? true : false,
        },
        miningMode: {
          disabled: _value.indexOf('mining') > -1 ? false : true,
          checked: defaultMode === 'mining' ? true : false,
        },
        mode: modeToValue[defaultMode] !== undefined ? modeToValue[defaultMode] : -2,
        genProcLimit: 1,
      };

      this.setState(Object.assign({}, this.state, {
        coins: _coins,
      }));
    }
  }

  updateSelectedMode(_value, index) {
    let _coins = this.state.coins;
    const _selectedCoin = _coins[index].selectedCoin;

    _coins[index] = {
      selectedCoin: _selectedCoin,
      spvMode: {
        disabled: _selectedCoin.indexOf('spv') > -1 ? false : true,
        checked: _value === '0' ? true : false,
      },
      nativeMode: {
        disabled: _selectedCoin.indexOf('native') > -1 ? false : true,
        checked: _value === '-1' ? true : false,
      },
      stakingMode: {
        disabled: _selectedCoin.indexOf('staking') > -1 ? false : true,
        checked: _value === '1' ? true : false,
      },
      miningMode: {
        disabled: _selectedCoin.indexOf('mining') > -1 ? false : true,
        checked: _value === '2' ? true : false,
      },
      mode: _value,
    };

    this.setState(Object.assign({}, this.state, {
      coins: _coins,
    }));
  }

  updateGenproclimitParam(e, index) {
    let _coins = this.state.coins;

    _coins[index].genProcLimit = e.target.value;

    this.setState(Object.assign({}, this.state, {
      coins: _coins,
    }));
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.dismiss();
    }
  }

  activateCoin() {
    const _coin = this.state.coins[0];
    const coin = _coin.selectedCoin.split('|')[0];
    const coinuc = coin.toUpperCase();

    if (_coin.selectedCoin.indexOf('ETH') > -1) {
      const _ethNet = _coin.selectedCoin.split('|');

      Store.dispatch(addCoinEth(
        _ethNet[0],
        _ethNet[1],
      ));

      this.removeCoin();
      this.addNewItem();

      Store.dispatch(toggleAddcoinModal(false, false));

      setTimeout(() => {
        this.setState({
          loginPassphrase: '',
          seedInputVisibility: false,
          seedExtraSpaces: false,
          trimPassphraseTimer: null,
        });
      }, 100);
    } else {
      this.verifyZcashParamsExist(_coin.mode)
      .then((res) => {
        if (res) {
          if (!_coin.daemonParam) {
            if (this.state.usePubkey &&
                pubkeyToAddress(Config.pubkey, bitcoinjsNetworks.kmd)) {
              Store.dispatch(addCoin(
                coin,
                _coin.mode,
                null,
                null,
                Config.pubkey,
              ));
            } else {
              Store.dispatch(addCoin(
                coin,
                _coin.mode,
              ));
            }
          } else {
            Store.dispatch(addCoin(
              coin,
              _coin.mode,
              { type: _coin.daemonParam },
              _coin.daemonParam === 'gen' &&
              staticVar.chainParams[coinuc] &&
              staticVar.chainParams[coinuc].genproclimit ? Number(_coin.genProcLimit || 1) : 0,
              this.state.usePubkey && pubkeyToAddress(Config.pubkey, bitcoinjsNetworks.kmd) ? Config.pubkey : null,
            ));
          }

          this.removeCoin();
          this.addNewItem();

          Store.dispatch(toggleAddcoinModal(false, false));

          setTimeout(() => {
            this.setState({
              loginPassphrase: '',
              seedInputVisibility: false,
              seedExtraSpaces: false,
              trimPassphraseTimer: null,
            });
          }, 100);
        }
      });
    }
  }

  dismiss() {
    this.setState(this.defaultState);
    Store.dispatch(toggleAddcoinModal(false, false));
  }

  addNewItem() {
    let _coins = this.state.coins;
    _coins.push(this.state.defaultCoinState);

    this.setState(Object.assign({}, this.state, {
      coins: _coins,
    }));
  }

  removeCoin(index) {
    let _coins = this.state.coins;
    _coins.splice(index, 1);

    this.setState(Object.assign({}, this.state, {
      coins: _coins,
    }));
  }

  hasMoreThanOneCoin() {
    return this.state.coins.length > 1;
  }

  activateAllCoins() {
    let _coin = this.state.coins[0];
    let coin = this.state.coins[0].selectedCoin.split('|')[0];
    let coinuc = coin.toUpperCase();

    if (_coin.selectedCoin.indexOf('ETH') > -1) {
      const _ethNet = _coin.selectedCoin.split('|');

      Store.dispatch(addCoinEth(
        _ethNet[0],
        _ethNet[1],
      ));
    } else {
      if (!_coin.daemonParam) {
        Store.dispatch(addCoin(
          coin,
          _coin.mode,
        ));
      } else {
        Store.dispatch(addCoin(
          coin,
          _coin.mode,
          { type: _coin.daemonParam },
          _coin.daemonParam === 'gen' &&
          staticVar.chainParams[coinuc] &&
          staticVar.chainParams[coinuc].genproclimit ? Number(_coin.genProcLimit || 1) : 0,
        ));
      }
    }

    for (let i = 1; i < this.state.coins.length; i++) {
      let _coin = this.state.coins[i];
      let coin = _coin.selectedCoin.split('|')[0];
      let coinuc = coin.toUpperCase();

      setTimeout(() => {
        if (!_coin.daemonParam) {
          if (_coin.selectedCoin.indexOf('ETH') > -1) {
            const _ethNet = _coin.selectedCoin.split('|');

            Store.dispatch(addCoinEth(
              _ethNet[0],
              _ethNet[1],
            ));
          } else {
            Store.dispatch(addCoin(
              coin,
              _coin.mode,
            ));
          }
        } else {
          Store.dispatch(addCoin(
            coin,
            _coin.mode,
            { type: _coin.daemonParam },
            _coin.daemonParam === 'gen' &&
            staticVar.chainParams[coinuc] &&
            staticVar.chainParams[coinuc].genproclimit ? Number(_coin.genProcLimit || 1) : 0,
          ));
        }

        if (i === this.state.coins.length - 1) {
          let _coins = [];
          _coins.push(this.state.defaultCoinState);

          this.setState(Object.assign({}, this.state, {
            coins: _coins,
          }));

          Store.dispatch(toggleAddcoinModal(false, false));

          setTimeout(() => {
            this.setState({
              loginPassphrase: '',
              seedInputVisibility: false,
              seedExtraSpaces: false,
              trimPassphraseTimer: null,
            });
          }, 100);
        }
      }, 2000 * i);
    }
  }

  renderCoinSelectors() {
    const _coins = this.state.coins;
    let items = [];

    for (let i = 0; i < _coins.length; i++) {
      const _item = _coins[i];
      const _coin = _item.selectedCoin || '';

      items.push(
        CoinSelectorsRender.call(
          this,
          _item,
          _coin,
          i
        )
      );
    }

    return items;
  }

  renderGenproclimitOptions() {
    const _max = 32;
    let _items = [];

    for (let i = 0; i < _max; i++) {
      _items.push(
        <option
          key={ `addcoin-genproclimit-${i}` }
          value={ i + 1 }>
          { translate('ADD_COIN.MINING_THREADS') }: { i + 1 }
        </option>
      );
    }

    return _items;
  }

  render() {
    return (
      AddCoinRender.call(this)
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
    AddCoin: state.AddCoin,
  };
};

export default connect(mapStateToProps)(AddCoin);