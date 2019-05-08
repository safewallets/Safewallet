import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import {
  toggleDashboardTxInfoModal,
  getTxDetails,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import WalletsTxInfoRender from './walletsTxInfo.render';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import Config from '../../../config';
import erc20ContractId from 'agama-wallet-lib/src/eth-erc20-contract-id';

const { shell } = window.require('electron');

class WalletsTxInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      txDetails: null,
      rawTxDetails: null,
      className: 'hide',
    };
    this.toggleTxInfoModal = this.toggleTxInfoModal.bind(this);
    this.loadTxDetails = this.loadTxDetails.bind(this);
    this.loadRawTxDetails = this.loadRawTxDetails.bind(this);
  }

  toggleTxInfoModal() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      Store.dispatch(toggleDashboardTxInfoModal(false));

      this.setState(Object.assign({}, this.state, {
        activeTab: 0,
      }));
    }, 300);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  componentWillReceiveProps(nextProps) {
    const _activeCoin = nextProps.ActiveCoin;

    if (this.props.ActiveCoin.mode === 'spv' &&
        _activeCoin &&
        this.props.ActiveCoin.showTransactionInfoTxIndex !== _activeCoin.showTransactionInfoTxIndex) {
      const _activeTab = Config.experimentalFeatures &&
        _activeCoin.showTransactionInfoTxIndex &&
        _activeCoin.showTransactionInfoTxIndex.opreturn &&
        _activeCoin.showTransactionInfoTxIndex.opreturn.kvDecoded ? 4 : 0;
      this.setState(Object.assign({}, this.state, {
        txDetails: _activeCoin.showTransactionInfoTxIndex,
        rawTxDetails: _activeCoin.showTransactionInfoTxIndex,
        activeTab: _activeTab,
        className: _activeCoin.showTransactionInfo ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          className: _activeCoin.showTransactionInfo ? 'show in' : 'hide',
        }));
      }, _activeCoin.showTransactionInfo ? 50 : 300);
    } else if (
      this.props.ActiveCoin.mode === 'eth' &&
      _activeCoin &&
      this.props.ActiveCoin.showTransactionInfoTxIndex !== _activeCoin.showTransactionInfoTxIndex
    ) {
      this.setState(Object.assign({}, this.state, {
        txDetails: _activeCoin.showTransactionInfoTxIndex,
        rawTxDetails: _activeCoin.showTransactionInfoTxIndex,
        activeTab: 0,
        className: _activeCoin.showTransactionInfo ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          className: _activeCoin.showTransactionInfo ? 'show in' : 'hide',
        }));
      }, _activeCoin.showTransactionInfo ? 50 : 300);
    } else {
      if (_activeCoin &&
          _activeCoin.txhistory &&
          _activeCoin.showTransactionInfoTxIndex &&
          _activeCoin.showTransactionInfoTxIndex > -1 &&
          _activeCoin.showTransactionInfoTxIndex !== false) {
        const txInfo = _activeCoin.txhistory[_activeCoin.showTransactionInfoTxIndex];

        if (txInfo &&
            this.props.ActiveCoin.showTransactionInfoTxIndex !== _activeCoin.showTransactionInfoTxIndex) {
          this.loadTxDetails(_activeCoin.coin, txInfo.txid);
          this.loadRawTxDetails(_activeCoin.coin, txInfo.txid);
          this.setState({
            className: _activeCoin.showTransactionInfo ? 'show fade' : 'show out',
          });

          setTimeout(() => {
            this.setState(Object.assign({}, this.state, {
              className: _activeCoin.showTransactionInfo ? 'show in' : 'hide',
            }));
          }, _activeCoin.showTransactionInfo ? 50 : 300);
        }
      }
    }
  }

  loadTxDetails(coin, txid) {
    this.setState(Object.assign({}, this.state, {
      txDetails: null,
    }));

    getTxDetails(coin, txid)
    .then((json) => {
      this.setState(Object.assign({}, this.state, {
        txDetails: json,
      }));
    });
  }

  loadRawTxDetails(coin, txid) {
    getTxDetails(coin, txid, 'raw')
    .then((json) => {
      this.setState(Object.assign({}, this.state, {
        rawTxDetails: json,
      }));
    });
  }

  openTab(tab) {
    this.setState(Object.assign({}, this.state, {
      activeTab: tab,
    }));
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.toggleTxInfoModal();
    }
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

  render() {
    const _activeCoin = this.props.ActiveCoin;

    if (this.props &&
        _activeCoin &&
        _activeCoin.showTransactionInfo &&
        _activeCoin.activeSection === 'default') {
      if (_activeCoin.mode === 'native') {
        if (_activeCoin.txhistory &&
            _activeCoin.showTransactionInfoTxIndex > -1) {
          const txInfo = _activeCoin.txhistory[_activeCoin.showTransactionInfoTxIndex];

          return WalletsTxInfoRender.call(this, txInfo);
        } else {
          return null;
        }
      } else {
        return WalletsTxInfoRender.call(this);
      }
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
      txhistory: state.ActiveCoin.txhistory,
      showTransactionInfo: state.ActiveCoin.showTransactionInfo,
      activeSection: state.ActiveCoin.activeSection,
      activeAddress: state.ActiveCoin.activeAddress,
      showTransactionInfoTxIndex: state.ActiveCoin.showTransactionInfoTxIndex,
    },
  };
};

export default connect(mapStateToProps)(WalletsTxInfo);