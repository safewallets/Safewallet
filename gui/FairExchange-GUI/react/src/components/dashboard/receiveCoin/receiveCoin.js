import React from 'react';
import { connect } from 'react-redux';
import {
  copyCoinAddress,
  getNewKMDAddresses,
  dumpPrivKey,
  copyString,
  triggerToaster,
  validateAddress,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  AddressActionsNonBasiliskModeRender,
  AddressItemRender,
  ReceiveCoinRender,
  _ReceiveCoinTableRender,
} from './receiveCoin.render';
import translate from '../../../translate/translate';
import mainWindow, { staticVar } from '../../../util/mainWindow';

// TODO: implement balance/interest sorting

class ReceiveCoin extends React.Component {
  constructor() {
    super();
    this.state = {
      openDropMenu: false,
      hideZeroAdresses: false,
      toggledAddressMenu: null,
      toggleIsMine: false,
    };
    this.openDropMenu = this.openDropMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.toggleVisibleAddress = this.toggleVisibleAddress.bind(this);
    this.checkTotalBalance = this.checkTotalBalance.bind(this);
    this.ReceiveCoinTableRender = _ReceiveCoinTableRender.bind(this);
    this.toggleAddressMenu = this.toggleAddressMenu.bind(this);
    this.toggleIsMine = this.toggleIsMine.bind(this);
    this.validateCoinAddress = this.validateCoinAddress.bind(this);
    this.copyPubkeyNative = this.copyPubkeyNative.bind(this);
  }

  toggleAddressMenu(address) {
    this.setState({
      toggledAddressMenu: this.state.toggledAddressMenu === address ? null : address,
    });
  }

