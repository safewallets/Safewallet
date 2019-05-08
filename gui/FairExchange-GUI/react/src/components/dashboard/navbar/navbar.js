import React from 'react';
import { connect } from 'react-redux';
import {
  dashboardChangeSection,
  toggleAddcoinModal,
  stopInterval,
  startInterval,
  displayImportKeyModal,
  apiElectrumLock,
  apiElectrumLogout,
  getDexCoins,
  activeHandle,
  dashboardRemoveCoin,
  dashboardChangeActiveCoin,
  toggleNotaryElectionsModal,
  toggleBlurSensitiveData,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import { checkAC } from '../../addcoin/payload';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import NavbarRender from './navbar.render';
const { shell } = window.require('electron');

class Navbar extends React.Component {
  constructor() {
    super();
    this.state = {
      openDropMenu: false,
      isExperimentalOn: false,
    };
    this.openDropMenu = this.openDropMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this._toggleNotaryElectionsModal = this._toggleNotaryElectionsModal.bind(this);
    this._checkAC = this._checkAC.bind(this);
    this._toggleBlurSensitiveData = this._toggleBlurSensitiveData.bind(this);
    this.spvLock = this.spvLock.bind(this);
    this.spvLogout = this.spvLogout.bind(this);
    this.openKomodoPlatformLink = this.openKomodoPlatformLink.bind(this);
  }

  openKomodoPlatformLink() {
    return shell.openExternal('https://komodoplatform.com/komodo-wallets');
  }

  _toggleBlurSensitiveData() {
    Store.dispatch(toggleBlurSensitiveData(!this.props.Main.blurSensitiveData));
  }

  isRenderSpvLockLogout() {
    const _main = this.props.Main;

    if (_main &&
        _main.isLoggedIn &&
        _main.coins &&
        (_main.coins.spv && _main.coins.spv.length) ||
        (_main.coins.eth && _main.coins.eth.length)) {
      return true;
    }
  }

  spvLock() {
    apiElectrumLock()
    .then((res) => {
      mainWindow.pinAccess = false;
      Store.dispatch(getDexCoins());
      Store.dispatch(activeHandle());
    });
  }

  spvLogout() {
    apiElectrumLogout()
    .then((res) => {
      const _coins = this.props.Main.coins;
      const _spvCoins = _coins.spv;
      const _ethCoins = _coins.eth;

      mainWindow.pinAccess = false;

      if (!_coins.native.length) {
        Store.dispatch(dashboardChangeActiveCoin(null, null, true));
      }

      setTimeout(() => {
        for (let i = 0; i < _spvCoins.length; i++) {
          Store.dispatch(dashboardRemoveCoin(_spvCoins[i]));
        }
        for (let i = 0; i < _ethCoins.length; i++) {
          Store.dispatch(dashboardRemoveCoin(_ethCoins[i]));
        }
        if (!_coins.native.length) {
          Store.dispatch(dashboardChangeActiveCoin(null, null, true));
        }

        Store.dispatch(getDexCoins());
        Store.dispatch(activeHandle());

        if (_coins.native.length) {
          Store.dispatch(dashboardChangeActiveCoin(_coins.native[0], 'native'));    
        }
      }, 500);

      Store.dispatch(getDexCoins());
      Store.dispatch(activeHandle());
    });
  }

  componentWillMount() {
    document.addEventListener(
      'click',
      this.handleClickOutside,
      false
    );

    this.setState({
      isExperimentalOn: mainWindow.appConfig.experimentalFeatures,
    });

    if (staticVar.argv.indexOf('dexonly') > -1) {
      Store.dispatch(dashboardChangeSection(mainWindow.activeSection));
    }
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  handleClickOutside(e) {
    const _srcElement = e ? e.srcElement : null;

    if (e &&
        _srcElement &&
        _srcElement.className !== 'dropdown-menu' &&
        _srcElement.className !== 'icon fa-bars' &&
        _srcElement.title !== 'top menu' &&
        (_srcElement.offsetParent && _srcElement.offsetParent.className !== 'navbar-avatar-inner') &&
        _srcElement.className.indexOf('navbar-avatar') === -1 &&
        (e.path && e.path[4] && e.path[4].className.indexOf('dropdown-menu') === -1)) {
      this.setState({
        openDropMenu: false,
      });
    }
  }

  openImportKeyModal() {
    Store.dispatch(displayImportKeyModal(true));
  }

  openDropMenu() {
    this.setState(Object.assign({}, this.state, {
      openDropMenu: !this.state.openDropMenu,
    }));
  }

  _toggleNotaryElectionsModal() {
    Store.dispatch(toggleNotaryElectionsModal(true));
  }

  toggleAddCoinModal() {
    Store.dispatch(toggleAddcoinModal(true, false));
  }

  dashboardChangeSection(sectionName) {
    mainWindow.activeSection = sectionName;
    Store.dispatch(dashboardChangeSection(sectionName));
  }

  _checkAC() {
    return checkAC(this.props.ActiveCoin.coin);
  }

  isSectionActive(section) {
    return this.props.Dashboard.activeSection === section;
  }

  render() {
    return NavbarRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
    },
    Dashboard: {
      activeSection: state.Dashboard.activeSection,
    },
    Interval: {
      interval: state.Interval.interval,
    },
    Main: {
      isLoggedIn: state.Main.isLoggedIn,
      coins: state.Main.coins,
      blurSensitiveData: state.Main.blurSensitiveData,
      newUpdateAvailable: state.Main.newUpdateAvailable,
    },
  };
};

export default connect(mapStateToProps)(Navbar);