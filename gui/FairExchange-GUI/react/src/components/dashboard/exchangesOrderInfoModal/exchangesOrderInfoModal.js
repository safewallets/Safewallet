import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import {
  toggleExchangesOrderInfoModal,
  getTxDetails,
  apiElectrumTransaction,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import ExchangesOrderInfoModalRender from './exchangesOrderInfoModal.render';
import Config from '../../../config';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';

const { shell } = window.require('electron');

class ExchangesOrderInfoModal extends React.Component {
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      className: 'hide',
      deposit: null,
      depositFetching: false,
    };
    this._toggleExchangesOrderInfoModal = this._toggleExchangesOrderInfoModal.bind(this);
    this.getTransactionElectrum = this.getTransactionElectrum.bind(this);
    this.findDeposits = this.findDeposits.bind(this);
  }

  findDeposits(orderId) {
    const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.props.provider];
    let _items = [];

    if (_cache &&
        _cache.deposits) {
      for (let key in _cache.deposits) {
        if (_cache.deposits[key] === orderId) {
          _items.push(key.split('-')[1]);
        }
      }
    }

    return _items;
  }

  openExplorerWindow(txid) {
    const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.props.provider];
    const _orderId = this.props.Dashboard.showExchangesOrderInfoId;
    const _coin = _cache[_orderId].depositCoin.toUpperCase();
    const url = explorerList[_coin].split('/').length - 1 > 2 ? `${explorerList[_coin]}${txid}` : `${explorerList[_coin]}/tx/${txid}`;      

    return shell.openExternal(url);
  }

  openOrderWindow(orderId) {
    let url;

    if (this.props.provider === 'coinswitch') {
      url = `https://coinswitch.co/app/exchange/transaction/${orderId}`;
    }

    return shell.openExternal(url);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getTransactionElectrum() {
    const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.props.provider];
    const _orderId = this.props.Dashboard.showExchangesOrderInfoId;

    this.setState({
      depositFetching: true,
    });

    apiElectrumTransaction(
      _cache[_orderId].depositCoin.toUpperCase(),
      _cache[_orderId].exchangeAddress.address,
      _cache[_orderId].inputTransactionHash || this.findDeposits(_orderId)[0]
    )
    .then((transactionDetails) => {
      this.setState({
        depositFetching: false,
        deposit: transactionDetails[0],
      });
    });
  }

  _toggleExchangesOrderInfoModal() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
      deposit: null,
    }));

    setTimeout(() => {
      Store.dispatch(toggleExchangesOrderInfoModal(null));

      this.setState(Object.assign({}, this.state, {
        activeTab: 0,
      }));
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const _dashboard = nextProps.Dashboard;

    if (this.props.Dashboard.showExchangesOrderInfoId !== _dashboard.showExchangesOrderInfoId) {
      this.setState(Object.assign({}, this.state, {
        className: _dashboard.showExchangesOrderInfoId ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          activeTab: 0,
          className: _dashboard.showExchangesOrderInfoId ? 'show in' : 'hide',
        }));
      }, _dashboard.showExchangesOrderInfoId ? 50 : 300);
    }
  }

  openTab(tab) {
    this.setState(Object.assign({}, this.state, {
      activeTab: tab,
    }));

    if (tab === 1 &&
        !this.state.deposit) {
      this.getTransactionElectrum();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this._toggleExchangesOrderInfoModal();
    }
  }

  render() {
    return ExchangesOrderInfoModalRender.call(this);
  }
}

const mapStateToProps = (state, props) => {
  return {
    Dashboard: state.Dashboard,
    provider: props.provider,
  };
};

export default connect(mapStateToProps)(ExchangesOrderInfoModal);