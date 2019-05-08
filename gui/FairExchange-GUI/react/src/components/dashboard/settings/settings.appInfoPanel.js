import React from 'react';
import translate from '../../../translate/translate';
import { connect } from 'react-redux';
import mainWindow, { staticVar } from '../../../util/mainWindow';

class AppInfoPanel extends React.Component {
  constructor() {
    super();
  }

  render() {
    const releaseInfo = this.props.Settings.appInfo && this.props.Settings.appInfo.releaseInfo;

    if (!releaseInfo) {
      return null;
    } else {
      const _ports = mainWindow.getAssetChainPorts();
      let _items = [];

      for (let key in _ports) {
        _items.push(
          <span key={ `settings-coind-ports-${key}` }>
            { key === 'komodod' ? 'KMD' : key }: { _ports[key] }<br />
          </span>
        );
      }

      const _appInfo = this.props.Settings.appInfo;

      return (
        <div className="row">
          <div className="col-sm-12 padding-top-15">
            <h5>{ translate('SETTINGS.APP_RELEASE') }</h5>
            <p>
              { translate('SETTINGS.NAME') }: <span className="selectable">{ _appInfo.releaseInfo.name }</span>
              <br />
              { translate('SETTINGS.VERSION') }: <span className="selectable">{ `${_appInfo.releaseInfo.version.replace('version=', '')}${mainWindow.arch === 'x64' ? '' : '-32bit'}-beta` }</span>
            </p>
            <h5>{ translate('SETTINGS.SYS_INFO') }</h5>
            <p>
              { translate('SETTINGS.ARCH') }: <span className="selectable">{ _appInfo.sysInfo.arch }</span>
              <br />
              { translate('SETTINGS.OS_TYPE') }: <span className="selectable">{ _appInfo.sysInfo.os_type }</span>
              <br />
              { translate('SETTINGS.OS_PLATFORM') }: <span className="selectable">{ _appInfo.sysInfo.platform }</span>
              <br />
              { translate('SETTINGS.OS_RELEASE') }: <span className="selectable">{ _appInfo.sysInfo.os_release }</span>
              <br />
              { translate('SETTINGS.CPU') }: <span className="selectable">{ _appInfo.sysInfo.cpu }</span>
              <br />
              { translate('SETTINGS.CPU_CORES') }: <span className="selectable">{ _appInfo.sysInfo.cpu_cores }</span>
              <br />
              { translate('SETTINGS.MEM') }: <span className="selectable">{ _appInfo.sysInfo.totalmem_readable }</span>
            </p>
            { staticVar.arch === 'x64' &&
              <h5>{ translate('SETTINGS.LOCATIONS') }</h5>
            }
            { staticVar.arch === 'x64' &&
              <p>
                { translate('SETTINGS.CACHE') }: <span className="selectable">{ _appInfo.dirs.cacheLocation }</span>
                <br />
                { translate('SETTINGS.CONFIG') }: <span className="selectable">{ _appInfo.dirs.configLocation }</span>
                <br />
                Komodo { translate('SETTINGS.BIN') }: <span className="selectable">{ _appInfo.dirs.komododBin }</span>
                <br />
                Komodo { translate('SETTINGS.DIR') }: <span className="selectable">{ _appInfo.dirs.komodoDir }</span>
                <br />
                Komodo wallet.dat: <span className="selectable">{ _appInfo.dirs.komodoDir }</span>
              </p>
            }
            { staticVar.arch === 'x64' &&
              <h5>{ translate('SETTINGS.DAEMON_PORTS') }</h5>
            }
            { staticVar.arch === 'x64' &&
              <p className="selectable">{ _items }</p>
            }
          </div>
        </div>
      );
    }
  };
}

const mapStateToProps = (state) => {
  return {
    Settings: state.Settings,
  };
};

export default connect(mapStateToProps)(AppInfoPanel);