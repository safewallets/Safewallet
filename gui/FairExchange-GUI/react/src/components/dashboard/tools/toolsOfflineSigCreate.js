import React from 'react';
import translate from '../../../translate/translate';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../../addcoin/addcoinOptionsAC';
import Select from 'react-select';
import {
  triggerToaster,
  copyString,
  apiToolsBalance,
  apiToolsBuildUnsigned,
  apiToolsPushTx,
  apiToolsSeedToWif,
  apiToolsWifToKP,
  apiElectrumListunspent,
  apiCliPromise,
  apiElectrumSplitUtxoPromise,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import QRCode from 'qrcode.react';
import QRModal from '../qrModal/qrModal';
import coinFees from 'agama-wallet-lib/src/fees';
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
import mainWindow, { staticVar } from '../../../util/mainWindow';
import { addressVersionCheck } from 'agama-wallet-lib/src/keys';
import networks from 'agama-wallet-lib/src/bitcoinjs-networks';

// TODO: btc handling

class ToolsOfflineSigCreate extends React.Component {
  constructor() {
    super();
    this.state = {
      sendFrom: '',
      sendTo: '',
      amount: 0,
      selectedCoin: '',
      balance: null,
      tx2qr: null,
      utxo: null,
      rawTx2Push: null,
      txPushResult: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.getBalance = this.getBalance.bind(this);
    this.getUnsignedTx = this.getUnsignedTx.bind(this);
    this.setSendAmountAll = this.setSendAmountAll.bind(this);
    this.closeQr = this.closeQr.bind(this);
    this.copyTx = this.copyTx.bind(this);
    this.validateSendFormData = this.validateSendFormData.bind(this);
  }

  validateSendFormData() {
    const _coin = this.state.selectedCoin.split('|')[0];
    const _mode = 'spv';
    let valid = true;

    if (_mode === 'spv') {
      const _customFee = toSats(this.state.fee);
      const _amount = this.state.amount;
      const _amountSats = Math.floor(toSats(this.state.amount));
      const _balanceSats = this.state.balance.balanceSats + this.state.balance.unconfirmedSats;
      let _fees = staticVar.spvFees;
      _fees.BTC = 0;

      if (Number(_amountSats) + (_customFee || _fees[_coin]) > _balanceSats) {
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
    }

    const _validateAddress = (type) => {
      let _validateAddress;
      let _msg;
  
      _validateAddress = addressVersionCheck(networks[_coin.toLowerCase()] || networks.kmd, this.state[type]);
  
      if (_validateAddress === 'Invalid pub address' ||
          !_validateAddress) {
        _msg = `${this.state[type]} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P1')} ${_coin} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P2')}`;
      }
  
      if (_msg) {
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

    if (this.state.sendFrom) {
      _validateAddress('sendFrom');
    }

    if (this.state.sendTo) {
      _validateAddress('sendTo');
    }

    if (this.state.amount &&
        !isPositiveNumber(this.state.amount)) {
      Store.dispatch(
        triggerToaster(
          translate('SEND.AMOUNT_POSITIVE_NUMBER'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    return valid;
  }

  copyTx() {
    Store.dispatch(copyString(this.state.tx2qr, translate('TOOLS.UNSIGNED_TX_COPIED')));
  }

  setSendAmountAll() {
    const _coin = this.state.selectedCoin.split('|')[0];

    this.setState({
      amount: this.state.balance.balance - fromSats(staticVar.spvFees[_coin]),
    });
  }

  getBalance() {
    const _coin = this.state.selectedCoin.split('|');

    apiToolsBalance(
      _coin[0],
      this.state.sendFrom
    )
    .then((res) => {
      if (res.msg === 'success') {
        this.setState({
          balance: res.result,
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            translate('TOOLS.ERR_OFFLINE_TX_SIG'),
            'error'
          )
        );
      }
    });
  }

  getUnsignedTx() {
    if (this.validateSendFormData()) {
      const _coin = this.state.selectedCoin.split('|');

      apiToolsBuildUnsigned(
        _coin[0],
        toSats(this.state.amount),
        this.state.sendTo,
        this.state.sendFrom
      )
      .then((res) => {
        if (res.msg === 'success') {
          res.result.coin = _coin[0].toLowerCase();
          res.result.from = this.state.sendFrom;

          this.setState({
            tx2qr: JSON.stringify(res.result),
            utxo: res.result.utxoSet,
          });
        } else {
          Store.dispatch(
            triggerToaster(
              res.result,
              translate('TOOLS.ERR_OFFLINE_TX_SIG'),
              'error'
            )
          );
        }
      });
    }
  }

  closeQr() {
    this.setState({
      tx2qr: null,
    });
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

  updateSelectedCoin(e, propName) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      this.setState({
        [propName]: e.value,
      });
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <div className="row margin-left-10">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.OFFLINE_TX_SIG') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-70">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.COIN') }
          </label>
          <Select
            name="selectedCoin"
            className="col-sm-3"
            value={ this.state.selectedCoin }
            onChange={ (event) => this.updateSelectedCoin(event, 'selectedCoin') }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={
              addCoinOptionsCrypto('skip', true, false)
              .concat(addCoinOptionsAC('skip'))
            } />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('INDEX.SEND_FROM') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="sendFrom"
            onChange={ this.updateInput }
            value={ this.state.sendFrom }
            id="kmdWalletSendTo"
            placeholder={ translate('SEND.ENTER_ADDRESS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.getBalance }
            disabled={ !this.state.sendFrom }>
            { translate('TOOLS.GET_BALANCE') }
          </button>
          { this.state.balance &&
            <label className="margin-left-20">
            { translate('TOOLS.BALANCE') }: { this.state.balance.balance }
            </label>
          }
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('INDEX.SEND_TO') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="sendTo"
            onChange={ this.updateInput }
            value={ this.state.sendTo }
            id="kmdWalletSendTo"
            placeholder={ translate('SEND.ENTER_ADDRESS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletAmount">
            { translate('INDEX.AMOUNT') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3"
            name="amount"
            value={ this.state.amount }
            onChange={ this.updateInput }
            id="kmdWalletAmount"
            placeholder="0.000"
            autoComplete="off" />
          { this.state.balance &&
            this.state.balance.balance > 0 &&
            <button
              type="button"
              className="btn btn-default btn-send-self-offlinesig"
              onClick={ this.setSendAmountAll }>
              { translate('SEND.ALL') }
            </button>
          }
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <button
            type="button"
            className="btn btn-primary col-sm-2"
            onClick={ this.getUnsignedTx }
            disabled={
              !this.state.balance ||
              !this.state.sendFrom ||
              !this.state.sendTo ||
              !this.state.selectedCoin ||
              !this.state.amount
            }>
            { translate('TOOLS.GENERATE_UNSIGNED_TX') }
          </button>
        </div>
        { this.state.tx2qr &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
            <label className="control-label col-sm-3 no-padding-left">
              { translate('TOOLS.UNSIGNED_TX') }
            </label>
          </div>
        }
        { this.state.tx2qr &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            <textarea
              rows="5"
              cols="20"
              className="col-sm-7"
              value={ this.state.tx2qr }></textarea>
            <button
              className="btn btn-default btn-xs clipboard-edexaddr margin-left-20"
              title={ translate('INDEX.COPY_TO_CLIPBOARD') }
              onClick={ this.copyTx }>
              <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
            </button>
          </div>
        }
      </div>
    );
  }
}

export default ToolsOfflineSigCreate;