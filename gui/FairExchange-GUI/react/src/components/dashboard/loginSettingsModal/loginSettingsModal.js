import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { toggleLoginSettingsModal } from '../../../actions/actionCreators';
import Store from '../../../store';

import { LoginSettingsModalRender } from './loginSettingsModal.render';

class LoginSettingsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      className: 'hide',
      open: false,
    };
    this.closeLoginSettingsModal = this.closeLoginSettingsModal.bind(this);
  }

  closeLoginSettingsModal() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      Store.dispatch(toggleLoginSettingsModal(false));

      this.setState(Object.assign({}, this.state, {
        className: 'hide',
        open: false,
      }));
    }, 300);
  }

  componentWillReceiveProps(props) {
    const _display = props.Main.displayLoginSettingsModal;

    if (props.Main &&
        _display !== this.state.open) {
      this.setState({
        className: _display ? 'show fade' : 'show out',
      });

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: _display,
          className: _display ? 'show in' : 'hide',
        }));
      }, _display ? 50 : 300);
    }
  }

  render() {
    return LoginSettingsModalRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(LoginSettingsModal);