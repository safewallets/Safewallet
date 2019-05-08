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
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import devlog from '../../../util/devlog';

const { shell } = window.require('electron');

class ToolsTxPush extends React.Component {
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
    this.sendTx = this.sendTx.bind(this);
    this.copyTx = this.copyTx.bind(this);
  }

  copyTx() {
    Store.dispatch(copyString(this.state.txSigResult, translate('TOOLS.TXID_COPIED')));
  }

  sendTx() {
    apiToolsPushTx(this.state.selectedCoin.split('|')[0].toLowerCase(), this.state.rawTx2Push)
    .then((res) => {
      devlog(res);

      this.setState({
        txPushResult: res.result,
      });
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

  openExplorerWindow(txid) {
    const _coin = this.state.selectedCoin.split('|')[0].toUpperCase();
    const url = explorerList[_coin].split('/').length - 1 > 2 ? `${explorerList[_coin]}${txid}` : `${explorerList[_coin]}/tx/${txid}`;      
    return shell.openExternal(url);
  }

  render() {
    return (
      <div className="row margin-left-10">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.PUSH_RAW_TX') }</h4>
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
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <textarea
            rows="5"
            cols="20"
            name="rawTx2Push"
            className="col-sm-7 no-padding-left"
            placeholder={ translate('TOOLS.TX_TO_PUSH') }
            onChange={ this.updateInput }
            value={ this.state.rawTx2Push }></textarea>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.sendTx }>
            { translate('TOOLS.PUSH') }
          </button>
        </div>
        { this.state.txPushResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
            { this.state.txPushResult.length === 64 &&
              <div>
                <div className="margin-bottom-15">
                  { this.state.selectedCoin.split('|')[0].toUpperCase() } { translate('TOOLS.TX_PUSHED') }!
                </div>
                <div>
                  { translate('KMD_NATIVE.TXID') }:
                  <div className="blur selectable word-break--all margin-left-5">
                    { this.state.txPushResult }
                    <button
                      className="btn btn-default btn-xs clipboard-edexaddr margin-left-20"
                      title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                      onClick={ this.copyTx }>
                      <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
                    </button>
                  </div>
                  <div className="margin-top-10">
                    <button
                      type="button"
                      className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                      onClick={ () => this.openExplorerWindow(this.state.txPushResult) }>
                      <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', this.state.selectedCoin.split('|')[0].toUpperCase()) }
                    </button>
                  </div>
                </div>
              </div>
            }
            { this.state.txPushResult.length !== 64 &&
              <div>
                <strong>{ translate('TOOLS.ERROR') }:</strong>
                <div className="selectable word-break--all">{ JSON.stringify(this.state.txPushResult) }</div>
              </div>
            }
          </div>
        }
      </div>
    );
  }
}

export default ToolsTxPush;