  ReceiveCoinTableRender() {
    return this._ReceiveCoinTableRender();
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

  copyPubkeyNative(address) {
    this.toggleAddressMenu(null);

    validateAddress(
      this.props.coin,
      address
    )
    .then((json) => {
      if (json &&
          json.pubkey) {
        Store.dispatch(copyString(json.pubkey, translate('INDEX.PUBKEY_COPIED')));
      } else {
        Store.dispatch(
          triggerToaster(
            translate('TOASTR.UNABLE_TO_COPY_PUBKEY'),
            translate('TOASTR.COIN_NOTIFICATION'),
            'error',
          )
        );
      }
    });
  }

  validateCoinAddress(address, isZaddr) {
    this.toggleAddressMenu(address);

    validateAddress(
      this.props.coin,
      address,
      isZaddr
    )
    .then((json) => {
      let _items = [];

      for (let key in json) {
        _items.push(`${key}: ${json[key]}`);
      }

      Store.dispatch(
        triggerToaster(
          _items,
          translate('TOASTR.COIN_NOTIFICATION'),
          json && json.ismine ? 'info' : 'warning',
          false,
          'toastr--validate-address'
        )
      );
    });
  }

  dumpPrivKey(address, isZaddr) {
    this.toggleAddressMenu(address);

    dumpPrivKey(
      this.props.coin,
      address,
      isZaddr
    )
    .then((json) => {
      if (json.length &&
          json.length > 10) {
        Store.dispatch(copyString(json, `WIF ${translate('DASHBOARD.RECEIVE_ADDR_COPIED')}`));
      }
    });
  }

  handleClickOutside(e) {
    const _srcElement = e ? e.srcElement : null;

    if (e &&
        _srcElement &&
        _srcElement.offsetParent &&
        _srcElement.offsetParent.className.indexOf('dropdown') === -1 &&
        (_srcElement.offsetParent && _srcElement.offsetParent.className.indexOf('dropdown') === -1)) {
      this.setState({
        openDropMenu: false,
        toggledAddressMenu:
          _srcElement.className.indexOf('receive-address-context-menu-trigger') === -1 &&
          _srcElement.className.indexOf('fa-qrcode') === -1 &&
          _srcElement.className.indexOf('receive-address-context-menu-get-qr') === -1 &&
          _srcElement.className.indexOf('qrcode-modal') === -1 &&
          _srcElement.offsetParent.className.indexOf('modal') &&
          _srcElement.offsetParent.className.indexOf('close') ? null : this.state.toggledAddressMenu,
      });
    }
  }

  openDropMenu() {
    this.setState(Object.assign({}, this.state, {
      openDropMenu: !this.state.openDropMenu,
    }));
  }

  copyPubkeySpv(pubkey) {
    this.toggleAddressMenu(null);
    Store.dispatch(copyString(pubkey, translate('INDEX.PUBKEY_COPIED')));
  }

  _copyCoinAddress(address) {
    this.toggleAddressMenu(address);
    Store.dispatch(copyCoinAddress(address));
  }

  renderAddressActions(address, type) {
    return AddressActionsNonBasiliskModeRender.call(this, address, type);
  }

  hasNoAmount(address) {
    return address.amount === 'N/A' || address.amount === 0;
  }

  hasNoInterest(address) {
    return address.interest === 'N/A' || address.interest === 0 || !address.interest;
  }

  getNewAddress(type) {
    Store.dispatch(getNewKMDAddresses(this.props.coin, type, this.props.mode));
  }

  toggleVisibleAddress() {
    this.setState(Object.assign({}, this.state, {
      hideZeroAddresses: !this.state.hideZeroAddresses,
    }));
  }

  toggleIsMine() {
    this.setState(Object.assign({}, this.state, {
      toggleIsMine: !this.state.toggleIsMine,
    }));
  }

  checkTotalBalance() {
    let _balance = '0';

    if (this.props.balance &&
        this.props.balance.total) {
      _balance = this.props.balance.total;
    }

    return _balance;
  }

  renderAddressList(type) {
    const _addresses = this.props.addresses;

    if (_addresses &&
        _addresses[type] &&
        _addresses[type].length) {
      let items = [];

      for (let i = 0; i < _addresses[type].length; i++) {
        let address = _addresses[type][i];

        if (this.state.hideZeroAddresses) {
          if (!this.hasNoAmount(address)) {
            items.push(
              AddressItemRender.call(this, address, type)
            );
          }

          if (!this.state.toggleIsMine &&
              !address.canspend &&
              address.address.substring(0, 2) !== 'zc' &&
              address.address.substring(0, 2) !== 'zs') {
            items.pop();
          }
        } else {
          if ((type === 'private' && this.props.coin !== 'KMD') ||
              (type === 'public' &&
               (this.props.coin === 'KMD' ||
               (staticVar.chainParams &&
                 staticVar.chainParams[this.props.coin] &&
                 !staticVar.chainParams[this.props.coin].ac_private)))) {
            items.push(
              AddressItemRender.call(this, address, type)
            );
          }

          if (!this.state.toggleIsMine &&
              !address.canspend &&
              address.address.substring(0, 2) !== 'zc' &&
              address.address.substring(0, 2) !== 'zs') {
            items.pop();
          }
        }
      }

      return items;
    } else {
      if (this.props.electrumCoins &&
          this.props.mode === 'spv' &&
          type === 'public') {
        let items = [];

        if (mainWindow.multisig &&
            mainWindow.multisig.addresses &&
            mainWindow.multisig.addresses[this.props.coin.toUpperCase()]) {
          items.push(
            AddressItemRender.call(
              this,
              {
                address: mainWindow.multisig.addresses[this.props.coin.toUpperCase()],
                amount: this.props.balance.balance
              },
              'public'
            )
          );
        } else {
          items.push(
            AddressItemRender.call(
              this,
              {
                address: this.props.electrumCoins[this.props.coin].pub,
                amount: this.props.balance.balance
              },
              'public'
            )
          );
        }

        return items;
      } else if (
        this.props.ethereumCoins &&
        this.props.mode === 'eth' &&
        type === 'public'
      ) {
        let items = [];

        items.push(
          AddressItemRender.call(
            this,
            {
              address: this.props.ethereumCoins[this.props.coin].pub,
              amount: this.props.balance.balance
            },
            'public'
          )
        );

        return items;
      } else {
        return null;
      }
    }
  }

  render() {
    if (this.props &&
       (this.props.receive || this.props.activeSection === 'receive')) {
      return ReceiveCoinRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state, props) => {
  let _mappedProps = {
    coin: state.ActiveCoin.coin,
    mode: state.ActiveCoin.mode,
    receive: state.ActiveCoin.receive,
    balance: state.ActiveCoin.balance,
    cache: state.ActiveCoin.cache,
    activeSection: state.ActiveCoin.activeSection,
    activeAddress: state.ActiveCoin.activeAddress,
    addresses: state.ActiveCoin.addresses,
    electrumCoins: state.Dashboard.electrumCoins,
    ethereumCoins: state.Dashboard.ethereumCoins,
  };

  if (props &&
      props.activeSection &&
      props.renderTableOnly) {
    _mappedProps.activeSection = props.activeSection;
    _mappedProps.renderTableOnly = props.renderTableOnly;
  }

  return _mappedProps;
};

export default connect(mapStateToProps)(ReceiveCoin);