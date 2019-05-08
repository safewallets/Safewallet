import React from 'react';
import Store from '../../../store';
import translate from '../../../translate/translate';
import {
  QRModalRender,
  QRModalReaderRender,
} from './qrModal.render';

class QRModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      error: null,
      errorShown: false,
      className: 'hide',
    };
    this.mounted = false;
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
    this.saveAsImage = this.saveAsImage.bind(this);
  }

  handleScan(data) {
    if (data !== null) {
      if (this.props.mode === 'scan') {
        this.props.setRecieverFromScan(data);
      }

      this.closeModal();
    }
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.setState(Object.assign({}, this.state, {
      open: false,
      className: 'hide',
    }));

    this.mounted = false;
  }

  handleError(err) {
    if (this.mounted) {
      this.setState({
        error: translate('DASHBOARD.' + (err.name === 'NoVideoInputDevicesError' ? 'QR_ERR_NO_VIDEO_DEVICE' : 'QR_ERR_UNKNOWN')),
      });
    }
  }

  openModal() {
    this.setState({
      className: 'show fade',
    });

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        open: true,
        className: 'show in',
      }));
    }, 50); 
  }

  closeModal() {
    this.setState({
      className: 'show out',
    });

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        errorShown: this.state.error ? true : false,
        open: false,
        className: 'hide',
      }));

      if (this.props.cbOnClose) {
        this.props.cbOnClose();
      }
    }, 300);
  }

  saveAsImage(e) {
    const qrCanvas = document.getElementById('qrModalCanvas' + this.props.content);
    const canvas = qrCanvas.getElementsByTagName('canvas');
    const dataURL = canvas[0].toDataURL();
    const a = document.getElementById('saveModalImage' + this.props.content);

    a.href = dataURL;
    a.download = this.props.fileName || this.props.content;
  }

  render() {
    return this.props.mode === 'scan' ? QRModalReaderRender.call(this) : QRModalRender.call(this);
  }
}

export default QRModal;