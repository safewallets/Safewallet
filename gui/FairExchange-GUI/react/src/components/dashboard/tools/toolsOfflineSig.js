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
import { transaction } from 'agama-wallet-lib/src/transaction-builder';
import networks from 'agama-wallet-lib/src/bitcoinjs-networks';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import { stringToWif } from 'agama-wallet-lib/src/keys';
import { fromSats } from 'agama-wallet-lib/src/utils';

class ToolsOfflineSig extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedCoin: '',
      rawData: '',
      seed: '',
      txSigResult: null,
      parsedDataToSign: null,
      verifyAwait: false,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.signTx = this.signTx.bind(this);
    this.copyTx = this.copyTx.bind(this);
  }

  copyTx() {
    Store.dispatch(copyString(this.state.txSigResult, translate('TOOLS.RAW_TX_COPIED')));
  }

  signTx(sign) {
    const _coin = this.state.selectedCoin.split('|')[0].toLowerCase();
    const _network = networks[_coin] || networks[isKomodoCoin(_coin) ? 'kmd' : _coin];
    let _data = JSON.parse(this.state.rawData);
    _data.from = stringToWif(this.state.seed, _network, true).pub;

    if (!sign) {
      this.setState({
        parsedDataToSign: _data,
        verifyAwait: true,
        txSigResult: null,
      });
    } else {
      const _signedTx = transaction(
        _data.outputAddress,
        _data.changeAddress,
        stringToWif(this.state.seed, _network, true).priv,
        _network,
        _data.utxoSet,
        _data.change,
        _data.value
      );

      this.setState({
        txSigResult: _signedTx,
        verifyAwait: false,
      });
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
          <h4>{ translate('TOOLS.SIGN_RAW_TX') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-50">
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
            { translate('TOOLS.SEED') } / WIF
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="seed"
            onChange={ this.updateInput }
            value={ this.state.seed }
            placeholder={ `${translate('TOOLS.ENTER_A_SEED')} ${translate('TOOLS.OR_WIF')}` }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <textarea
            rows="5"
            cols="20"
            name="rawData"
            className="col-sm-7 no-padding-left"
            placeholder="Raw transaction data to sign"
            onChange={ this.updateInput }
            value={ this.state.rawData }></textarea>
        </div>
        { this.state.parsedDataToSign &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
            <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
              <table className="table table-hover dataTable table-striped">
                <tbody>
                  <tr>
                    <td>
                      <strong>{ translate('INDEX.SEND_FROM') }</strong>
                    </td>
                    <td>
                      { this.state.parsedDataToSign.from }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{ translate('INDEX.SEND_TO') }</strong>
                    </td>
                    <td>
                      { this.state.parsedDataToSign.outputAddress }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{ translate('TOOLS.AMOUNT') }</strong>
                    </td>
                    <td>
                      { fromSats(this.state.parsedDataToSign.value) }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{ translate('TOOLS.FEE') }</strong>
                    </td>
                    <td>
                      { fromSats(this.state.parsedDataToSign.fee) }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{ translate('TOOLS.CHANGE') }</strong>
                    </td>
                    <td>
                      { fromSats(this.state.parsedDataToSign.change) } { translate('TOOLS.TO_SM') } { this.state.parsedDataToSign.changeAddress }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ () => this.signTx(!this.state.verifyAwait ? null : true) }
            disabled={
              !this.state.rawData ||
              !this.state.seed ||
              !this.state.selectedCoin
            }>
            { translate('TOOLS.' +(!this.state.verifyAwait ? 'VERIFY_DATA': 'CONFIRM')) }
          </button>
        </div>
        { this.state.txSigResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
            <strong>{ translate('TOOLS.SIGNED_TX') }:</strong>
            <div className="word-break--all selectable">
              { this.state.txSigResult }
              <button
                className="btn btn-default btn-xs clipboard-edexaddr margin-left-20"
                title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                onClick={ this.copyTx }>
                <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
              </button>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default ToolsOfflineSig;