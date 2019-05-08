import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { toggleExchangesTOSModal } from '../../../actions/actionCreators';
import Store from '../../../store';
import ExchangesTOSModalRender from './exchangesTOSModal.render';
import Config from '../../../config';

const { shell } = window.require('electron');

class ExchangesTOSModal extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      className: 'hide',
    };
    this.close = this.close.bind(this);
  }

  openCoinswitchTOS() {
    return shell.openExternal('https://coinswitch.co/terms');
  }

  close() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      Store.dispatch(toggleExchangesTOSModal(false));
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const _dashboard = nextProps.Dashboard;

    if (_dashboard.displayExchangesTOSModal !== this.state.open) {
      this.setState(Object.assign({}, this.state, {
        className: _dashboard.displayExchangesTOSModal ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          className: _dashboard.displayExchangesTOSModal ? 'show in' : 'hide',
          open: _dashboard.displayExchangesTOSModal ? true : false,
        }));
      }, _dashboard.displayExchangesTOSModal ? 50 : 300);
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  render() {
    return ExchangesTOSModalRender.call(this);
  }
}

const mapStateToProps = (state, props) => {
  return {
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(ExchangesTOSModal);