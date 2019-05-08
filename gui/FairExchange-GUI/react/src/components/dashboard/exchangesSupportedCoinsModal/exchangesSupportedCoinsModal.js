import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { toggleExchangesSupportedCoinsModal } from '../../../actions/actionCreators';
import Store from '../../../store';
import ExchangesSupportedCoinsModalRender from './exchangesSupportedCoinsModal.render';
import Config from '../../../config';

class ExchangesSupportedCoinsModal extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      className: 'hide',
    };
    this.close = this.close.bind(this);
  }

  close() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      Store.dispatch(toggleExchangesSupportedCoinsModal(false));
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const _dashboard = nextProps.Dashboard;

    if (_dashboard.displayExchangesSupportedCoinsModal !== this.state.open) {
      this.setState(Object.assign({}, this.state, {
        className: _dashboard.displayExchangesSupportedCoinsModal ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          className: _dashboard.displayExchangesSupportedCoinsModal ? 'show in' : 'hide',
          open: _dashboard.displayExchangesSupportedCoinsModal ? true : false,
        }));
      }, _dashboard.displayExchangesSupportedCoinsModal ? 50 : 300);
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  render() {
    return ExchangesSupportedCoinsModalRender.call(this);
  }
}

const mapStateToProps = (state, props) => {
  return {
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(ExchangesSupportedCoinsModal);