import React from 'react';
import { connect } from 'react-redux';
import Config from '../../../config';
import translate from '../../../translate/translate';
import {
  triggerToaster,
  sendNativeTx,
  getKMDOPID,
  clearLastSendToResponseState,
  apiElectrumSend,
  apiElectrumSendPreflight,
  apiGetRemoteBTCFees,
  apiGetLocalBTCFees,
  apiGetRemoteTimestamp,
  copyString,
  loginWithPin,
  addCoin,
  validateAddress,
  clearOPIDs,
  apiEthereumGasPrice,
  apiEthereumSend,
  apiEthereumSendERC20Preflight,
  shieldCoinbase,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  AddressListRender,
  SendRender,
  SendFormRender,
  _SendFormRender,
  ZmergeToAddressRender,
  AddressListRenderShieldCoinbase,
} from './sendCoin.render';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import Slider, { Range } from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import {
  secondsToString,
  checkTimestamp,
} from 'agama-wallet-lib/src/time';
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
import { addressVersionCheck } from 'agama-wallet-lib/src/keys';
import networks from 'agama-wallet-lib/src/bitcoinjs-networks';
import kv from 'agama-wallet-lib/src/kv';

const { shell } = window.require('electron');
const SPV_MAX_LOCAL_TIMESTAMP_DEVIATION = 300; // 5 min
const FEE_EXCEEDS_DEFAULT_THRESHOLD = 5; // N fold increase
const DEFAULT_ZTX_FEE = 0.0001;

// TODO: - render z address trim

const _feeLookup = {
  btc: [
    'fastestFee',
    'halfHourFee',
    'hourFee',
    'advanced',
  ],
  eth: [
    'fast',
    'average',
    'slow',
  ],
};

