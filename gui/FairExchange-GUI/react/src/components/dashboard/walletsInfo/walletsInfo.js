import React from 'react';
import { connect } from 'react-redux';
import WalletsNativeInfoRender from './walletsInfo.render';
import { copyString } from '../../../actions/actionCreators';
import Store from '../../../store';
import translate from '../../../translate/translate';

class WalletsInfo extends React.Component {
  constructor() {
    super();
    this.copyParams = this.copyParams.bind(this);
  }

  copyParams() {
    Store.dispatch(copyString(this.props.coins.params[this.props.ActiveCoin.coin].join(' '), translate('INDEX.LAUNCH_PARAMS_COPIED')));
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        (this.props.ActiveCoin.progress || this.props.Dashboard.electrumCoins) &&
        this.props.ActiveCoin.activeSection === 'settings') {
      return WalletsNativeInfoRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: state.ActiveCoin,
    Dashboard: state.Dashboard,
    coins: state.Main.coins,
  };
};

export default connect(mapStateToProps)(WalletsInfo);