import React from 'react';
import translate from '../../../translate/translate';
import Select from 'react-select';
import {
  triggerToaster,
  apiToolsMultiAddressBalanceCoins,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import kmdexplorer from './kmdexplorer';
import { addressVersionCheck } from 'agama-wallet-lib/src/keys';
import networks from 'agama-wallet-lib/src/bitcoinjs-networks';

const { shell } = window.require('electron');

class ToolsGetBalanceMultiCoins extends React.Component {
  constructor() {
    super();
    this.state = {
      address: '',
      balanceResult: null,
      reqInProgress: false,
    };
    this.updateInput = this.updateInput.bind(this);
    this.getBalance = this.getBalance.bind(this);
    this.openExplorerWindow = this.openExplorerWindow.bind(this);
  }

  openExplorerWindow(coin) {
    const url = `${kmdexplorer[coin]}/address/${this.state.address}`;
    return shell.openExternal(url);
  }

  getBalance() {
    const _validateAddress = addressVersionCheck(networks.kmd, this.state.address);
    let _msg;

    if (_validateAddress === 'Invalid pub address') {
      _msg = _validateAddress;
    } else if (!_validateAddress) {
      _msg = `${this.state.address} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P1')} KMD ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P2')}`;
    }

    if (_msg) {
      Store.dispatch(
        triggerToaster(
          _msg,
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      ); 
    } else {
      this.setState({
        reqInProgress: true,
      });

      apiToolsMultiAddressBalanceCoins(this.state.address)
      .then((res) => {
        console.warn(res);
        this.setState({
          reqInProgress: false,
        });

        if (res.msg === 'success') {
          const balances = res.result.balance;

          if (balances &&
              balances.length) {
            this.setState({
              balanceResult: balances,
            });
          }
        } else {
          Store.dispatch(
            triggerToaster(
              res.result,
              translate('TOOLS.ERR_GET_BALANCE') + ' multi',
              'error'
            )
          );
        }
      });
    }
  }
  
  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderBalances() {
    const balances = this.state.balanceResult;
    let _items = [];

    if (balances &&
        balances.length) {
      let _items = [];
      
      for (let i = 0; i < balances.length; i++) {
        if (balances[i] !== 'error' &&
            (balances[i].balance.confirmed > 0 || balances[i].balance.unconfirmed > 0)) {
          _items.push(
            <tr key={ `balance-${balances[i].coin}` }>
              <td>
                <a
                  target="_blank"
                  onClick={ () => this.openExplorerWindow(balances[i].coin) }
                  className="pointer">
                  <img
                    alt={ balances[i].coin.toLowerCase() }
                    src={ `assets/images/cryptologo/btc/${balances[i].coin.toLowerCase()}.png` } />
                  { balances[i].coin }
                </a>
              </td>
              <td>
                { balances[i].balance.confirmed }
              </td>
              <td>
                { balances[i].balance.unconfirmed !== 0 ? balances[i].balance.unconfirmed : '' }
              </td>
            </tr>
          );
        }
      }
      
      if (_items.length) {
        return (
          <table className="table table-striped dataTable no-footer dtr-inline margin-bottom-40 tools-multicoin-balance">
            <thead>
              <tr>
                <th>{ translate('TOOLS.ASSET') }</th>
                <th>{ translate('TOOLS.BALANCE_CONF') }</th>
                <th>{ translate('TOOLS.BALANCE_UNCONF') }</th>
              </tr>
            </thead>
            <tbody>
              { _items }
            </tbody>
          </table>
        );
      } else {
        return (
          <div className="text-center">{ translate('TOOLS.NOTHING_IS_FOUND') }...</div>
        );
      }
    }
  }

  getOptions() {
    let _items = [{
      label: 'Komodo (KMD)',
      icon: 'btc/KMD',
      value: 'KMD',
    }];

    for (let key in kmdexplorer) {
      _items.push({
        label: `${translate('ASSETCHAINS.' + key)} (${key})`,
        icon: `btc/${key}`,
        value: key,
      });
    }

    return _items;
  }

  render() {
    return (
      <div className="row margin-left-10">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.GET_ASSET_CHAINS_BALANCE') }</h4>
          <div className="margin-top-15">{ translate('TOOLS.REMOTE_CALL_EXPLORER_ACKNOWLEDGEMENT_ATOMIC') }</div>
          <div className="margin-top-15">{ translate('TOOLS.THIS_REQUEST_MIGHT_TAKE_AROUND_1M') }</div>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('WALLETS_INFO.ADDRESS') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="address"
            onChange={ this.updateInput }
            value={ this.state.address }
            placeholder={ translate('TOOLS.ENTER_T_ADDRESS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.getBalance }>
            { translate('TOOLS.BALANCE') }
          </button>
        </div>
        { this.state.reqInProgress &&
          <div className="text-left">{ translate('TOOLS.SEARCHING') }...</div>
        }
        { !this.state.reqInProgress && this.renderBalances() }
      </div>
    );
  }
}

export default ToolsGetBalanceMultiCoins;