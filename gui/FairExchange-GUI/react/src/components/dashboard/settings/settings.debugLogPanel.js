import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import Config from '../../../config';
import { coindList } from '../../../util/coinHelper';
import {
  getDebugLog,
  getRuntimeLog,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import { secondsToString } from 'agama-wallet-lib/src/time';

// TODO: figure out a way to show app debug, url?

class DebugLogPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      appRuntimeLog: [],
      debugLinesCount: 10,
      debugTarget: 'none',
      toggleAppRuntimeLog: false,
      pristine: true,
      runtimeInProgress: false,
    };
    this.readDebugLog = this.readDebugLog.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.getAppRuntimeLog = this.getAppRuntimeLog.bind(this);
    this.toggleAppRuntimeLog = this.toggleAppRuntimeLog.bind(this);
    this.renderAppRuntimeLog = this.renderAppRuntimeLog.bind(this);
    this.checkInputVals = this.checkInputVals.bind(this);
    this.getDebugLogDump = this.getDebugLogDump.bind(this);
  }

  getDebugLogDump() {
    this.setState({
      runtimeInProgress: true,
    });

    getRuntimeLog()
    .then((res) => {
      const a = document.getElementById('debugLogDumpLink');
      
      a.download = 'agama-debug.log';
      a.href = 'data:text/plain;charset=UTF-8,' + res;

      this.setState({
        runtimeInProgress: false,
      });
    });
  }

  readDebugLog() {
    let _target = this.state.debugTarget;

    if (_target === 'Komodo') {
      _target = null;
    }

    this.setState(Object.assign({}, this.state, {
      pristine: false,
    }));

    Store.dispatch(
      getDebugLog(
        'komodo',
        this.state.debugLinesCount,
        _target
      )
    );
  }

  renderAppRuntimeLog() {
    const _appRuntimeLog = this.state.appRuntimeLog;
    let _items = [];

    for (let i = 0; i < _appRuntimeLog.length; i++) {
      _items.push(
        <p key={ `app-runtime-log-entry-${i}` }>
          <span>{ secondsToString(_appRuntimeLog[i].time, true) }</span>
          <span className="padding-left-30">
          { typeof _appRuntimeLog[i].msg === 'string' ? _appRuntimeLog[i].msg : JSON.stringify(_appRuntimeLog[i].msg, null, '') }
          </span>
        </p>
      );
    }

    return _items;
  }

  toggleAppRuntimeLog() {
    this.setState(Object.assign({}, this.state, {
      toggleAppRuntimeLog: !this.state.toggleAppRuntimeLog,
    }));

    this.getAppRuntimeLog();
  }

  getAppRuntimeLog() {
    const _appRuntimeLog = mainWindow.getAppRuntimeLog;

    _appRuntimeLog()
    .then((json) => {
      this.setState(Object.assign({}, this.state, {
        appRuntimeLog: json,
      }));
    });
  }

  renderDebugLogData() {
    const _debugLog = this.props.Settings.debugLog;

    if (_debugLog &&
        !this.state.pristine) {
      const _debugLogDataRows = _debugLog.split('\n');
      let _items = [];

      if (_debugLogDataRows &&
          _debugLogDataRows.length &&
          _debugLog.indexOf('ENOENT') === -1) {
        for (let i = 0; i < _debugLogDataRows.length; i++) {
          _items.push(
            <div
              key={ `settings-debuglog-${Math.random(0, 9) * 10}` }
              className="padding-bottom-5">
              { _debugLogDataRows[i] }
            </div>
          );
        }
        
        return _items;
      } else {
        return (
          <span>{ translate('INDEX.EMPTY_DEBUG_LOG') }</span>
        );
      }
    } else {
      return null;
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderCoinListSelectorOptions() {
    let _items = [];
    let _nativeCoins = coindList();

    _nativeCoins.sort();

    _items.push(
      <option
        key="coind-walletdat-coins-none"
        value="none">
        { translate('SETTINGS.PICK_A_COIN') }
      </option>
    );

    for (let i = 0; i < _nativeCoins.length; i++) {
      if (_nativeCoins[i] === 'KMD') {
        _nativeCoins[i] = 'Komodo';
      }

      _items.push(
        <option
          key={ `coind-debuglog-coins-${ _nativeCoins[i] }` }
          value={ `${_nativeCoins[i]}` }>
          { `${_nativeCoins[i]}` }
        </option>
      );
    }

    return _items;
  }

  checkInputVals() {
    const _debugLinesCount = this.state.debugLinesCount;

    if (!Number(_debugLinesCount) ||
        Number(_debugLinesCount) < 1 ||
        !_debugLinesCount ||
        this.state.debugTarget === 'none') {
      return true;
    }
  }

  render() {
    const _coins = this.props.Main.coins;

    return (
      <div className="row">
        <div className="col-sm-12">
          <div className="padding-bottom-15">
            <strong>{ translate('SETTINGS.PRIVACY_WARNING_P1') }</strong> { translate('SETTINGS.PRIVACY_WARNING_P2') }<br/>{ translate('SETTINGS.PRIVACY_WARNING_P3') }
          </div>
          <a id="debugLogDumpLink">
            <button
              type="button"
              className="btn btn-info waves-effect waves-light"
              onClick={ this.getDebugLogDump }>
              { this.state.runtimeInProgress ? `${translate('SETTINGS.PLEASE_WAIT')}` : translate('SETTINGS.GET_DEBUG_DUMP') }
            </button>
          </a>
          { _coins &&
            _coins.native &&
            Object.keys(_coins.native).length > 0 &&
            <p>{ translate('INDEX.DEBUG_LOG_DESC') }</p>
          }
          <div className="margin-top-30">
            <span className="pointer toggle hide">
              <label className="switch">
                <input
                  type="checkbox"
                  name="settings-app-debug-toggle"
                  value={ this.state.toggleAppRuntimeLog }
                  checked={ this.state.toggleAppRuntimeLog }
                  readOnly />
                <div
                  className="slider"
                  onClick={ this.toggleAppRuntimeLog }></div>
              </label>
              <span
                className="title"
                onClick={ this.toggleAppRuntimeLog }>
                { translate('SETTINGS.SHOW_APP_RUNTIME_LOG') }
              </span>
            </span>
          </div>
          { !this.state.toggleAppRuntimeLog &&
            _coins &&
            _coins.native &&
            Object.keys(_coins.native).length > 0 &&
            <div className="read-debug-log-import-form">
              <div className="form-group form-material floating">
                <input
                  type="text"
                  className="form-control"
                  name="debugLinesCount"
                  id="readDebugLogLines"
                  value={ this.state.debugLinesCount }
                  onChange={ this.updateInput } />
                <label
                  className="floating-label"
                  htmlFor="readDebugLogLines">
                  { translate('INDEX.DEBUG_LOG_LINES') }
                </label>
              </div>
              <div className="form-group form-material floating">
                <select
                  className="form-control form-material"
                  name="debugTarget"
                  id="settingsDelectDebugLogOptions"
                  onChange={ this.updateInput }>
                  { this.renderCoinListSelectorOptions() }
                </select>
                <label
                  className="floating-label"
                  htmlFor="settingsDelectDebugLogOptions">
                  { translate('INDEX.TARGET') }
                </label>
              </div>
              <div className="col-sm-12 col-xs-12 text-align-center">
                <button
                  type="button"
                  className="btn btn-primary waves-effect waves-light"
                  disabled={ this.checkInputVals() }
                  onClick={ this.readDebugLog }>
                  { translate('INDEX.LOAD_DEBUG_LOG') }
                </button>
              </div>
              <div className="row">
                <div className="col-sm-12 col-xs-12 text-align-left">
                  <div className="padding-top-40 padding-bottom-20 horizontal-padding-0 selectable">
                  { this.renderDebugLogData() }
                  </div>
                </div>
              </div>
            </div>
          }
          { this.state.toggleAppRuntimeLog &&
            <div className="margin-top-20 selectable">
            { this.renderAppRuntimeLog() }
            </div>
          }
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    Settings: state.Settings,
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(DebugLogPanel);