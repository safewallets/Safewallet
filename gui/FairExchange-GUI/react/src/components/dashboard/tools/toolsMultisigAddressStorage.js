import React from 'react';
import translate from '../../../translate/translate';
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
  encryptPassphrase,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import ReactTooltip from 'react-tooltip';
import { multisig } from 'agama-wallet-lib/src/keys';
import mainWindow, { staticVar } from '../../../util/mainWindow';

class ToolsMultisigAddressStorage extends React.Component {
  constructor() {
    super();
    this.state = {
      encryptKey: '',
      encryptKeyConfirm: '',
      isCustomPinFilename: false,
      customPinFilename: null,
      seed: null,
      msigData: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.toggleCustomPinFilename = this.toggleCustomPinFilename.bind(this);
    this.save = this.save.bind(this);
  }

  save() {
    const enteredSeedsMatch = this.state.randomSeed === this.state.randomSeedConfirm;
    let _multisigData = JSON.parse(this.state.msigData);

    if (this.state.seed) {
      _multisigData.signKey = this.state.seed;
    }
    
    if (!_multisigData.hasOwnProperty('redeemScript') ||
        !_multisigData.hasOwnProperty('scriptPubKey') ||
        !_multisigData.hasOwnProperty('nOfN')) {
      Store.dispatch(
        triggerToaster(
          translate('TOOLS.MALFORMED_MULTISIG_DATA'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
    } else {
      if (this.state.encryptKey !== this.state.encryptKeyConfirm) {
        Store.dispatch(
          triggerToaster(
            translate('LOGIN.ENCRYPTION_KEYS_DONT_MATCH'),
            translate('LOGIN.SEED_ENCRYPT'),
            'error'
          )
        );
      } else {
        if (!this.state.encryptKey ||
            !this.state.encryptKeyConfirm) {
          Store.dispatch(
            triggerToaster(
              translate('LOGIN.ENCRYPTION_KEY_EMPTY'),
              translate('LOGIN.SEED_ENCRYPT'),
              'error'
            )
          );
        } else if (this.state.encryptKey === this.state.encryptKeyConfirm) {
          const seedEncryptionKeyEntropy = mainWindow.checkStringEntropy(this.state.encryptKey);

          if (!seedEncryptionKeyEntropy) {
            Store.dispatch(
              triggerToaster(
                translate('LOGIN.SEED_ENCRYPTION_WEAK_PW'),
                translate('LOGIN.WEAK_PW'),
                'error'
              )
            );
          } else {
            if (this.state.isCustomPinFilename) {
              const _customPinFilenameTest = /^[0-9a-zA-Z-_]+$/g;

              if (this.state.customPinFilename &&
                  _customPinFilenameTest.test(this.state.customPinFilename)) {
                encryptPassphrase(
                  `msig:${JSON.stringify(_multisigData)}`,
                  this.state.encryptKey,
                  false,
                  this.state.customPinFilename,
                )
                .then((res) => {
                  if (res.msg === 'success') {
                    Store.dispatch(
                      triggerToaster(
                        translate('TOOLS.PIN_FILE_SAVED_AS', this.state.customPinFilename),
                        translate('TOOLS.MULTISIG'),
                        'success',
                        false
                      )
                    );
                  } else {
                    Store.dispatch(
                      triggerToaster(
                        res.result,
                        translate('LOGIN.ERR_SEED_STORAGE'),
                        'error'
                      )
                    );
                  }
                });
              } else {
                Store.dispatch(
                  triggerToaster(
                    translate('LOGIN.CUSTOM_PIN_FNAME_INFO'),
                    translate('LOGIN.ERR_SEED_STORAGE'),
                    'error'
                  )
                );
              }
            } else {
              const pinFilename = multisig.redeemScriptToPubAddress(_multisigData.scriptPubKey);

              encryptPassphrase(
                `msig:${JSON.stringify(_multisigData)}`,
                this.state.encryptKey,
                false,
                pinFilename,
              )
              .then((res) => {
                if (res.msg === 'success') {
                  Store.dispatch(
                    triggerToaster(
                      translate('TOOLS.PIN_FILE_SAVED_AS', this.state.customPinFilename),
                      translate('TOOLS.MULTISIG'),
                      'success',
                      false
                    )
                  );
                } else {
                  Store.dispatch(
                    triggerToaster(
                      res.result,
                      translate('LOGIN.ERR_SEED_STORAGE'),
                      'error'
                    )
                  );
                }
              });
            }
          }
        }
      }
    }
  }

  toggleCustomPinFilename() {
    this.setState({
      isCustomPinFilename: !this.state.isCustomPinFilename,
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <div className="row margin-left-10 tools-multisig-storage">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.MULTISIG_STORAGE') }</h4>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.MULTISIG_DATA') }
          </label>
          <textarea
            rows="5"
            cols="20"
            className="col-sm-7"
            onChange={ this.updateInput }
            name="msigData"
            placeholder={ translate('TOOLS.PROVIDE_AGAMA_MULTISIG_DATA_HERE') }
            value={ this.state.msigData }></textarea>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.SEED_WIF_OPTIONAL') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="seed"
            onChange={ this.updateInput }
            value={ this.state.seed }
            id="kmdWalletSendTo"
            placeholder={ `${translate('TOOLS.ENTER_A_SEED')} ${translate('TOOLS.OR_WIF')}` }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="encryptKey">
            { translate('LOGIN.SEED_ENCRYPT_KEY') }
          </label>
          <input
            type="text"
            name="encryptKey"
            ref="encryptKey"
            className="form-control col-sm-3 blur"
            onChange={ this.updateInput }
            autoComplete="off"
            value={ this.state.encryptKey || '' } />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="encryptKeyConfirm">
            { translate('LOGIN.SEED_ENCRYPT_KEY_CONFIRM') }
          </label>
          <input
            type="text"
            name="encryptKeyConfirm"
            ref="encryptKeyConfirm"
            className="form-control col-sm-3 blur"
            onChange={ this.updateInput }
            autoComplete="off"
            value={ this.state.encryptKeyConfirm || '' } />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <div className="toggle-box text-left">
            <span className="pointer">
              <label className="switch">
                <input
                  type="checkbox"
                  readOnly
                  checked={ this.state.isCustomPinFilename } />
                <div
                  className="slider"
                  onClick={ this.toggleCustomPinFilename }></div>
              </label>
              <div
                className="toggle-label"
                onClick={ this.toggleCustomPinFilename }>
                { translate('LOGIN.CUSTOM_PIN_FNAME') }
              </div>
            </span>
            <i
              className="icon fa-question-circle login-help"
              data-tip={ translate('LOGIN.CUSTOM_PIN_FNAME_INFO') }
              data-html={ true }
              data-for="login5"></i>
            <ReactTooltip
              id="login5"
              effect="solid"
              className="text-left" />
          </div>
        </div>
        { this.state.isCustomPinFilename &&
          <div className="col-sm-12 form-group form-material no-padding-left">
            <label
              className="control-label col-sm-2 no-padding-left"
              htmlFor="customPinFilename">
              { translate('LOGIN.CUSTOM_PIN_FNAME') }
            </label>
            <input
              type="text"
              name="customPinFilename"
              ref="customPinFilename"
              className="form-control col-sm-3 blur"
              onChange={ this.updateInput }
              autoComplete="off"
              value={ this.state.customPinFilename || '' } />
          </div>
        }
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
          <button
            type="button"
            className="btn btn-primary col-sm-2"
            onClick={ this.save }
            disabled={
              !this.state.msigData ||
              !this.state.encryptKey ||
              !this.state.encryptKeyConfirm
            }>
            { translate('SETTINGS.SAVE') }
          </button>
        </div>
      </div>
    );
  }
}

export default ToolsMultisigAddressStorage;