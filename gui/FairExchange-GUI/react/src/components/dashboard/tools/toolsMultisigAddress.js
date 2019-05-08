import React from 'react';
import translate from '../../../translate/translate';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../../addcoin/addcoinOptionsAC';
import Select from 'react-select';
import {
  triggerToaster,
  apiToolsBalance,
  apiToolsBuildUnsigned,
  apiToolsPushTx,
  apiToolsSeedToWif,
  apiToolsWifToKP,
  apiElectrumListunspent,
  apiCliPromise,
  apiElectrumSplitUtxoPromise,
  copyString,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow, { staticVar } from '../../../util/mainWindow';

import { multisig } from 'agama-wallet-lib/src/keys';
import networks from 'agama-wallet-lib/src/bitcoinjs-networks';

class ToolsMultisigAddress extends React.Component {
  constructor() {
    super();
    this.state = {
      nOfN: '1-2',
      pubHex: null,
      coin: '',
      msigData: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.generateMsigAddress = this.generateMsigAddress.bind(this);
  }

  _copyString(type) {
    const _msg = {
      'redeemScript': translate('TOOLS.REDEEM_SCRIPT'),
      'scriptPubKey': translate('TOOLS.SCRIPT_PUBKEY'),
      'address': translate('WALLETS_INFO.ADDRESS'),
      'agama': translate('TOOLS.AGAMA_MULTISIG_DATA'),
    };
    Store.dispatch(copyString(this.state.msigData[type], _msg[type] + ' is copied'));
  }

  generateMsigAddress() {
    const _coin = this.state.coin.split('|');
    const _pubKeys = this.state.pubHex.split('\n');
    const _requiredSigs = this.state.nOfN.split('-');

    if (_pubKeys.length < _requiredSigs[1]) {
      Store.dispatch(
        triggerToaster(
          translate('TOOLS.NOT_ENOUGH_PUB_KEYS_PROVIDED'),
          translate('TOOLS.MULTISIG_ADDRESS'),
          'error'
        )
      );
    } else {
      try {
        let _msigAddress = multisig.generate(
          Number(_requiredSigs[0]),
          _pubKeys,
          networks[_coin[0].toLowerCase()] || networks.kmd
        );

        const _messageSecret = mainWindow.sha256(_pubKeys.join('-') + _msigAddress.redeemScript).toString('hex');
        const _messageCID = _messageSecret.substring(_messageSecret.length / 2, Math.floor(_messageSecret.length / 4)) + _messageSecret.substring(0, Math.floor(_messageSecret.length / 4));
        const _agama = {
          redeemScript: _msigAddress.redeemScript,
          scriptPubKey: _msigAddress.scriptPubKey,
          nOfN: this.state.nOfN,
          messageSecret: mainWindow.sha256(_pubKeys.join('-') + _msigAddress.redeemScript).toString('hex'),
          messageCID: _messageCID,
          pubKeys: _pubKeys,
        };
        _msigAddress.agama = JSON.stringify(_agama);

        this.setState({
          msigData: _msigAddress,
        });
      } catch (e) {
        console.warn(e);
        Store.dispatch(
          triggerToaster(
            translate('TOOLS.UNABLE_TO_GEN_MULTISIG_ADDRESS'),
            translate('TOOLS.MULTISIG_ADDRESS'),
            'error'
          )
        );
      }
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
          <h4>{ translate('TOOLS.MULTISIG_ADDRESS_GEN') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-70">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.NUM_OF_SIGS') }
          </label>
          <select
            name="nOfN"
            className="col-sm-3 margin-top-20"
            value={ this.state.nOfN }
            onChange={ this.updateInput }>
            <option value="1-2">1 of 2</option>
            <option value="2-2">2 of 2</option>
            <option value="2-3">2 of 3</option>
            <option value="3-5">3 of 5</option>
          </select>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-70">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.COIN') }
          </label>
          <Select
            name="w2wCoin"
            className="col-sm-3"
            value={ this.state.coin }
            onChange={ (event) => this.updateSelectedCoin(event, 'coin') }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={
              addCoinOptionsCrypto('skip', true, false)
              .concat(addCoinOptionsAC('skip'))
            } />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.PUB_KEYS') }
          </label>
          <textarea
            rows="5"
            cols="20"
            name="pubHex"
            className="col-sm-7 padding-top-10 padding-bottom-10"
            placeholder={ translate('TOOLS.PROVIDE_N_PUBKEYS', this.state.nOfN.split('-')[1]) }
            onChange={ this.updateInput }
            value={ this.state.pubHex }></textarea>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            disabled={
              !this.state.pubHex ||
              !this.state.coin
            }
            onClick={ this.generateMsigAddress }>
            { translate('TOOLS.GEN_MULTISIG_ADDRESS') }
          </button>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <h4>{ translate('TOOLS.PUBKEYS_ORDER_WARNING') }</h4>
        </div>
        { this.state.msigData &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            <div>
              <strong>{ translate('WALLETS_INFO.ADDRESS') }:</strong> <span className="blur selectable">{ this.state.msigData.address }</span>
              <button
                className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                onClick={ () => this._copyString('address') }>
                <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
              </button>
            </div>
            <div className="margin-top-25">
              <strong>{ translate('TOOLS.REDEEM_SCRIPT') }:</strong> <span className="blur selectable word-break--all">{ this.state.msigData.redeemScript }</span>
              <button
                className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                onClick={ () => this._copyString('redeemScript') }>
                <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
              </button>
            </div>
            <div className="margin-top-25">
              <strong>{ translate('TOOLS.SCRIPT_PUB_KEY') }:</strong> <span className="blur selectable">{ this.state.msigData.scriptPubKey }</span>
              <button
                className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                onClick={ () => this._copyString('scriptPubKey') }>
                <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
              </button>
            </div>
            <div className="margin-top-25">
              <strong>{ translate('TOOLS.USE_THE_FOLLOWING_INFO_TO_CREATE_MULTISIG_TX') }:</strong>
              <div className="blur selectable word-break--all">
                { this.state.msigData.agama }
                <button
                  className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                  title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                  onClick={ () => this._copyString('agama') }>
                  <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default ToolsMultisigAddress;