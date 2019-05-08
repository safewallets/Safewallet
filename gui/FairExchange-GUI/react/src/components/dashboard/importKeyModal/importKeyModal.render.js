import React from 'react';
import translate from '../../../translate/translate';
import ReactTooltip from 'react-tooltip';
import mainWindow, { staticVar } from '../../../util/mainWindow';

const ImportKeyModalRender = function() {
  return (
    <span>
      <div className={ `modal modal-import-key modal-3d-sign ${this.state.className}` }>
        <div
          onClick={ this.closeModal }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-sm">
          <div
            onClick={ this.closeModal }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.closeModal }>
                <span>×</span>
              </button>
              <h4 className="modal-title white text-left">{ translate('IMPORT_KEY.IMPORT_KEY') }</h4>
            </div>
            <div className="modal-body">
              { (this.props.ActiveCoin.coin === 'KMD' ||
                (staticVar.chainParams &&
                  staticVar.chainParams[this.props.ActiveCoin.coin] &&
                 !staticVar.chainParams[this.props.ActiveCoin.coin].ac_private)) &&
                <div>
                  <div className="padding-bottom-40">
                    { translate('IMPORT_KEY.TWO_FORMS_BELOW_P1') }&nbsp;
                    <strong>Iguana Core / ICO / BarterDEX</strong>&nbsp;
                    { translate('IMPORT_KEY.TWO_FORMS_BELOW_P2') }&nbsp;
                    <strong>WIF ({ translate('IMPORT_KEY.WIF_DESC') })</strong>&nbsp;
                    { translate('IMPORT_KEY.TWO_FORMS_BELOW_P3') }.
                  </div>
                  <div>
                    <strong>{ translate('IMPORT_KEY.PASSPHRASE') }</strong>
                    <p className="margin-top-10">
                      <strong>{ translate('IMPORT_KEY.NOTICE') }:</strong>&nbsp;
                      { translate('IMPORT_KEY.NOTICE_DESC') }.&nbsp;
                      <span className={ this.props.ActiveCoin.coin === 'KMD' ? '' : 'hide' }>
                      { translate('IMPORT_KEY.KMD_RESCAN_WARNING_TIME') }.
                      </span>
                    </p>
                    <div
                      className="wifkeys-form"
                      autoComplete="off">
                      <div className="form-group form-material floating">
                        <input
                          autoComplete="off"
                          type="password"
                          className={ !this.state.seedInputVisibility ? 'form-control' : 'hide' }
                          name="wifkeysPassphrase"
                          id="wifkeysPassphrase"
                          ref="wifkeysPassphrase"
                          onChange={ this.updateInput }
                          value={ this.state.wifkeysPassphrase } />
                        <div className={ this.state.seedInputVisibility ? 'form-control seed-reveal selectable blur' : 'hide' }>
                          { this.state.wifkeysPassphrase || '' }
                        </div>
                        <i
                          className={ 'seed-toggle fa fa-eye' + (!this.state.seedInputVisibility ? '-slash' : '') }
                          onClick={ this.toggleSeedInputVisibility }></i>
                        <label
                          className="floating-label"
                          htmlFor="wifkeysPassphrase">{ translate('INDEX.PASSPHRASE') }</label>
                        { this.state.seedExtraSpaces &&
                          <i className="icon fa-warning seed-extra-spaces-warning"
                            data-tip={ translate('LOGIN.SEED_TRAILING_CHARS') }
                            data-html={ true }
                            data-for="importKey1"></i>
                        }
                        <ReactTooltip
                          id="importKey1"
                          effect="solid"
                          className="text-left" />
                      </div>
                      <div className="text-align-center">
                        <button
                          type="button"
                          className="btn btn-primary waves-effect waves-light margin-right-20"
                          onClick={ this.importFromPassphrase }>
                          { translate('IMPORT_KEY.IMPORT') }
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary waves-effect waves-light"
                          onClick={ this.showPassphraseAddress }>
                          { translate('IMPORT_KEY.SHOW_ADDRESS_AND_WIF') }
                        </button>
                      </div>
                    </div>
                    { this.state.passphraseAddress &&
                      this.state.passphraseWif &&
                      <div className="margin-top-60">
                        <p>
                          <strong>{ translate('IMPORT_KEY.ADDRESS') }: </strong> <span className="selectable">{ this.state.passphraseAddress }</span>
                          <button
                            className="btn btn-default btn-xs clipboard-edexaddr copy-string-btn"
                            title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                            onClick={ () => this._copyCoinAddress(this.state.passphraseAddress) }>
                            <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
                          </button>
                        </p>
                        <p>
                          <strong>WIF: </strong> <span className="selectable">{ this.state.passphraseWif }</span>
                          <button
                            className="btn btn-default btn-xs clipboard-edexaddr copy-string-btn"
                            title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                            onClick={ () => this._copyCoinAddress(this.state.passphraseWif) }>
                            <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
                          </button>
                        </p>
                      </div>
                    }
                  </div>
                  <div className="line">{ translate('IMPORT_KEY.OR') }</div>
                </div>
              }
              <div>
                <strong>WIF ({ translate('IMPORT_KEY.WIF_DESC') })</strong>
                <div className="toggle-box padding-top-20">
                  <span className="pointer">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={ this.state.importWithRescan }
                        readOnly />
                      <div
                        className="slider"
                        onClick={ this.toggleImportWithRescan }></div>
                    </label>
                    <div
                      className="toggle-label"
                      onClick={ this.toggleImportWithRescan }>
                      { translate('IMPORT_KEY.TRIGGER_RESCAN') }
                      <i
                        className="icon fa-question-circle settings-help"
                        data-tip={ translate('IMPORT_KEY.RESCAN_TIP') }
                        data-for="importKey2"></i>
                      <ReactTooltip
                        id="importKey2"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </span>
                </div>
                <div className="toggle-box padding-top-20">
                  <span className="pointer">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={ this.state.importMulti }
                        readOnly />
                      <div
                        className="slider"
                        onClick={ this.toggleImportMulti }></div>
                    </label>
                    <div
                      className="toggle-label"
                      onClick={ this.toggleImportMulti }>
                      { translate('IMPORT_KEY.IMPORT_MULTI_KEYS') }
                      <i
                        className="icon fa-question-circle settings-help"
                        data-tip={ translate('IMPORT_KEY.IMPORT_MULTI_KEYS_DESC') }
                        data-for="importKey3"></i>
                      <ReactTooltip
                        id="importKey3"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </span>
                </div>
                <div className={ !this.state.importMulti ? 'margin-top-20' : 'hide' }>
                  <label
                    htmlFor="wif"
                    className="bold">
                    { translate('IMPORT_KEY.WIF_KEY') }
                  </label>
                  <div className="form-group form-material">
                    <input
                      autoComplete="off"
                      type={ !this.state.wifInputVisibility ? 'password' : 'text' }
                      className="form-control"
                      name="wif"
                      id="wif"
                      ref="wif"
                      onChange={ this.updateInput }
                      value={ this.state.wif } />
                    <i
                      className={ 'seed-toggle fa fa-eye' + (!this.state.wifInputVisibility ? '-slash' : '') }
                      onClick={ this.toggleWifInputVisibility }></i>
                  </div>
                </div>
                <div className={ this.state.importMulti ? 'margin-top-20' : 'hide' }>
                  <label
                    htmlFor="multipleWif"
                    className="bold">
                    { translate('IMPORT_KEY.KEYS_SEPARATED_BY_LINE') }
                  </label>
                  <div className="form-group form-material">
                    <textarea
                      autoComplete="off"
                      className="form-control"
                      name="multipleWif"
                      id="multipleWif"
                      ref="multipleWif"
                      rows="5"
                      onChange={ this.updateInput }
                      value={ this.state.multipleWif } />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary waves-effect waves-light margin-top-10"
                  onClick={ this.importFromWif }>
                  { translate('IMPORT_KEY.' + (this.state.importWithRescan ? 'IMPORT_AND_RESCAN' : 'IMPORT')) }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </span>
  );
};

export default ImportKeyModalRender;