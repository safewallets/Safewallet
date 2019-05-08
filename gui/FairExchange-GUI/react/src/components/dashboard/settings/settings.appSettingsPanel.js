import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import Config from '../../../config';
import {
  getAppConfig,
  getAppInfo,
  resetAppConfig,
  resetSPVCache,
  saveAppConfig,
  skipFullDashboardUpdate,
  triggerToaster,
  apiElectrumKvServersList,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import { pubkeyToAddress } from 'agama-wallet-lib/src/keys';
import bitcoinjsNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';

class AppSettingsPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      appSettings: {},
      appConfigSchema: {},
    };
    this._saveAppConfig = this._saveAppConfig.bind(this);
    this._resetAppConfig = this._resetAppConfig.bind(this);
    this._skipFullDashboardUpdate = this._skipFullDashboardUpdate.bind(this);
    this._resetSPVCache = this._resetSPVCache.bind(this);
    this._apiElectrumKvServersList = this._apiElectrumKvServersList.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  validatePubkey(pubkey) {
    const address = pubkeyToAddress(pubkey, bitcoinjsNetworks.kmd);

    if (address) {
      Store.dispatch(
        triggerToaster(
          `${translate('TOASTR.YOUR_PUBKEY')}${pubkey}${translate('TOASTR.CORRESPONDS_TO_T_ADDR')}${address}`,
          translate('INDEX.SETTINGS'),
          'success toastr-wide',
          false
        )
      );
    } else {
      Store.dispatch(
        triggerToaster(
          translate('TOASTR.INVALID_PUBKEY'),
          translate('INDEX.SETTINGS'),
          'error'
        )
      );
    }
  }

  _apiElectrumKvServersList() {
    apiElectrumKvServersList()
    .then((res) => {
      Store.dispatch(
        triggerToaster(
          translate('SETTINGS.' + (res.msg === 'success' ? 'DOWNLOAD_KV_ELECTRUMS_DONE' : 'DOWNLOAD_KV_ELECTRUMS_ERR')),
          translate('INDEX.SETTINGS'),
          res.msg === 'success' ? 'success' : 'error',
        )
      );
    });
  }

  _resetSPVCache() {
    Store.dispatch(resetSPVCache());
  }

  componentWillMount() {
    const _appConfigSchema = staticVar.appConfigSchema;
    const _appSettings = this.props.Settings.appSettings ? this.props.Settings.appSettings : Object.assign({}, mainWindow.appConfig);

    this.setState(Object.assign({}, this.state, {
      appConfigSchema: _appConfigSchema,
      appSettings: _appSettings,
    }));
  }

  componentDidMount(props) {
    Store.dispatch(getAppConfig());
    Store.dispatch(getAppInfo());
  }

  _skipFullDashboardUpdate() {
    Store.dispatch(skipFullDashboardUpdate(!this.props.Dashboard.skipFullDashboardUpdate));
  }

  _resetAppConfig() {
    Store.dispatch(resetAppConfig());
  }

  _saveAppConfig() {
    const _appSettings = this.state.appSettings;
    const _configSchema = this.state.appConfigSchema;
    let _appSettingsPristine = Object.assign({}, this.state.appSettings || this.props.Settings.appSettings);
    let isError = false;
    let saveAfterPathCheck = false;

    for (let key in _appSettings) {
      if (typeof _appSettings[key] !== 'object') {
        _appSettingsPristine[key] = _configSchema[key] && _configSchema[key].type === 'number' ? Number(_appSettings[key]) : _appSettings[key];

        if (_configSchema[key] &&
            _configSchema[key].type === 'folder' &&
            _appSettings[key] &&
            _appSettings[key].length) {
          const _testLocation = mainWindow.testLocation;
          saveAfterPathCheck = true;

          _testLocation(_appSettings[key])
          .then((res) => {
            if (res === -1) {
              isError = true;
              Store.dispatch(
                triggerToaster(
                  this.renderLB('TOASTR.KOMODO_DATADIR_INVALID'),
                  translate('INDEX.SETTINGS'),
                  'error',
                  false
                )
              );
            } else if (res === false) {
              isError = true;
              Store.dispatch(
                triggerToaster(
                  this.renderLB('TOASTR.KOMODO_DATADIR_NOT_DIR'),
                  translate('INDEX.SETTINGS'),
                  'error',
                  false
                )
              );
            } else {
              Store.dispatch(saveAppConfig(_appSettingsPristine));
            }
          });
        }
      } else {
        for (let keyChild in _appSettings[key]) {
          if (_configSchema[key][keyChild] &&
              _configSchema[key][keyChild].type === 'folder' &&
              _appSettings[key][keyChild] &&
              _appSettings[key][keyChild].length) {
            const _testLocation = mainWindow.testLocation;
            saveAfterPathCheck = true;
  
            _testLocation(_appSettings[key][keyChild])
            .then((res) => {
              if (res === -1) {
                isError = true;
                Store.dispatch(
                  triggerToaster(
                    this.renderLB('TOASTR.KOMODO_DATADIR_INVALID'),
                    translate('INDEX.SETTINGS'),
                    'error',
                    false
                  )
                );
              } else if (res === false) {
                isError = true;
                Store.dispatch(
                  triggerToaster(
                    this.renderLB('TOASTR.KOMODO_DATADIR_NOT_DIR'),
                    translate('INDEX.SETTINGS'),
                    'error',
                    false
                  )
                );
              } else {
                Store.dispatch(saveAppConfig(_appSettingsPristine));
              }
            });
          } else {
            _appSettingsPristine[key][keyChild] = _configSchema[key][keyChild].type === 'number' ? Number(_appSettings[key][keyChild]) : _appSettings[key][keyChild];
          }
        }
      }
    }

    delete _appSettingsPristine.token;

    if (!saveAfterPathCheck) {
      Store.dispatch(saveAppConfig(_appSettingsPristine));
      mainWindow.appConfig = _appSettingsPristine;
    }
  }

  renderLB(_translationID) {
    const _translationComponents = translate(_translationID).split('<br>');
    let _items = [];
  
    for (let i = 0; i < _translationComponents.length; i++) {
      _items.push(
        <span key={ `jumblr-label-${Math.random(0, 9) * 10}` }>
          { _translationComponents[i] }
          <br />
        </span>
      );
    }
  
    return _items;
  }

  renderSelectOptions(data, translateSelector, name) {
    let _items = [];

    for (let i = 0; i < data.length; i++) {
      _items.push(
        <option
          key={ `settings-${name}-opt-${i}` }
          value={ data[i] }>
          { translate(`${translateSelector}.${data[i].toUpperCase()}`) }
        </option>
      );
    }

    return _items;
  }

  renderConfigEditForm() {
    const _appConfig = this.state.appSettings;
    const _configSchema = this.state.appConfigSchema
    let items = [];

    for (let key in _appConfig) {
      if (_configSchema[key] &&
          typeof _appConfig[key] === 'object') {
        if ((_configSchema[key].display && _configSchema[key].type !== 'select') ||
            (_configSchema[key].display && _configSchema[key].type === 'select' && Config.experimentalFeatures)) {
          items.push(
            <tr key={ `app-settings-${key}` }>
              <td className="padding-15">
                { _configSchema[key].displayName ? _configSchema[key].displayName : key }
                { _configSchema[key].info &&
                  <i
                    className="icon fa-question-circle settings-help"
                    data-tip={ _configSchema[key].info }
                    data-for="appSettings1"
                    data-html={ true }></i>
                }
                <ReactTooltip
                  id="appSettings1"
                  effect="solid"
                  className="text-left" />
              </td>
              <td className="padding-15"></td>
            </tr>
          );

          for (let _key in _appConfig[key]) {
            items.push(
              <tr key={ `app-settings-${key}-${_key}` }>
                <td className="padding-15 padding-left-30">
                  { _configSchema[key][_key].displayName ? _configSchema[key][_key].displayName : _key }
                  { _configSchema[key][_key].info &&
                    <i
                      className="icon fa-question-circle settings-help"
                      data-tip={ _configSchema[key][_key].info }
                      data-html={ true }
                      data-for="appSettings2"></i>
                  }
                  <ReactTooltip
                    id="appSettings2"
                    effect="solid"
                    className="text-left" />
                </td>
                <td className="padding-15">
                  { _configSchema[key][_key].type === 'number' &&
                    <input
                      type="number"
                      pattern="[0-9]*"
                      name={ `${key}__${_key}` }
                      value={ _appConfig[key][_key] }
                      onChange={ (event) => this.updateInputSettings(event, key, _key) } />
                  }
                  { (_configSchema[key][_key].type === 'string' ||
                    _configSchema[key][_key].type === 'folder') &&
                    <input
                      type="text"
                      name={ `${key}__${_key}` }
                      value={ _appConfig[key][_key] }
                      className="full-width"
                      onChange={ (event) => this.updateInputSettings(event, key, _key) } />
                  }
                  { _configSchema[key][_key].type === 'boolean' &&
                    <span className="pointer toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name={ `${key}__${_key}` }
                          value={ _appConfig[key] }
                          checked={ _appConfig[key][_key] }
                          readOnly />
                        <div
                          className="slider"
                          onClick={ (event) => this.updateInputSettings(event, key, _key) }></div>
                      </label>
                    </span>
                  }
                </td>
              </tr>
            );

            const _appInfo = this.props.Settings.appInfo;

            if (key === 'spv' &&
                _key === 'cache' &&
                _appInfo &&
                _appInfo.cacheSize &&
                _appInfo.cacheSize !== '2 Bytes') {
              items.push(
                <tr key={ `app-settings-${key}-${_key}-size` }>
                  <td
                    className="padding-15 padding-left-30">
                    { translate('SETTINGS.CURRENT_CACHE_SIZE') }: <strong>{ _appInfo.cacheSize }</strong>
                  </td>
                  <td className="padding-15">
                    <button
                      type="button"
                      className="btn btn-info waves-effect waves-light"
                      onClick={ this._resetSPVCache }>
                      { translate('SETTINGS.CLEAR_CACHE') }
                    </button>
                  </td>
                </tr>
              );
            }

            if (key === 'spv' &&
                _key === 'syncServerListFromKv') {
              items.push(
                <tr key={ `app-settings-${key}-${_key}-size` }>
                  <td
                    colSpan="2"
                    className="padding-15">
                    <button
                      type="button"
                      className="btn btn-info waves-effect waves-light margin-left-15"
                      onClick={ this._apiElectrumKvServersList }>
                      { translate('SETTINGS.DOWNLOAD_KV_ELECTRUMS') }
                    </button>
                  </td>
                </tr>
              );
            }
          }
        }
      } else {
        if ((_configSchema[key] && _configSchema[key].display && _configSchema[key].type !== 'select') ||
            (_configSchema[key] && _configSchema[key].display && _configSchema[key].type === 'select' && Config.experimentalFeatures)) {
          items.push(
            <tr key={ `app-settings-${key}` }>
              <td className="padding-15">
                { _configSchema[key].displayName ? _configSchema[key].displayName : key }
                { _configSchema[key].info &&
                  <i
                    className="icon fa-question-circle settings-help"
                    data-tip={ _configSchema[key].info }
                    data-html={ true }
                    data-for="appSettings3"></i>
                }
                <ReactTooltip
                  id="appSettings3"
                  effect="solid"
                  className="text-left" />
              </td>
              <td className="padding-15">
                { _configSchema[key].type === 'number' &&
                  <input
                    type="number"
                    pattern="[0-9]*"
                    name={ `${key}` }
                    value={ _appConfig[key] }
                    onChange={ (event) => this.updateInputSettings(event, key) } />
                }
                { (_configSchema[key].type === 'string' ||
                  _configSchema[key].type === 'folder') &&
                  <input
                    type="text"
                    name={ `${key}` }
                    value={ _appConfig[key] }
                    className="full-width"
                    onChange={ (event) => this.updateInputSettings(event, key) } />
                }
                { (_configSchema[key].type === 'string' ||
                  _configSchema[key].type === 'folder') &&
                  key === 'pubkey' &&
                  _appConfig[key].length > 0 &&
                  <button
                    type="button"
                    className="btn btn-info waves-effect waves-light margin-top-15"
                    onClick={ () => this.validatePubkey(_appConfig[key]) } >
                    { translate('SETTINGS.VALIDATE_PUBKEY') }
                  </button>
                }
                { _configSchema[key].type === 'boolean' &&
                  <span className="pointer toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name={ `${key}` }
                        value={ _appConfig[key] }
                        checked={ _appConfig[key] }
                        readOnly />
                      <div
                        className="slider"
                        onClick={ (event) => this.updateInputSettings(event, key) }></div>
                    </label>
                  </span>
                }
                { _configSchema[key].type === 'select' &&
                  Config.experimentalFeatures &&
                  <select
                    className="form-control select-settings"
                    name={ `${key}` }
                    value={ _appConfig[key] }
                    onChange={ (event) => this.updateInputSettings(event, key) }>
                    { this.renderSelectOptions(_configSchema[key].data, _configSchema[key].translateSelector, key) }
                  </select>
                }
              </td>
            </tr>
          );
        }
      }
    }

    items.push(
      <tr key="kmd-main-sync-only">
        <td className="padding-15">
          { translate('SETTINGS.KMD_MAIN_SYNC_ONLY') }
          <i
            className="icon fa-question-circle settings-help"
            data-tip={ translate('SETTINGS.RPC_FETCH_ONLY_DESC') }
            data-html={ true }
            data-for="appSettings4"></i>
          <ReactTooltip
            id="appSettings4"
            effect="solid"
            className="text-left" />
        </td>
        <td className="padding-15">
          <span className="pointer toggle">
            <label className="switch">
              <input
                type="checkbox"
                name="kmd-main-sync-only"
                value={ this.props.Dashboard.skipFullDashboardUpdate }
                checked={ this.props.Dashboard.skipFullDashboardUpdate }
                readOnly />
              <div
                className="slider"
                onClick={ this._skipFullDashboardUpdate }></div>
            </label>
          </span>
        </td>
      </tr>
    );

    return items;
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  updateInputSettings(e, parentKey, childKey) {
    const _configSchema = this.state.appConfigSchema;
    const _val = e.target.value;
    const _name = e.target.name;    
    let _appSettings = this.state.appSettings;
    let _appSettingsPrev = Object.assign({}, _appSettings);
    
    if (!childKey &&
        _configSchema[parentKey].type === 'boolean') {
      _appSettings[parentKey] = typeof _appSettings[parentKey] !== undefined ? !_appSettings[parentKey] : !this.state.appSettings[parentKey];
    } else if (
      childKey &&
      _configSchema[parentKey][childKey].type === 'boolean'
    ) {
      _appSettings[parentKey][childKey] = typeof _appSettings[parentKey][childKey] !== undefined ? !_appSettings[parentKey][childKey] : !this.state.appSettings[parentKey][childKey];
    } else if (
      (!childKey && _configSchema[parentKey].type === 'number') ||
      (childKey && _configSchema[parentKey][childKey].type === 'number')
    ) {
      if (!childKey) {
        _appSettings[_name] = _val === '' ? _appSettingsPrev[_name] : _val.replace(/[^0-9]+/g, '');
      } else {
        _appSettings[parentKey][childKey] = _val === '' ? _appSettingsPrev[parentKey][childKey] : _val.replace(/[^0-9]+/g, '');
      }
    } else if (
      childKey &&
      parentKey &&
      (_configSchema[parentKey][childKey].type === 'string' || _configSchema[parentKey][childKey].type === 'folder')
    ) {
      _appSettings[parentKey][childKey] = _val;
    } else {
      _appSettings[_name] = _val;
    }

    this.setState({
      appSettings: _appSettings,
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 padding-top-15">
            <p>
              <strong>{ translate('SETTINGS.CONFIG_RESTART_REQUIRED') }</strong>
            </p>
            <table>
              <tbody>
              { this.renderConfigEditForm() }
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-xs-12 text-align-center padding-top-35 padding-bottom-30">
            <button
              type="button"
              className="btn btn-primary waves-effect waves-light"
              onClick={ this._saveAppConfig }>
              { translate('SETTINGS.SAVE_APP_CONFIG') }
            </button>
            <button
              type="button"
              className="btn btn-primary waves-effect waves-light margin-left-30"
              onClick={ this._resetAppConfig }>
              { translate('SETTINGS.RESET_TO_DEFAULT') }
            </button>
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    Settings: state.Settings,
    Dashboard: {
      skipFullDashboardUpdate: state.Dashboard.skipFullDashboardUpdate,
    },
  };
};

export default connect(mapStateToProps)(AppSettingsPanel);