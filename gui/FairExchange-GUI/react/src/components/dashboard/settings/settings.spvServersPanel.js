import React from 'react';
import translate from '../../../translate/translate';
import { connect } from 'react-redux';
import {
  apiElectrumCheckServerConnection,
  apiElectrumSetServer,
  apiElectrumCoins,
  electrumServerChanged,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';

class SPVServersPanel extends React.Component {
  constructor() {
    super();
    this.updateInput = this.updateInput.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.Dashboard &&
        props.Dashboard.activeSection !== 'settings') {
      this.setState(Object.assign({}, this.state, {
        keys: null,
      }));
    }
  }

  setElectrumServer(coin) {
    const _propsServer = this.props.Dashboard.electrumCoins[coin].server;
    let _server = [
      _propsServer.ip,
      _propsServer.port,
      _propsServer.proto
    ];

    if (this.state &&
        this.state[coin]) {
      _server = this.state[coin].split(':');
    }

    apiElectrumCheckServerConnection(
      _server[0],
      _server[1],
      _server[2]
    )
    .then((res) => {
      const __server = `${_server[0]}:${_server[1]}:${_server[2]}`;

      if (res.result) {
        apiElectrumSetServer(
          coin,
          _server[0],
          _server[1],
          _server[2]
        )
        .then((serverSetRes) => {
          Store.dispatch(
            triggerToaster(
              `${coin} ${translate('SETTINGS.SPV_SERVER_SET_TO')} ${__server}`,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'success'
            )
          );
          Store.dispatch(electrumServerChanged(true));
          Store.dispatch(apiElectrumCoins());
        });
      } else {
        Store.dispatch(
          triggerToaster(
            `${coin} ${translate('SETTINGS.SPV_SERVER')} ${__server} ${translate('SETTINGS.IS_UNREACHABLE')}!`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
      }
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderServerListSelectorOptions(coin) {
    let _items = [];
    let _spvServers = this.props.Dashboard.electrumCoins[coin].serverList;

    for (let i = 0; i < _spvServers.length; i++) {
      _items.push(
        <option
          key={ `spv-server-list-${ coin }-${i}` }
          value={ `${_spvServers[i]}` }>
          { `${_spvServers[i]}` }
        </option>
      );
    }

    return _items;
  }

  renderServerList() {
    let _items = [];
    let _spvCoins = this.props.Main.coins.spv;

    _spvCoins.sort();

    for (let i = 0; i < _spvCoins.length; i++) {
      const _electrumCoin = this.props.Dashboard.electrumCoins[_spvCoins[i]];
      
      if (_electrumCoin &&
          _electrumCoin.serverList &&
          _electrumCoin.serverList !== 'none') {
        const _server = `${_electrumCoin.server.ip}:${_electrumCoin.server.port}:${_electrumCoin.server.proto}`;

        _items.push(
          <div
            className={ 'row' + (_spvCoins.length > 1 ? ' padding-bottom-30' : '') }
            key={ `spv-server-list-${ _spvCoins[i] }` }>
            <div className="col-sm-12">
              <strong className="col-sm-1">{ _spvCoins[i] }</strong>
              <div className="col-sm-3">
                <select
                  className="form-control form-material"
                  name={ _spvCoins[i] }
                  value={ (this.state && this.state[_spvCoins[i]]) || _server }
                  onChange={ (event) => this.updateInput(event) }
                  autoFocus>
                  { this.renderServerListSelectorOptions(_spvCoins[i]) }
                </select>
              </div>
              <div className="col-sm-1">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={ () => this.setElectrumServer(_spvCoins[i]) }>
                  OK
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    return _items;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 padding-bottom-30">
            <p>{ translate('SETTINGS.SPV_SERVER_LIST_DESC') }</p>
          </div>
        </div>
        { this.renderServerList() }
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
    Dashboard: state.Dashboard,
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(SPVServersPanel);