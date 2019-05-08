import React from 'react';
import { connect } from 'react-redux';
import DashboardRender from './dashboard.render';
import {
  toggleZcparamsFetchModal,
  triggerToaster,
} from '../../../actions/actionCreators';
import zcashParamsCheckErrors from '../../../util/zcashParams';
import Store from '../../../store';
import mainWindow from '../../../util/mainWindow';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      zcashParamsVerifyTriggered: false,
    };
    this.renderDashboard = this.renderDashboard.bind(this);
    this.verifyZcashParams = this.verifyZcashParams.bind(this);
  }

  verifyZcashParams() {
    if (!this.state.zcashParamsVerifyTriggered) {
      const _res = mainWindow.zcashParamsExist;
      const _errors = zcashParamsCheckErrors(_res);

      if (_errors) {
        Store.dispatch(
          triggerToaster(
            _errors,
            'Komodo',
            'error',
            false
          )
        );

        Store.dispatch(toggleZcparamsFetchModal(true));
      }
    } else {
      this.setState({
        zcashParamsVerifyTriggered: false,
      });
    }
  }

  componentWillReceiveProps() {
    const _main = this.props.Main;

    if (_main &&
        _main.coins &&
        _main.coins.native &&
        _main.coins.native.length &&
        !this.props.Dashboard.displayZcparamsModal) {
      this.setState({
        zcashParamsVerifyTriggered: true,
      });
      this.verifyZcashParams();
    }
  }

  isSectionActive(section) {
    return this.props.Dashboard.activeSection === section;
  }

  renderDashboard() {
    document.body.className = '';

    return DashboardRender.call(this);
  }

  displayDashboard() {
    const _main = this.props.Main;

    return this.props &&
      (_main &&
       _main.coins &&
       _main.coins.native &&
       _main.coins.native.length &&
       !_main.coins.spv.length &&
       !_main.coins.eth.length) ||
      (_main &&
       _main.coins &&
       _main.coins.spv &&
       _main.coins.spv.length &&
       _main.isLoggedIn) ||
      (_main &&
       _main.coins &&
       _main.coins.native &&
       _main.coins.native.length &&
       !_main.coins.spv.length &&
       !_main.coins.eth.length &&
       _main.isLoggedIn) ||
      (_main &&
       _main.coins &&
       _main.coins.eth &&
       _main.coins.eth.length &&
       _main.isLoggedIn);
  }

  render() {
    if (this.displayDashboard()) {
      return this.renderDashboard();
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
    },
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(Dashboard);