class SendCoin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      addressType: null,
      sendFrom: null,
      sendFromAmount: 0,
      sendTo: '',
      amount: 0,
      fee: 0,
      addressSelectorOpen: false,
      renderAddressDropdown: true,
      subtractFee: false,
      lastSendToResponse: null,
      coin: null,
      spvVerificationWarning: false,
      spvPreflightSendInProgress: false,
      spvDpowVerificationWarning: 'n/a',
      btcFees: {},
      btcFeesType: 'halfHourFee',
      btcFeesAdvancedStep: 9,
      btcFeesSize: 0,
      btcFeesTimeBasedStep: 1,
      spvPreflightRes: null,
      pin: '',
      noUtxo: false,
      addressBookSelectorOpen: false,
      // kv
      kvSend: false,
      kvSendTag: '',
      kvSendTitle: '',
      kvSendContent: '',
      kvHex: '',
      // z_mergetoaddress
      enableZmergetoaddress: false,
      zmtaSrc: '*',
      zmtaDest: '',
      zmtaAdvanced: false,
      zmtaFee: 0.0001,
      zmtaTlimit: 50,
      zmtaZlimit: 10,
      // eth
      ethFees: {},
      ethFeeType: 1,
      ethPreflightSendInProgress: false,
      ethPreflightRes: null,
      // z_shieldcoinbase
      zshieldcoinbaseToggled: false,
      // ztx fee
      ztxSelectorOpen: false,
      ztxFee: DEFAULT_ZTX_FEE,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.updateInput = this.updateInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.openDropMenu = this.openDropMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.checkZAddressCount = this.checkZAddressCount.bind(this);
    this.setRecieverFromScan = this.setRecieverFromScan.bind(this);
    this.renderOPIDListCheck = this.renderOPIDListCheck.bind(this);
    this.SendFormRender = _SendFormRender.bind(this);
    this.isTransparentTx = this.isTransparentTx.bind(this);
    this.toggleSubtractFee = this.toggleSubtractFee.bind(this);
    this.isFullySynced = this.isFullySynced.bind(this);
    this.setSendAmountAll = this.setSendAmountAll.bind(this);
    this.setSendToSelf = this.setSendToSelf.bind(this);
    this.fetchBTCFees = this.fetchBTCFees.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.onSliderChangeTime = this.onSliderChangeTime.bind(this);
    this.onSliderChangeTimeEth = this.onSliderChangeTimeEth.bind(this);
    this.toggleKvSend = this.toggleKvSend.bind(this);
    this.toggleAddressBookDropdown = this.toggleAddressBookDropdown.bind(this);
    this.verifyPin = this.verifyPin.bind(this);
    this.setDefaultFee = this.setDefaultFee.bind(this);
    this.setToAddress = this.setToAddress.bind(this);
    this.clearOPIDsManual = this.clearOPIDsManual.bind(this);
    this._checkCurrentTimestamp = this._checkCurrentTimestamp.bind(this);
    this.toggleZmergetoaddress = this.toggleZmergetoaddress.bind(this);
    this.toggleZmtaAdvanced = this.toggleZmtaAdvanced.bind(this);
    this.fetchETHFees = this.fetchETHFees.bind(this);
    this._shieldCoinbase = this._shieldCoinbase.bind(this);
    this.zshieldcoinbaseToggle = this.zshieldcoinbaseToggle.bind(this);
    this.toggleZtxDropdown = this.toggleZtxDropdown.bind(this);
    this.setZtxFee = this.setZtxFee.bind(this);
    //this.loadTestData = this.loadTestData.bind(this);
  }

  setZtxFee(val) {
    let _amount = '';
    
    if (isPositiveNumber(this.state.amount) &&
        isPositiveNumber(this.state.sendFromAmount)) {
      if (this.state.amount + val > this.state.sendFromAmount) {
        _amount = Number(Number(this.state.amount - val).toFixed(8)); 
      } else {
        _amount = this.state.amount;
      }
    }

    this.setState({
      ztxFee: val,
      ztxSelectorOpen: false,
      amount: _amount,
    });
  }

  toggleZtxDropdown() {
    this.setState({
      ztxSelectorOpen: !this.state.ztxSelectorOpen,
    });
  }

  zshieldcoinbaseToggle() {
    this.setState({
      zshieldcoinbaseToggled: !this.state.zshieldcoinbaseToggled,
      sendFrom: null,
    });
  }

  _shieldCoinbase() {
    shieldCoinbase(
      this.props.ActiveCoin.coin,
      '*',
      this.state.sendFrom
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
      } else {
        Store.dispatch(
          triggerToaster(
            [
              translate('SEND.COINBASE_SHIELD_SUCCESS'),
              `${TX_OPID}: ${json.result}`,
            ],
            translate('TOASTR.ERROR'),
            'success',
            false
          )
        );
      }
    });
  }

  toggleZmergetoaddress() {
    this.setState({
      enableZmergetoaddress: !this.state.enableZmergetoaddress,
    });
  }

  toggleZmtaAdvanced() {
    this.setState({
      zmtaAdvanced: !this.state.zmtaAdvanced,
    });
  }

  _checkCurrentTimestamp() {
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

  clearOPIDsManual() {
    Store.dispatch(clearOPIDs(this.props.ActiveCoin.coin));
  }

  setToAddress(pub) {
    this.setState({
      sendTo: pub,
      addressBookSelectorOpen: false,
      renderAddressDropdown: this.props.ActiveCoin.mode === 'native' && (pub.substring(0, 2) === 'zc' || pub.substring(0, 2) === 'zs') && (pub.length === 95 || pub.length === 78) ? true : this.state.renderAddressDropdown,      
    });
  }

  verifyPin() {
    loginWithPin(this.state.pin, mainWindow.pinAccess)
    .then((res) => {
      if (res.msg === 'success') {
        this.refs.pin.value = '';

        this.setState({
          pin: '',
        });

        this.changeSendCoinStep(2);
      }
    });
  }

  /*loadTestData() {
    this.setState({
      kvSendTag: 'test',
      kvSendTitle: 'This is a test kv',
      kvSendContent: 'test test test test',
    });
  }*/

  toggleKvSend() {
    this.setState({
      kvSend: !this.state.kvSend,
      amount: this.state.kvSend ? '' : 0.0001,
      sendTo: this.state.kvSend ? '' : this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub,
    });
  }

  toggleAddressBookDropdown() {
    this.setState({
      addressBookSelectorOpen: !this.state.addressBookSelectorOpen,
    });
  }

  setDefaultFee() {
    this.setState({
      fee: fromSats(staticVar.spvFees[this.props.ActiveCoin.coin]),
    });
  }

  setSendAmountAll() {
    const _amount = this.state.amount;
    const _amountSats = toSats(this.state.amount);
    const _balance = this.props.ActiveCoin.balance;
    const _mode = this.props.ActiveCoin.mode;
    let _fees = staticVar.spvFees; // TODO: use lib
    _fees.BTC = 0;

    if (_mode === 'native') {
      const isZtx = this.state.addressType === 'private' || (this.state.sendTo && (this.state.sendTo.substring(0, 2) === 'zc' || this.state.sendTo.substring(0, 2) === 'zs')) || (this.state.sendFrom && (this.state.sendFrom.substring(0, 2) === 'zc' || this.state.sendFrom.substring(0, 2) === 'zs'));
      
      if (this.state.sendFrom &&
          Number(this.state.sendFromAmount) > 0) {
        this.setState({
          amount: Number(Number(Number(this.state.sendFromAmount) - (isZtx ? this.state.ztxFee : 0.0001)).toFixed(8)),
        });
      } else {
        if (Number(_balance.transparent) > 0) {
          this.setState({
            amount: Number(Number(Number(_balance.transparent) - 0.0001).toFixed(8)),
          });
        }
      }
    } else if (_mode === 'spv') {
      const _amount = Number(fromSats((_balance.balanceSats + _balance.unconfirmedSats - (toSats(this.state.fee) || _fees[this.props.ActiveCoin.coin.toLowerCase()] || 0))).toFixed(8));

      this.setState({
        amount: Number(_amount) > 0 ? _amount : this.state.amount,
      });
    } else if (_mode === 'eth') {
      if (erc20ContractId[this.props.ActiveCoin.coin]) {
        this.setState({
          amount: Number(_balance.balance),
        });
      } else {
        this.setState({
          amount: Number((Number(_balance.balance) - formatEther(Number(this.state.ethFees[_feeLookup.eth[this.state.ethFeeType]] * coinFees[this.props.ActiveCoin.coin.toLowerCase()]))).toFixed(8)),
        });
      }
    }
  }

  setSendToSelf() {
    if (this.props.ActiveCoin.mode === 'spv') {
      this.setState({
        sendTo: this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub,
      });
    } else if (this.props.ActiveCoin.mode === 'eth') {
      this.setState({
        sendTo: this.props.Dashboard.ethereumCoins[this.props.ActiveCoin.coin].pub,
      });
    }
  }

  copyTXID(txid) {
    Store.dispatch(copyString(txid, translate('SEND.TXID_COPIED')));
  }

  openExplorerWindow(txid) {
    const _coin = this.props.ActiveCoin.coin;
    let url;

    if (erc20ContractId[this.props.ActiveCoin.coin]) {
      url = `${explorerList.ETH}${txid}`;
    } else {
      url = explorerList[_coin].split('/').length - 1 > 2 ? `${explorerList[_coin]}${txid}` : `${explorerList[_coin]}/tx/${txid}`;      
    }
    return shell.openExternal(url);
  }

  SendFormRender() {
    return _SendFormRender.call(this);
  }

  toggleSubtractFee() {
    this.setState({
      subtractFee: !this.state.subtractFee,
    });
  }

  componentWillMount() {
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

  componentWillReceiveProps(props) {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;

    if (_coin !== props.ActiveCoin.coin &&
        this.props.ActiveCoin.lastSendToResponse) {
      Store.dispatch(clearLastSendToResponseState());
    }
    this.checkZAddressCount(props);

    if (this.props.ActiveCoin.activeSection !== props.ActiveCoin.activeSection &&
        this.props.ActiveCoin.activeSection !== 'send') {
      this.fetchBTCFees();
      this.fetchETHFees();

      if (_mode === 'spv' &&
          _coin === 'KMD') {
        this._checkCurrentTimestamp();
      }
    }

    if (_mode === 'spv' &&
        !this.state.fee &&
        _coin !== 'BTC') {
      this.setState({
        fee: fromSats(staticVar.spvFees[_coin]),
      });
    }

    if (this.props.initState) {
      this.setState({
        amount: this.props.initState.exchangeOrder.expectedDepositCoinAmount === this.props.ActiveCoin.balance.balance ? Number(this.props.initState.exchangeOrder.expectedDepositCoinAmount - fromSats(staticVar.spvFees[_coin])) : Number(this.props.initState.exchangeOrder.expectedDepositCoinAmount), //Number(this.props.initState.exchangeOrder.expectedDepositCoinAmount * 1.0005).toFixed(8),
        sendTo: this.props.initState.exchangeOrder.exchangeAddress.address,
      });
      console.warn('send coin', this.props.initState);
    }
  }

  setRecieverFromScan(receiver) {
    try {
      const recObj = JSON.parse(receiver);
      let _newState = {};

      if (recObj &&
          typeof recObj === 'object') {
        if (recObj.amount) {
          _newState.amount = recObj.amount;
        }
        if (recObj.address) {
          _newState.sendTo = recObj.address;
        }

        this.setState(_newState);
      }
    } catch (e) {
      let _newState = {};

      if (receiver.indexOf(':') > -1) {
        const _parsedBitcoinURL = parseBitcoinURL(receiver);
        
        if (_parsedBitcoinURL.amount) {
          _newState.amount = _parsedBitcoinURL.amount;
        }
        if (_parsedBitcoinURL.address) {
          _newState.sendTo = _parsedBitcoinURL.address;
        }
      } else {
        _newState.sendTo = receiver;
      }

      this.setState(_newState);
    }

    document.getElementById('kmdWalletSendTo').focus();
  }

  handleClickOutside(e) {
    const _srcElement = e ? e.srcElement : null;
    let _state = {};

    if (e &&
        _srcElement &&
        _srcElement.className &&
        typeof _srcElement.className === 'string' &&
        _srcElement.className !== 'btn dropdown-toggle btn-info' &&
        (_srcElement.offsetParent && _srcElement.offsetParent.className !== 'btn dropdown-toggle btn-info') &&
        (e.path && e.path[4] && e.path[4].className.indexOf('showkmdwalletaddrs') === -1)) {
      _state.addressSelectorOpen = false;
    }

    if (e &&
        _srcElement &&
        _srcElement.className &&
        typeof _srcElement.className === 'string' &&
        _srcElement.className !== 'fa fa-angle-down' &&
        _srcElement.className.indexOf('btn-send-address-book-dropdown') === -1) {
      _state.addressBookSelectorOpen = false;
    }

    if (e &&
        _srcElement &&
        _srcElement.className &&
        typeof _srcElement.className === 'string' &&
        _srcElement.className !== 'fa fa-angle-down' &&
        _srcElement.className.indexOf('btn-send-zfee-dropdown') === -1) {
      _state.ztxSelectorOpen = false;
    }

    this.setState(_state);
  }

  checkZAddressCount(props) {
    const _addresses = this.props.ActiveCoin.addresses;
    const _defaultState = {
      currentStep: 0,
      addressType: null,
      sendFrom: null,
      sendFromAmount: 0,
      sendTo: '',
      amount: 0,
      fee: 0,
      addressSelectorOpen: false,
      renderAddressDropdown: true,
      subtractFee: false,
      lastSendToResponse: null,
    };
    let updatedState;

    if (_addresses &&
        (!_addresses.private || _addresses.private.length === 0)) {
      updatedState = {
        lastSendToResponse: props.ActiveCoin.lastSendToResponse,
        coin: props.ActiveCoin.coin,
      };

      if ( this.props.ActiveCoin.mode === 'native') {
        updatedState.renderAddressDropdown = this.state.sendTo && (this.state.sendTo.substring(0, 2) === 'zc' || this.state.sendTo.substring(0, 2) === 'zs') && (this.state.sendTo.length === 95 || this.state.sendTo.length === 78) ? true : this.state.renderAddressDropdown;
      }
    } else {
      updatedState = {
        renderAddressDropdown: true,
        lastSendToResponse: props.ActiveCoin.lastSendToResponse,
        coin: props.ActiveCoin.coin,
      };
    }

    if (this.state.coin !== props.ActiveCoin.coin) {
      this.setState(Object.assign({}, _defaultState, updatedState));
    } else {
      this.setState(updatedState);
    }
  }

  renderAddressByType(type, toggleType) {
    const _coinAddresses = this.props.ActiveCoin.addresses;
    const _coin = this.props.ActiveCoin.coin;
    let _items = [];

    if (_coinAddresses &&
        _coinAddresses[type] &&
        _coinAddresses[type].length) {
      _coinAddresses[type].map((address) => {
        if (type === 'private' &&
            staticVar.chainParams &&
            staticVar.chainParams[_coin] &&
            staticVar.chainParams[_coin].ac_private &&
            !this.state.sendFrom) {
          this.setState({
            sendFrom: address.address,
            sendFromAmount: address.amount,
          });
        }        

        if ((address.amount > 0 &&
            (type !== 'public' || (address.canspend && type === 'public'))) ||
            toggleType === 'shieldCoinbase') {
          _items.push(
            <li
              className="selected"
              key={ address.address }>
              <a onClick={ () => this.updateAddressSelection(address.address, type, address.amount) }>
                <i className={ 'icon fa-eye' + (type === 'public' ? '' : '-slash') }></i>&nbsp;&nbsp;
                <span className="text">
                  [ { Number(Number(address.amount).toFixed(8)) } { _coin } ]&nbsp;&nbsp;
                  { type === 'public' ? address.address : address.address.substring(0, 34) + '...' }
                </span>
                { this.state.sendFrom === address.address &&
                  <span className="glyphicon glyphicon-ok check-mark pull-right"></span>
                }
              </a>
            </li>
          );
        }
      });

      return _items;
    } else {
      return null;
    }
  }

  renderOPIDListCheck() {
    if (this.state.renderAddressDropdown &&
        this.props.ActiveCoin.opids &&
        this.props.ActiveCoin.opids.length) {
      return true;
    }
  }

  renderSelectorCurrentLabel() {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;
    const _addrType = this.state.addressType;
    const _balance = this.props.ActiveCoin.balance;

    if (this.state.sendFrom) {
      return (
        <span>
          <i className={ 'icon fa-eye' + this.state.addressType === 'public' ? '' : '-slash' }></i>
          <span className="text">
            [ { Number(Number(this.state.sendFromAmount).toFixed(8)) } { _coin } ]  
            { _addrType === 'public' ? this.state.sendFrom : this.state.sendFrom.substring(0, 34) + '...' }
          </span>
        </span>
      );
    } else {
      const _notAcPrivate = staticVar.chainParams && staticVar.chainParams[_coin] && !staticVar.chainParams[_coin].ac_private;

      if (_mode === 'spv' ||
          _mode === 'eth' ||
          _addrType === 'private' ||
          (_addrType === 'public' && _coin !== 'KMD' && _notAcPrivate)) {
        if (_mode === 'spv') {
          return (
            <span>
              { `[ ${_balance.balance + _balance.unconfirmed} ${_coin} ] ${this.props.Dashboard.electrumCoins[_coin].pub}` }
            </span>
          );
        } else if (_mode === 'eth') {
          return (
            <span>
              { `[ ${_balance.balance} ${_coin} ] ${this.props.Dashboard.ethereumCoins[_coin].pub}` }
            </span>
          );
        } else if (_mode === 'native') {
          return(
            <span>
              { translate('INDEX.T_FUNDS') }
            </span>
          );
        }
      } else {
        return (
          <span>{ translate('SEND.SELECT_ADDRESS') }</span>
        );
      }
    }
  }

  renderAddressList() {
    return AddressListRender.call(this);
  }

  renderShielCoinbaseAddressList() {
    return AddressListRenderShieldCoinbase.call(this);
  }

  renderOPIDLabel(opid) {
    const _satatusDef = {
      queued: {
        icon: 'warning',
        label: 'QUEUED',
      },
      executing: {
        icon: 'info',
        label: 'EXECUTING',
      },
      failed: {
        icon: 'danger',
        label: 'FAILED',
      },
      success: {
        icon: 'success',
        label: 'SUCCESS',
      },
    };

    return (
      <span className={ `label label-${_satatusDef[opid.status].icon}` }>
        <i className="icon fa-eye"></i>&nbsp;
        <span>{ translate(`KMD_NATIVE.${_satatusDef[opid.status].label}`) }</span>
      </span>
    );
  }

  renderOPIDResult(opid) {
    let isWaitingStatus = true;

    if (opid.status === 'queued') {
      isWaitingStatus = false;
      return (
        <i>{ translate('SEND.AWAITING') }...</i>
      );
    } else if (opid.status === 'executing') {
      isWaitingStatus = false;
      return (
        <i>{ translate('SEND.PROCESSING') }...</i>
      );
    } else if (opid.status === 'failed') {
      isWaitingStatus = false;
      return (
        <span className="selectable">
          <strong>{ translate('SEND.ERROR_CODE') }:</strong> <span>{ opid.error.code }</span>
          <br />
          <strong>{ translate('KMD_NATIVE.MESSAGE') }:</strong> <span>{ opid.error.message }</span>
        </span>
      );
    } else if (opid.status === 'success') {
      isWaitingStatus = false;
      return (
        <span className="selectable">
          <strong>{ translate('KMD_NATIVE.TXID') }:</strong> <span>{ opid.result.txid }</span>
          <br />
          <strong>{ translate('KMD_NATIVE.EXECUTION_SECONDS') }:</strong> <span>{ opid.execution_secs }</span>
        </span>
      );
    }

    if (isWaitingStatus) {
      return (
        <span>{ translate('SEND.WAITING') }...</span>
      );
    }
  }

  renderOPIDList() {
    if (this.props.ActiveCoin.opids &&
        this.props.ActiveCoin.opids.length) {
      const _opids = this.props.ActiveCoin.opids;
      let _items = [];

      for (let i = 0; i < _opids.length; i++) {
        _items.push(
          <tr key={ _opids[i].id }>
            <td>{ this.renderOPIDLabel(_opids[i]) }</td>
            <td className="selectable">{ _opids[i].id }</td>
            <td className="selectable">{ secondsToString(_opids[i].creation_time) }</td>
            <td>{ this.renderOPIDResult(_opids[i]) }</td>
          </tr>
        );
      }

      return _items;
    } else {
      return null;
    }
  }

  openDropMenu() {
    this.setState(Object.assign({}, this.state, {
      addressSelectorOpen: !this.state.addressSelectorOpen,
    }));
  }

  updateAddressSelection(address, type, amount) {
    this.setState(Object.assign({}, this.state, {
      sendFrom: address,
      addressType: type,
      sendFromAmount: amount,
      addressSelectorOpen: !this.state.addressSelectorOpen,
    }));
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });

    if (this.props.ActiveCoin.mode === 'native') {
      setTimeout(() => {
        this.setState({
          renderAddressDropdown: this.state.sendTo && (this.state.sendTo.substring(0, 2) === 'zc' || this.state.sendTo.substring(0, 2) === 'zs') && (this.state.sendTo.length === 95 || this.state.sendTo.length === 78) ? true : this.state.renderAddressDropdown,
        });
      }, 100);
    }
  }

  fetchBTCFees() {
    if (this.props.ActiveCoin.mode === 'spv' &&
        this.props.ActiveCoin.coin === 'BTC') {
      apiGetRemoteBTCFees()
      .then((res) => {
        if (res.msg === 'success') {
          // TODO: check, approx fiat value
          this.setState({
            btcFees: res.result,
            btcFeesSize: this.state.btcFeesType === 'advanced' ? res.result.electrum[this.state.btcFeesAdvancedStep] : res.result.recommended[_feeLookup.btc[this.state.btcFeesTimeBasedStep]],
          });
        } else {
          apiGetLocalBTCFees()
          .then((res) => {
            if (res.msg === 'success') {
              // TODO: check, approx fiat value
              this.setState({
                btcFees: res.result,
                btcFeesSize: this.state.btcFeesType === 'advanced' ? res.result.electrum[this.state.btcFeesAdvancedStep] : res.result.recommended[_feeLookup.btc[this.state.btcFeesTimeBasedStep]],
              });
            } else {
              Store.dispatch(
                triggerToaster(
                  translate('SEND.CANT_GET_BTC_FEES'),
                  translate('TOASTR.WALLET_NOTIFICATION'),
                  'error'
                )
              );
            }
          });
        }
      });
    }
  }

  fetchETHFees() {
    if (this.props.ActiveCoin.mode === 'eth') {
      apiEthereumGasPrice()
      .then((res) => {
        if (res.msg === 'success') {
          // TODO: check, approx fiat value
          this.setState({
            ethFees: res.result,
          });
        } else {
          Store.dispatch(
            triggerToaster(
              translate('SEND.UNABLE_TO_GET_ETH_GAS_PRICE'),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
        }
      });
    }
  }

  changeSendCoinStep(step, back) {
    const _mode = this.props.ActiveCoin.mode;
    const _coin = this.props.ActiveCoin.coin;

    if (_mode === 'spv' &&
        _coin === 'KMD') {
      this._checkCurrentTimestamp();
    }

    if (step === 0) {
      this.fetchBTCFees();
      this.fetchETHFees();
      
      if (back) {
        this.setState({
          currentStep: 0,
          spvVerificationWarning: false,
          spvDpowVerificationWarning: 'n/a',
          spvPreflightSendInProgress: false,
          ethPreflightSendInProgress: false,
          pin: '',
          noUtxo: false,
        });
        if (this.props.cb) {
          setTimeout(() => {
            this.props.cb(this.state);
          }, 100);
        }
      } else {
        Store.dispatch(clearLastSendToResponseState());

        this.setState(this.defaultState);

        if (this.props.cb) {
          setTimeout(() => {
            this.props.cb(this.state);
          }, 100);
        }
      }
    }

    if (step === 1) {
      if (!this.validateSendFormData()) {
        return;
      } else {
        let kvHex;

        if (this.state.kvSend) {
          const kvEncode = kv.encode({
            tag: this.state.kvSendTag,
            content: {
              title: this.state.kvSendTitle,
              version: '01',
              body: this.state.kvSendContent,
            },
          });

          // console.warn(kvEncode);
          kvHex = kvEncode;
        }

        this.setState(Object.assign({}, this.state, {
          spvPreflightSendInProgress: _mode === 'spv' ? true : false,
          ethPreflightSendInProgress: _mode === 'eth' ? true : false,
          currentStep: step,
          kvHex,
          spvPreflightRes: null,
          ethPreflightRes: null,
        }));

        if (this.props.cb) {
          setTimeout(() => {
            this.props.cb(this.state);
          }, 100);
        }
        // spv pre tx push request
        if (_mode === 'spv') {
          apiElectrumSendPreflight(
            this.props.ActiveCoin.coin,
            toSats(this.state.amount),
            this.state.sendTo,
            this.props.Dashboard.electrumCoins[_coin].pub,
            _coin === 'BTC' ? this.state.btcFeesSize : null,
            Number((toSats(this.state.fee)).toFixed(8)),
            this.state.kvSend,
            kvHex,
          )
          .then((sendPreflight) => {
            if (sendPreflight &&
                sendPreflight.msg === 'success') {
              this.setState(Object.assign({}, this.state, {
                spvVerificationWarning: !sendPreflight.result.utxoVerified,
                spvDpowVerificationWarning: sendPreflight.result.dpowSecured,
                spvPreflightSendInProgress: false,
                spvPreflightRes: {
                  fee: sendPreflight.result.fee,
                  value: sendPreflight.result.value,
                  change: sendPreflight.result.change,
                  estimatedFee: sendPreflight.result.estimatedFee,
                  totalInterest: sendPreflight.result.totalInterest,
                },
              }));
              if (this.props.cb) {
                setTimeout(() => {
                  this.props.cb(this.state);
                }, 100);
              }
            } else {
              this.setState(Object.assign({}, this.state, {
                spvPreflightSendInProgress: false,
                spvDpowVerificationWarning: 'n/a',
                noUtxo: sendPreflight.result === 'no valid utxo' ? true : false,
              }));
              if (this.props.cb) {
                setTimeout(() => {
                    this.props.cb(this.state);
                }, 100);
              }
            }
          });
        } else if (
          _mode === 'eth' &&
          erc20ContractId[this.props.ActiveCoin.coin]
        ) { // spv pre tx push request          
          apiEthereumSendERC20Preflight(
            this.props.ActiveCoin.coin,
            this.state.sendTo,
            this.state.amount,
            _feeLookup.eth[this.state.ethFeeType],
          )
          .then((sendPreflight) => {            
            if (sendPreflight &&
                sendPreflight.msg === 'success') {
              this.setState(Object.assign({}, this.state, {
                ethPreflightSendInProgress: false,
                ethPreflightRes: {
                  fee: Number(sendPreflight.result.fee).toFixed(8),
                  balanceAferFee: Number(sendPreflight.result.balanceAferFee).toFixed(8),
                  notEnoughBalance: sendPreflight.result.notEnoughBalance,
                  maxBalance: {
                    balance: Number(sendPreflight.result.maxBalance.balance).toFixed(8),
                  },
                },
              }));
              if (this.props.cb) {
                  setTimeout(() => {
                    this.props.cb(this.state);
                }, 100);
              }
            } else {
              this.setState(Object.assign({}, this.state, {
                ethPreflightSendInProgress: false,
                ethPreflightRes: sendPreflight,
              }));
              if (this.props.cb) {
                setTimeout(() => {
                  this.props.cb(this.state);
                }, 100);
              }
            }
          });
        }
      }
    }

    if (step === 2) {
      this.setState(Object.assign({}, this.state, {
        currentStep: step,
      }));
      if (this.props.cb) {
        setTimeout(() => {
          this.props.cb(this.state);
        }, 100);
      }
      this.handleSubmit();
    }
  }

  handleSubmit() {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;

    if (!this.validateSendFormData()) {
      return;
    }

    if (_mode === 'native') {
      Store.dispatch(
        sendNativeTx(
          _coin,
          this.state
        )
      );

      if (this.state.addressType === 'private') {
        setTimeout(() => {
          Store.dispatch(
            getKMDOPID(
              null,
              _coin
            )
          );
        }, 1000);
      }
    } else if (_mode === 'spv') {
      // no op
      const _pub = this.props.Dashboard.electrumCoins[_coin].pub;
      
      if (_pub) {
        Store.dispatch(
          apiElectrumSend(
            _coin,
            toSats(this.state.amount),
            this.state.sendTo,
            _pub,
            _coin === 'BTC' ? this.state.btcFeesSize : null,
            Number((toSats(this.state.fee)).toFixed(8)),
            this.state.kvSend,
            this.state.kvHex,
          )
        );
      }
    } else if (_mode === 'eth') {
      // no op
      const _pub = this.props.Dashboard.ethereumCoins[_coin].pub;
      
      if (_pub) {
        if (erc20ContractId[_coin]) {
          // coin, dest, value, speed, push
          Store.dispatch(
            apiEthereumSend(
              _coin,
              this.state.sendTo,
              this.state.amount,
              _feeLookup.eth[this.state.ethFeeType],
              true,
            )
          );
        } else {
          // coin, dest, value, speed, push
          Store.dispatch(
            apiEthereumSend(
              _coin,
              this.state.sendTo,
              this.state.amount,
              _feeLookup.eth[this.state.ethFeeType],
              true,
            )
          );
        }
      }
    }
  }

  // TODO: reduce to a single toast
  validateSendFormData() {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;
    const isAcPrivate = _mode === 'native' && _coin !== 'KMD' && staticVar.chainParams && staticVar.chainParams[_coin] && staticVar.chainParams[_coin].ac_private ? true : false;
    let valid = true;

    // temp
    if (_mode === 'native') {
      if (_coin === 'KMD') { // reject t -> z
        if ((this.state.sendFrom && ((this.state.sendFrom.substring(0, 2) === 'zc' && this.state.sendFrom.length === 95) || (this.state.sendFrom.substring(0, 2) === 'zs' && this.state.sendFrom.length === 78))) ||
            (this.state.sendTo && ((this.state.sendTo.substring(0, 2) === 'zc' && this.state.sendTo.length === 95) || (this.state.sendTo.substring(0, 2) === 'zs' && this.state.sendTo.length === 78)))) {
          Store.dispatch(
            triggerToaster(
              translate('SEND.KMD_Z_ADDRESSES_DEPRECATED_NOTICE'),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'warning toastr-wide',
              false
            )
          );
          valid = false;
        }
      } else {
        if (this.state.sendTo &&
            this.state.sendTo.substring(0, 2) === 'zc' &&
            this.state.sendTo.length === 95) {
          Store.dispatch(
            triggerToaster(
              translate('SEND.SPROUT_DEPRECATION_NOTICE'),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'warning toastr-wide',
              false
            )
          );
          valid = false;
        }
      }
    }

    if (_mode === 'spv') {
      const _customFee = toSats(this.state.fee);
      const _amount = this.state.amount;
      const _amountSats = Math.floor(toSats(this.state.amount));
      const _balanceSats = this.props.ActiveCoin.balance.balanceSats + this.props.ActiveCoin.balance.unconfirmedSats;
      let _fees = staticVar.spvFees;
      _fees.BTC = 0;

      if (_balanceSats !== _amountSats &&
          Number(_amountSats) + (_customFee) > _balanceSats) {
        Store.dispatch(
          triggerToaster(
            `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('SEND.MAX_AVAIL_BALANCE')} ${Number((fromSats(_balanceSats - (_customFee || _fees[_coin]))).toFixed(8))} ${_coin}`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      } else if (
        Number(_amountSats) < _fees[_coin] &&
        !this.state.kvSend
      ) {
        Store.dispatch(
          triggerToaster(
            `${translate('SEND.AMOUNT_IS_TOO_SMALL', this.state.amount)}, ${translate('SEND.MIN_AMOUNT_IS', _coin)} ${Number(fromSats(_fees[_coin]))}`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      }

      if (this.state.fee &&
          !isPositiveNumber(this.state.fee)) {
        Store.dispatch(
          triggerToaster(
            translate('SEND.FEE_POSITIVE_NUMBER'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      }

      if (isPositiveNumber(this.state.fee) &&
          Number(toSats(this.state.fee)) > _fees[_coin] * FEE_EXCEEDS_DEFAULT_THRESHOLD &&
          _coin !== 'BTC') {
        Store.dispatch(
          triggerToaster(
            translate('SEND.WARNING_FEE_EXCEEDS_DEFAULT_THRESHOLD', FEE_EXCEEDS_DEFAULT_THRESHOLD),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error',
            false
          )
        );
      }
    }

    if (_mode === 'eth') {
      const _amount = this.state.amount;
      const _balance = this.props.ActiveCoin.balance.balance;

      if (erc20ContractId[_coin]) {
        if (Number(_amount) > _balance) {
          Store.dispatch(
            triggerToaster(
              `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('SEND.MAX_AVAIL_BALANCE')} ${Number(_balance).toFixed(8)} ${_coin}`,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
          valid = false;
        }
      } else {
        const _fee = formatEther(this.state.ethFees[_feeLookup.eth[this.state.ethFeeType]] * coinFees[this.props.ActiveCoin.coin.toLowerCase()]);

        if (Number(_amount) > _balance) {
          Store.dispatch(
            triggerToaster(
              `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('SEND.MAX_AVAIL_BALANCE')} ${Number((Number(_balance)).toFixed(8))} ${_coin}`,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
          valid = false;
        }
      }
    }

    if (!this.state.sendTo ||
        (this.state.sendTo && this.state.sendTo.substring(0, 2) !== 'zc' && this.state.sendTo.substring(0, 2) !== 'zs')) {
      let _validateAddress;
      let _msg;

      if (_mode === 'eth') {
        try {
          _validateAddress = getAddress(this.state.sendTo);
        } catch (e) {
          _validateAddress = 'Invalid pub address';
        }
      } else {
        _validateAddress = addressVersionCheck(networks[_coin.toLowerCase()] || networks.kmd, this.state.sendTo);
      }

      if (_validateAddress === 'Invalid pub address') {
        _msg = _validateAddress;
      } else if (!_validateAddress) {
        _msg = `${this.state.sendTo} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P1')} ${_coin} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P2')}`;
      }

      if (_msg &&
          !isAcPrivate) {
        Store.dispatch(
          triggerToaster(
            _msg,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      }
    }

    if (!isPositiveNumber(this.state.amount)) {
      Store.dispatch(
        triggerToaster(
          translate('SEND.AMOUNT_POSITIVE_NUMBER'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    if (_mode === 'native') {
      const _balance = this.props.ActiveCoin.balance;

      if (((!this.state.sendFrom || this.state.addressType === 'public') &&
          this.state.sendTo &&
          this.state.sendTo.length === 34 &&
          _balance &&
          _balance.transparent &&
          Number(Number(this.state.amount) + (this.state.subtractFee ? 0 : 0.0001)) > Number(_balance.transparent)) ||
          (this.state.addressType === 'public' &&
          this.state.sendTo &&
          this.state.sendTo.length > 34 &&
          this.state.sendFrom &&
          Number(Number(this.state.amount) + 0.0001) > Number(this.state.sendFromAmount)) ||
          (this.state.addressType === 'private' &&
          this.state.sendTo &&
          this.state.sendTo.length >= 34 &&
          this.state.sendFrom &&
          Number(Number(this.state.amount) + 0.0001) > Number(this.state.sendFromAmount))) {
        Store.dispatch(
          triggerToaster(
            Number(this.state.sendFromAmount || _balance.transparent) > 0 ? `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('SEND.MAX_AVAIL_BALANCE')} ${Number(this.state.sendFromAmount || _balance.transparent)} ${_coin}` : translate('SEND.INSUFFICIENT_FUNDS'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      }

      if (this.state.sendTo.length > 34 &&
          (this.state.sendTo.substring(0, 2) === 'zc' || this.state.sendTo.substring(0, 2) === 'zs') &&
          !this.state.sendFrom) {
        Store.dispatch(
          triggerToaster(
            translate('SEND.SELECT_SOURCE_ADDRESS'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      }
    }

    // validate z address, ac_private mandatory
    if ((_mode === 'native' && isAcPrivate) ||
        (this.state.sendTo &&
        (this.state.sendTo.substring(0, 2) === 'zc' || this.state.sendTo.substring(0, 2) === 'zs') &&
        this.state.sendTo.length > 64)) {
      validateAddress(
        _coin,
        this.state.sendTo,
        true
      )
      .then((json) => {
        if (!json ||
            (json && json.error) ||
            (json && json.isvalid === false)) {
          Store.dispatch(
            triggerToaster(
              json && json.isvalid === false ? translate('SEND.INVALID_Z_ADDRESS') : json.error.message,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
        }
      });
    }

    return valid;
  }

  isTransparentTx() {
    if (((this.state.sendFrom && this.state.sendFrom.length === 34) || !this.state.sendFrom) &&
        (this.state.sendTo && this.state.sendTo.length === 34)) {
      return true;
    }

    return false;
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

  onSliderChange(value) {
    this.setState({
      btcFeesSize: this.state.btcFees.electrum[value],
      btcFeesAdvancedStep: value,
    });
  }

  onSliderChangeTime(value) {
    this.setState({
      btcFeesSize: _feeLookup.btc[value] === 'advanced' ? this.state.btcFees.electrum[this.state.btcFeesAdvancedStep] : this.state.btcFees.recommended[_feeLookup.btc[value]],
      btcFeesType: _feeLookup.btc[value] === 'advanced' ? 'advanced' : null,
      btcFeesTimeBasedStep: value,
    });
  }

  onSliderChangeTimeEth(value) {
    this.setState({
      ethFeeType: value,
    });
  }

  renderBTCFees() {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;

    if (_mode === 'spv' &&
        _coin === 'BTC' &&
        !this.state.btcFees.lastUpdated) {
      return (
        <div className="col-lg-6 form-group form-material">{ translate('SEND.FETCHING_BTC_FEES') }...</div>
      );
    } else if (
      _mode === 'spv' &&
      _coin === 'BTC' &&
      this.state.btcFees.lastUpdated
    ) {
      const _min = 0;
      const _max = this.state.btcFees.electrum.length - 1;
      const _confTime = [
        translate('SEND.CONF_TIME_LESS_THAN_30_MIN'),
        translate('SEND.CONF_TIME_WITHIN_3O_MIN'),
        translate('SEND.CONF_TIME_WITHIN_60_MIN'),
      ];
      const _minTimeBased = 0;
      const _maxTimeBased = 3;

      return (
        <div className="col-lg-12 form-group form-material">
          <div>
            <div>
              { translate('SEND.FEE') }
              <span>
                <i
                  className="icon fa-question-circle settings-help"
                  data-html={ true }
                  data-for="sendCoin1"
                  data-tip={
                    this.state.btcFeesType === 'advanced' ? translate('SEND.BTC_FEES_DESC_P1') + '.<br />' + translate('SEND.BTC_FEES_DESC_P2') : translate('SEND.BTC_FEES_DESC_P3') + '<br />' + translate('SEND.BTC_FEES_DESC_P4')
                  }></i>
                <ReactTooltip
                  id="sendCoin1"
                  effect="solid"
                  className="text-left" />
              </span>
            </div>
            <div className="send-target-block">
              { this.state.btcFeesType !== 'advanced' &&
                <span>
                  { translate('SEND.CONF_TIME') } <strong>{ _confTime[this.state.btcFeesTimeBasedStep] }</strong>
                </span>
              }
              { this.state.btcFeesType === 'advanced' &&
                <span>{ translate('SEND.ADVANCED_SELECTION') }</span>
              }
            </div>
            <Slider
              className="send-slider-time-based margin-bottom-70"
              onChange={ this.onSliderChangeTime }
              defaultValue={ this.state.btcFeesTimeBasedStep }
              min={ _minTimeBased }
              max={ _maxTimeBased }
              dots={ true }
              marks={{
                0: 'fast',
                1: 'average',
                2: 'slow',
                3: 'advanced',
              }} />
            { this.state.btcFeesType === 'advanced' &&
              <div className="margin-bottom-20">
                <div className="send-target-block">
                  { translate('SEND.ESTIMATED_TO_BE_INCLUDED_P1') } <strong>{this.state.btcFeesAdvancedStep + 1} {(this.state.btcFeesAdvancedStep + 1) > 1 ? translate('SEND.ESTIMATED_TO_BE_INCLUDED_P2') : translate('SEND.ESTIMATED_TO_BE_INCLUDED_P3') }</strong>
                </div>
                <Slider
                  onChange={ this.onSliderChange }
                  defaultValue={ this.state.btcFeesAdvancedStep }
                  min={ _min }
                  max={ _max } />
              </div>
            }
            { this.state.btcFeesSize > 0 &&
              <div className="margin-top-10">
                { translate('SEND.FEE_PER_BYTE') } {this.state.btcFeesSize}, { translate('SEND.PER_KB') } { this.state.btcFeesSize * 1024 }
              </div>
            }
          </div>
        </div>
      );
    }
  }

  renderETHFees() {
    const _coin = this.props.ActiveCoin.coin;
    const _mode = this.props.ActiveCoin.mode;

    if (_mode === 'eth' &&
        !this.state.ethFees) {
      return (
        <div className="col-lg-6 form-group form-material">{ translate('SEND.FETCHING_ETH_FEES') }...</div>
      );
    } else if (
      _mode === 'eth' &&
      this.state.ethFees
    ) {
      const _confTime = [
        translate('SEND.ETH_CONF_TIME_LESS_THAN_2_MIN'),
        translate('SEND.ETH_CONF_TIME_LESS_THAN_5_MIN'),
        translate('SEND.ETH_CONF_TIME_LESS_THAN_30_MIN'),
      ];

      return (
        <div className="col-lg-12 form-group form-material">
          <div>
            <div>
              { translate('SEND.CONF_TIME') } <strong>{ _confTime[this.state.ethFeeType] }</strong>
            </div>
            <Slider
              className="send-slider-time-based margin-top-15 margin-bottom-70"
              onChange={ this.onSliderChangeTimeEth }
              defaultValue={ this.state.ethFeeType }
              min={ 0 }
              max={ 2 }
              dots={ true }
              marks={{
                0: 'fast',
                1: 'average',
                2: 'slow',
              }} />
            { this.state.ethFees &&
              this.state.ethFees.average &&
              !erc20ContractId[_coin] &&
              <div className="margin-top-10">
                { translate('SEND.FEE') }: { formatEther(this.state.ethFees[_feeLookup.eth[this.state.ethFeeType]] * coinFees[this.props.ActiveCoin.coin.toLowerCase()]) }
              </div>
            }
          </div>
        </div>
      );
    }
  }

  renderAddressBookDropdown(countAddressesSpv) {
    const _mode = this.props.ActiveCoin.mode;
    const _coin = this.props.ActiveCoin.coin;
    const __coin = isKomodoCoin(_coin) ? 'KMD' : _coin;
    const _addressBook = this.props.AddressBook && this.props.AddressBook.arr && typeof this.props.AddressBook.arr === 'object' ? this.props.AddressBook.arr[__coin] : [];
    let _items = [];

    if (_mode === 'spv') {
      _items.push(
        <li
          key="send-address-book-item-self"
          onClick={ () => this.setToAddress(this.props.Dashboard.electrumCoins[_coin].pub) }>{ translate('SEND.SELF') }</li>
      );
    }

    if (_addressBook &&
        _addressBook.length) {
      for (let i = 0; i < _addressBook.length; i++) {
        if ((_mode === 'native' && _coin !== 'KMD') ||
            ((_mode === 'spv' || (_mode === 'native' && _coin === 'KMD')) && _addressBook[i].pub && _addressBook[i].pub.substring(0, 2) !== 'zc' && _addressBook[i].pub.substring(0, 2) !== 'zs' && _addressBook[i].pub.length === 64)) {
          _items.push(
            <li
              key={ `send-address-book-item-${i}` }
              onClick={ () => this.setToAddress(_addressBook[i].pub) }>{ _addressBook[i].title || _addressBook[i].pub }</li>
          );
        }
      }
    }

    if (countAddressesSpv) {
      return _mode === 'spv' ? _items.length - 1 : _items.length;
    } else {
      return _items;
    }
  }

  renderZtxDropdown() {
    const _options = [{
      title: 'default',
      val: DEFAULT_ZTX_FEE,
    }, {
      title: `x2 (${DEFAULT_ZTX_FEE * 2})`,
      val: DEFAULT_ZTX_FEE * 2,
    }, {
      title: `x5 (${DEFAULT_ZTX_FEE * 5})`,
      val: DEFAULT_ZTX_FEE * 5,
    }, {
      title: `x10 (${DEFAULT_ZTX_FEE * 10})`,
      val: DEFAULT_ZTX_FEE * 10,
    }, {
      title: `x100 (${DEFAULT_ZTX_FEE * 100})`,
      val: DEFAULT_ZTX_FEE * 100,
    }];
    let _items = [];

    for (let i = 0; i < _options.length; i++) {
      _items.push(
        <li
          key={ `send-ztx-fee-${i}` }
          onClick={ () => this.setZtxFee(_options[i].val) }>{ _options[i].title }</li>
      );
    }

    return _items;
  }

  renderZmergeToAddress() {
    return ZmergeToAddressRender.call(this);
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        (this.props.ActiveCoin.activeSection === 'send' || this.props.activeSection === 'send')) {
      return SendRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state, props) => {
  let _mappedProps = {
    ActiveCoin: {
      addresses: state.ActiveCoin.addresses,
      coin: state.ActiveCoin.coin,
      mode: state.ActiveCoin.mode,
      opids: state.ActiveCoin.opids,
      balance: state.ActiveCoin.balance,
      activeSection: state.ActiveCoin.activeSection,
      lastSendToResponse: state.ActiveCoin.lastSendToResponse,
      progress: state.ActiveCoin.progress,
    },
    Dashboard: state.Dashboard,
    AddressBook: state.Settings.addressBook,
  };

  if (props) {
    if (props.activeSection) {
      _mappedProps.ActiveCoin.activeSection = props.activeSection;
    }
    if (props.renderFormOnly) {
      _mappedProps.ActiveCoin.renderFormOnly = props.renderFormOnly;
    }
    if (props.initState) {
      _mappedProps.ActiveCoin.initState = props.initState;
    }
    if (props.cb) {
      _mappedProps.ActiveCoin.cb = props.cb;
    }
  }

  return _mappedProps;
};

export default connect(mapStateToProps)(SendCoin);