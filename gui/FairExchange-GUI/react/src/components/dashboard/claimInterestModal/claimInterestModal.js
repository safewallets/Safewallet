import React from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import Store from '../../../store';
import {
  toggleClaimInterestModal,
  getListUnspent,
  getRawTransaction,
  copyString,
  sendToAddressPromise,
  triggerToaster,
  apiElectrumListunspent,
  apiElectrumSendPreflight,
  apiElectrumSendPromise,
  validateAddressPromise,
  apiGetRemoteTimestamp,
} from '../../../actions/actionCreators';
import translate from '../../../translate/translate';
import {
  ClaimInterestModalRender,
  _ClaimInterestTableRender,
} from './claimInterestModal.render';
import {
  secondsToString,
  checkTimestamp,
} from 'agama-wallet-lib/src/time';

const SPV_MAX_LOCAL_TIMESTAMP_DEVIATION = 300; // 5 min

// TODO: promises

class ClaimInterestModal extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      isLoading: true,
      transactionsList: [],
      displayShowZeroInterestToggle: false,
      showZeroInterest: true,
      totalInterest: 0,
      spvPreflightSendInProgress: false,
      spvVerificationWarning: false,
      addressses: {},
      addressSelectorOpen: false,
      selectedAddress: null,
      loading: false,
      className: 'hide',
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.claimInterestTableRender = this.claimInterestTableRender.bind(this);
    this.toggleZeroInterest = this.toggleZeroInterest.bind(this);
    this.loadListUnspent = this.loadListUnspent.bind(this);
    this.checkTransactionsListLength = this.checkTransactionsListLength.bind(this);
    this.cancelClaimInterest = this.cancelClaimInterest.bind(this);
    this.openDropMenu = this.openDropMenu.bind(this);
    this.closeDropMenu = this.closeDropMenu.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.isFullySynced = this.isFullySynced.bind(this);
    this.confirmClaimInterest = this.confirmClaimInterest.bind(this);
  }

  componentWillMount() {
    const _mode = this.props.ActiveCoin.mode;

    if (_mode === 'native') {
      this.loadListUnspent();
    }

    if (_mode === 'spv') {
      apiGetRemoteTimestamp()
      .then((res) => {
        if (res.msg === 'success') {
          if (Math.abs(checkTimestamp(res.result)) > SPV_MAX_LOCAL_TIMESTAMP_DEVIATION) {
            Store.dispatch(
              triggerToaster(
                translate('SEND.CLOCK_OUT_OF_SYNC'),
                translate('TOASTR.WALLET_NOTIFICATION'),
                'warning',
                false
              )
            );
          }
        }
      });
    }
  }

  isFullySynced() {
    const _progress = this.props.ActiveCoin.progress;

    if (_progress &&
        _progress.longestchain &&
        _progress.blocks &&
        _progress.longestchain > 0 &&
        _progress.blocks > 0 &&
        Number(_progress.blocks) * 100 / Number(_progress.longestchain) === 100) {
      return true;
    }
  }

  openDropMenu() {
    this.setState(Object.assign({}, this.state, {
      addressSelectorOpen: !this.state.addressSelectorOpen,
    }));
  }

  closeDropMenu() {
    if (this.state.addressSelectorOpen) {
      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          addressSelectorOpen: false,
        }));
      }, 100);
    }
  }

  updateAddressSelection(address) {
    this.setState(Object.assign({}, this.state, {
      selectedAddress: address,
      addressSelectorOpen: !this.state.addressSelectorOpen,
    }));
  }

  loadListUnspent() {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;
    let _transactionsList = [];
    let _totalInterest = 0;
    let _zeroInterestUtxo = false;

    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 1000);

    if (_mode === 'spv') {
      apiElectrumListunspent(
        _coin,
        this.props.Dashboard.electrumCoins[_coin].pub
      )
      .then((json) => {
        if (json !== 'error' &&
            json.result &&
            typeof json.result !== 'string') {
          json = json.result;

          for (let i = 0; i < json.length; i++) {
            if (json[i].interest === 0) {
              _zeroInterestUtxo = true;
            }

            _transactionsList.push({
              address: json[i].address,
              locktime: json[i].locktime,
              amount: Number(json[i].amount.toFixed(8)),
              interest: Number(json[i].interest.toFixed(8)),
              timeElapsedFromLocktime: json[i].timeElapsedFromLocktime,
              timeElapsedFromLocktimeInSeconds: json[i].timeElapsedFromLocktimeInSeconds,
              timeTill1MonthInterestStopsInSeconds: json[i].timeTill1MonthInterestStopsInSeconds,
              interestRulesCheckPass: json[i].interestRulesCheckPass,
              txid: json[i].txid,
            });
            _totalInterest += Number(json[i].interest.toFixed(8));

            if (i === json.length - 1) {
              this.setState({
                transactionsList: _transactionsList,
                isLoading: false,
                totalInterest: _totalInterest,
                displayShowZeroInterestToggle: _zeroInterestUtxo,
              });
            }
          }
        } else {
          this.setState({
            transactionsList: [],
            isLoading: false,
            totalInterest: 0,
          });
        }
      });
    } else {
      getListUnspent(_coin)
      .then((json) => {
        if (json &&
            json.length) {
          let _addresses = {};

          for (let i = 0; i < json.length; i++) {
            getRawTransaction(_coin, json[i].txid)
            .then((_json) => {
              if (json[i].interest === 0) {
                _zeroInterestUtxo = true;
              }
              _addresses[json[i].address] = json[i].address;
              _transactionsList.push({
                address: json[i].address,
                locktime: _json.locktime,
                amount: json[i].amount,
                interest: json[i].interest,
                txid: json[i].txid,
              });
              _totalInterest += Number(json[i].interest);

              if (i === json.length - 1) {
                this.setState({
                  transactionsList: _transactionsList,
                  isLoading: false,
                  totalInterest: _totalInterest,
                  addressses: _addresses,
                  selectedAddress: this.state.selectedAddress ? this.state.selectedAddress : _addresses[Object.keys(_addresses)[0]],
                  displayShowZeroInterestToggle: _zeroInterestUtxo,
                });
              }
            });
          }
        }
      });
    }
  }

  cancelClaimInterest() {
    this.setState(Object.assign({}, this.state, {
      spvVerificationWarning: false,
      spvPreflightSendInProgress: false,
    }));
  }

  confirmClaimInterest() {
    if (this.props.ActiveCoin.mode === 'spv') {
      const _coin = this.props.ActiveCoin.coin;
      const _pub = this.props.Dashboard.electrumCoins[_coin].pub;
      const _balance = this.props.ActiveCoin.balance;

      apiElectrumSendPromise(
        _coin,
        _balance.balanceSats,
        _pub,
        _pub
      )
      .then((res) => {
        if (res.msg === 'error') {
          Store.dispatch(
            triggerToaster(
              res.result,
              translate('TOASTR.ERROR'),
              'error'
            )
          );
        } else {
          Store.dispatch(
            triggerToaster(
              `${translate('TOASTR.CLAIM_INTEREST_BALANCE_SENT_P1')} ${_pub}. ${translate('TOASTR.CLAIM_INTEREST_BALANCE_SENT_P2')}`,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'success',
              false
            )
          );
          this.closeModal();
        }
      });
    }
  }

  claimInterest(address, amount) {
    const _coin = this.props.ActiveCoin.coin;
    const _balance = this.props.ActiveCoin.balance;

    if (_coin === 'KMD') {
      if (this.props.ActiveCoin.mode === 'spv') {
        const _pub = this.props.Dashboard.electrumCoins[_coin].pub;
        
        this.setState(Object.assign({}, this.state, {
          spvVerificationWarning: false,
          spvPreflightSendInProgress: true,
        }));

        apiElectrumSendPreflight(
          _coin,
          _balance.balanceSats,
          _pub,
          _pub
        )
        .then((sendPreflight) => {
          if (sendPreflight &&
              sendPreflight.msg === 'success') {
            this.setState(Object.assign({}, this.state, {
              spvVerificationWarning: !sendPreflight.result.utxoVerified,
              spvPreflightSendInProgress: false,
            }));

            if (sendPreflight.result.utxoVerified) {
              this.confirmClaimInterest();
            }
          } else {
            Store.dispatch(
              triggerToaster(
                sendPreflight.result,
                translate('TOASTR.ERROR'),
                'error'
              )
            );
            this.setState(Object.assign({}, this.state, {
              spvPreflightSendInProgress: false,
            }));
          }
        });
      } else {
        validateAddressPromise(
          _coin,
          this.state.selectedAddress
        )
        .then((json) => {
          if (json.error &&
              json.error.code) {
            Store.dispatch(
              triggerToaster(
                json.error.message,
                translate('TOASTR.ERROR'),
                'error'
              )
            );
          } else if (
            json.result &&
            !json.result.iswatchonly &&
            json.result.ismine &&
            json.result.isvalid &&
            !json.result.isscript
          ) {
            sendToAddressPromise(
              _coin,
              this.state.selectedAddress,
              _balance.transparent
            )
            .then((json) => {
              if (json.error &&
                  json.error.code) {
                Store.dispatch(
                  triggerToaster(
                    json.error.message,
                    translate('TOASTR.ERROR'),
                    'error'
                  )
                );
              } else if (
                json.result &&
                json.result.length &&
                json.result.length === 64
              ) {
                Store.dispatch(
                  triggerToaster(
                    `${translate('TOASTR.CLAIM_INTEREST_BALANCE_SENT_P1')} ${this.state.selectedAddress}. ${translate('TOASTR.CLAIM_INTEREST_BALANCE_SENT_P2')}`,
                    translate('TOASTR.WALLET_NOTIFICATION'),
                    'success',
                    false
                  )
                );
                this.closeModal();
              }
            });
          } else {
            Store.dispatch(
              triggerToaster(
                `${translate('TOASTR.FAILED_TO_VERIFY_ADDR')} ${this.state.selectedAddress}`,
                translate('TOASTR.ERROR'),
                'error'
              )
            );
          }
        });
      }
    }
  }

  checkTransactionsListLength() {
    const _txlist = this.state.transactionsList;

    if (_txlist &&
        _txlist.length) {
      return true;
    } else if (
      !_txlist ||
      !_txlist.length
    ) {
      return false;
    }
  }

  toggleZeroInterest() {
    this.setState({
      showZeroInterest: !this.state.showZeroInterest,
    });
  }

  copyTxId(txid) {
    Store.dispatch(copyString(txid, translate('TOASTR.TXID_COPIED')));
  }

  claimInterestTableRender() {
    return _ClaimInterestTableRender.call(this);
  }

  addressDropdownRender() {
    let _items = [];

    for (let key in this.state.addressses) {
      _items.push(
        <li
          className="selected"
          key={ key }>
          <a onClick={ () => this.updateAddressSelection(key) }>
            <span className="text">{ key }</span>
            { this.state.selectedAddress === key &&
              <span className="glyphicon glyphicon-ok check-mark pull-right"></span>
            }
          </a>
        </li>
      );
    }

    return (
      <div className={ `btn-group bootstrap-select form-control form-material showkmdwalletaddrs show-tick ${(this.state.addressSelectorOpen ? 'open' : '')}` }>
        <button
          type="button"
          className={ 'btn dropdown-toggle btn-info' + (this.props.ActiveCoin.mode === 'spv' ? ' disabled' : '') }
          onClick={ this.openDropMenu }>
          <span className="filter-option pull-left">{ this.state.selectedAddress }</span>
          <span className="bs-caret inline">
            <span className="caret"></span>
          </span>
        </button>
        <div className="dropdown-menu open">
          <ul className="dropdown-menu inner">
            { _items }
          </ul>
        </div>
      </div>
    );
  }

  componentWillReceiveProps(props) {
    const _display = props.Dashboard.displayClaimInterestModal;

    if (_display !== this.state.open) {
      this.setState({
        className: _display ? 'show fade' : 'show out',
      });

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: _display,
          className: _display ? 'show in' : 'hide',
        }));

        if (!_display) {
          setTimeout(() => {
            this.setState(this.defaultState);
          }, 100);
        }
      }, _display ? 50 : 300);
    }

    if (!this.state.open &&
        props.Dashboard.displayClaimInterestModal) {
      this.loadListUnspent();

      if (this.props.ActiveCoin.mode === 'spv') {
        apiGetRemoteTimestamp()
        .then((res) => {
          if (res.msg === 'success') {
            if (Math.abs(checkTimestamp(res.result)) > SPV_MAX_LOCAL_TIMESTAMP_DEVIATION) {
              Store.dispatch(
                triggerToaster(
                  translate('SEND.CLOCK_OUT_OF_SYNC'),
                  translate('TOASTR.WALLET_NOTIFICATION'),
                  'warning',
                  false
                )
              );
            }
          }
        });
      }
    }
  }

  closeModal() {
    this.setState(this.defaultState);
    Store.dispatch(toggleClaimInterestModal(false));
  }

  render() {
    if (this.props.ActiveCoin &&
        this.props.ActiveCoin.coin &&
        this.props.ActiveCoin.coin === 'KMD') {
      return ClaimInterestModalRender.call(this);
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
      balance: state.ActiveCoin.balance,
      activeSection: state.ActiveCoin.activeSection,
      progress: state.ActiveCoin.progress,
    },
    Dashboard: {
      displayClaimInterestModal: state.Dashboard.displayClaimInterestModal,
      electrumCoins: state.Dashboard.electrumCoins,
    },
  };
};

export default connect(mapStateToProps)(ClaimInterestModal);