import React from 'react';
import translate from '../../../translate/translate';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-reader';

export const QRModalRender = function() {
  return (
    <span>
      <span
        className="qrcode-modal"
        title={ translate('INDEX.QRCODE') }
        onClick={ this.openModal }>
        <i className="icon fa-qrcode margin-right-5"></i> { translate('DASHBOARD.GENERATE_SM') } { translate('INDEX.QR_CODE') }
      </span>
      <div className={ `modal modal-3d-sign qr-modal ${this.state.className}` }>
        <div className={ `modal-dialog modal-center modal-${this.props.modalSize || 'sm' }` }>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.closeModal }>
                <span>×</span>
              </button>
              <h4 className="modal-title white text-left">
              {
                this.props.title ||
                translate('INDEX.SCAN_QR_CODE')
              }
              </h4>
            </div>
            <div className="modal-body">
              <div
                id={ 'qrModalCanvas' + this.props.content }
                className="page-content vertical-align-middle text-center">
                <QRCode
                  value={ this.props.content }
                  size={ Number(this.props.qrSize) || 198 } />
                <p className="margin-top-10">
                  <a
                    href=""
                    id={ 'saveModalImage' + this.props.content }
                    className="btn btn-success waves-effect waves-light save-image-btn margin-right-10"
                    onClick={ this.saveAsImage }>
                    <i className="icon fa-picture-o"></i>&nbsp;
                    { translate('INDEX.SAVE_AS_IMAGE') }
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </span>
  );
};

export const QRModalReaderRender = function() {
  if (!this.state.errorShown) {
    return (
      <span>
        <button type="button"
          className="btn btn-default"
          onClick={ this.openModal }>
          <i className="icon fa-qrcode"></i>
          { translate('INDEX.SCAN_QR_CODE') }
        </button>
        <div className={ `modal modal-3d-sign qr-modal-reader ${this.state.className}` }>
          <div
            onClick={ this.closeModal }
            className="modal-close-overlay"></div>
            <div className="modal-dialog modal-center modal-md">
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
                  <h4 className="modal-title white text-left">{ translate('INDEX.SCAN_QRCODE_WEBCAM') }</h4>
                </div>
                <div className="modal-body">
                  <div className="page-content vertical-align-middle">
                    { !this.state.error &&
                      this.state.open &&
                      <QrReader
                        delay={ 250 }
                        className="qr-reader-comp"
                        onError={ this.handleError }
                        onScan={ this.handleScan } />
                    }
                    { this.state.error }
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div className={ `modal-backdrop ${this.state.className}` }></div>
      </span>
    );
  } else {
    return null;
  }
};