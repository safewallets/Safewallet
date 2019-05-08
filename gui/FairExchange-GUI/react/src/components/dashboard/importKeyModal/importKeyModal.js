import React from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import Store from '../../../store';
import {
  displayImportKeyModal,
  importPrivkey,
  triggerToaster,
  copyCoinAddress,
  getDebugLog,
  getDashboardUpdateState,
} from '../../../actions/actionCreators';
import translate from '../../../translate/translate';
import ImportKeyModalRender from './importKeyModal.render';
import { seedToWif } from 'agama-wallet-lib/src/keys';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';

const SEED_TRIM_TIMEOUT = 5000;

class ImportKeyModal extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      wif: '',
      wifkeysPassphrase: '',
      passphraseWif: '',
      passphraseAddress: '',
      keyImportResult: '',
      importWithRescan: false,
      importMulti: false,
      seedInputVisibility: false,
      wifInputVisibility: false,
      trimPassphraseTimer: null,
      seedExtraSpaces: false,
      multipleWif: '',
      className: 'hide',
      open: false,
    };
    this.generateKeysFromPassphrase = this.generateKeysFromPassphrase.bind(this);
    this.toggleImportWithRescan = this.toggleImportWithRescan.bind(this);
    this.toggleSeedInputVisibility = this.toggleSeedInputVisibility.bind(this);
    this.toggleWifInputVisibility = this.toggleWifInputVisibility.bind(this);
    this._copyCoinAddress = this._copyCoinAddress.bind(this);
    this.showPassphraseAddress = this.showPassphraseAddress.bind(this);
    this.importWifAddress = this.importWifAddress.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.importFromPassphrase = this.importFromPassphrase.bind(this);
    this.importFromWif = this.importFromWif.bind(this);
    this.toggleImportMulti = this.toggleImportMulti.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const _display = nextProps.Dashboard.displayImportKeyModal;
    
    if (_display !== this.state.open) {
      this.setState(Object.assign({}, this.state, {
        className: _display ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: _display,
          className: _display ? 'show in' : 'hide',
        }));
      }, _display ? 50 : 300);
    }
  }

  _copyCoinAddress(address) {
    Store.dispatch(copyCoinAddress(address));
  }

  updateInput(e) {
    const newValue = e.target.value;

    clearTimeout(this.state.trimPassphraseTimer);

    const _trimPassphraseTimer = setTimeout(() => {
      if (newValue[0] === ' ' ||
          newValue[newValue.length - 1] === ' ') {
        this.setState({
          seedExtraSpaces: true,
        });
      } else {
        this.setState({
          seedExtraSpaces: false,
        });
      }
    }, SEED_TRIM_TIMEOUT);

    this.setState({
      trimPassphraseTimer: _trimPassphraseTimer,
      [ e.target.name]: newValue,
    });
  }

  toggleSeedInputVisibility() {
    this.setState({
      seedInputVisibility: !this.state.seedInputVisibility,
    });
  }

  toggleWifInputVisibility() {
    this.setState({
      wifInputVisibility: !this.state.wifInputVisibility,
    });
  }

  showPassphraseAddress() {
    const _address = this.generateKeysFromPassphrase();

    if (_address) {
      this.setState({
        passphraseAddress: _address.address,
        passphraseWif: _address.wif,
      });
    }
  }

  importFromPassphrase() {
    const _address = this.generateKeysFromPassphrase();

    if (_address) {
      this.importWifAddress(_address.wif, true);
    }
  }

  importFromWif() {
    if (this.state.importMulti) {
      if (this.state.multipleWif &&
          this.state.multipleWif.length) {
        const _keys = this.state.multipleWif.split('\n');

        for (let i = 0; i < _keys.length; i++) {
          if (this.props.ActiveCoin.coin !== 'KMD' ||
              (this.props.ActiveCoin.coin === 'KMD' && _keys[i] && _keys[i][0] !== 'S' && _keys[i][1] !== 'K' && _keys[i].indexOf('secret-extended-key-main') ==- -1)) {
            setTimeout(() => {
              this.importWifAddress(_keys[i], i === _keys.length - 1 ? this.state.importWithRescan : false, true);
            }, i * 1000);
          } else {
            Store.dispatch(
              triggerToaster(
                translate('IMPORT_KEY.KMD_Z_KEY_DEPRECATED'),
                translate('TOASTR.ERROR'),
                'error'
              )
            );
          }
        }
      }
    } else {
      if (this.props.ActiveCoin.coin !== 'KMD' ||
          (this.props.ActiveCoin.coin === 'KMD' && this.state.wif && this.state.wif[0] !== 'S' && this.state.wif[1] !== 'K' && this.state.wif.indexOf('secret-extended-key-main') ==- -1)) {
        this.importWifAddress(this.state.wif, this.state.importWithRescan);
      } else {
        Store.dispatch(
          triggerToaster(
            translate('IMPORT_KEY.KMD_Z_KEY_DEPRECATED'),
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    }
  }

  importWifAddress(wif, rescan, multi) {
    const _coin = this.props.ActiveCoin.coin;
    let _rescanInProgress = true;

    if (rescan) {
      setTimeout(() => {
        if (_rescanInProgress) {
          setTimeout(() => {
            if (_coin === 'KMD') {
              Store.dispatch(getDebugLog('komodo', 100));
            } else {
              Store.dispatch(getDebugLog('komodo', 100, _coin));
            }
          }, 2000);

          Store.dispatch(getDashboardUpdateState(null, _coin, true));
          Store.dispatch(
            triggerToaster(
              translate('INDEX.' + (multi ? 'ADDRESSES_IMPORTED_RESCAN_IN_PROGRESS' : 'ADDRESS_IMPORTED_RESCAN_IN_PROGRESS')),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'info',
              false
            )
          );
          this.closeModal();
        }
      }, 2000);
    }

    importPrivkey(
      this.props.ActiveCoin.coin,
      wif,
      rescan,
      // https://github.com/zcash/zcash/blob/master/src/chainparams.cpp#L152
      (wif[0] === 'S' && wif[1] === 'K') || wif.indexOf('secret-extended-key-main') > -1
    )
    .then((json) => {
      _rescanInProgress = false;

      if (rescan) {
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      }

      if (!json.id &&
          !json.result &&
          !json.error) {
        Store.dispatch(
          triggerToaster(
            rescan ? translate('INDEX.WALLET_RESCAN_FINISHED') : (translate('INDEX.' + (multi ? 'ADDRESSES_IMPORTED' : 'ADDRESS_IMPORTED'))),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success',
            rescan ? false : true,
          )
        );
      } else {
        Store.dispatch(
          triggerToaster(
            json.error.message,
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });

    this.setState({
      wif: null,
      passphraseWif: null,
      passphraseAddress: null,
      wifkeysPassphrase: null,
      importWithRescan: this.state.importWithRescan ? false : this.state.importWithRescan,
      multipleWif: '',
    });

    // reset input vals
    try {
      this.refs.multipleWif.value = '';
      this.refs.wif.value = '';
      this.refs.wifkeysPassphrase.value = '';  
    } catch (e) {}
  }

  generateKeysFromPassphrase() {
    if (this.state.wifkeysPassphrase &&
        this.state.wifkeysPassphrase.length) {
      const _keys = seedToWif(this.state.wifkeysPassphrase, btcNetworks.kmd, true);

      return {
        address: _keys.pub,
        wif: _keys.priv,
      };
    } else {
      Store.dispatch(
        triggerToaster(
          translate('INDEX.EMPTY_PASSPHRASE_FIELD'),
          translate('TOASTR.ERROR'),
          'error'
        )
      );

      return null;
    }
  }

  toggleImportWithRescan() {
    this.setState({
      importWithRescan: !this.state.importWithRescan,
    });
  }

  toggleImportMulti() {
    this.setState({
      importMulti: !this.state.importMulti,
    });
  }

  closeModal() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        open: false,
        className: 'hide',
      }));

      Store.dispatch(displayImportKeyModal(false));
    }, 300);
  }

  render() {
    return ImportKeyModalRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      balance: state.ActiveCoin.balance,
    },
    Dashboard: {
      displayImportKeyModal: state.Dashboard.displayImportKeyModal,
    },
  };
};

export default connect(mapStateToProps)(ImportKeyModal);