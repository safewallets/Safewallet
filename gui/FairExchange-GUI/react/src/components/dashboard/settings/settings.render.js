import React from 'react';
import translate from '../../../translate/translate';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import PanelSection from './settings.panelBody';
import Panel from './settings.panel';
import Config from '../../../config';

import AppUpdatePanel from  './settings.appUpdatePanel';
import AppInfoPanel from  './settings.appInfoPanel';
import AppSettingsPanel from './settings.appSettingsPanel';
import CliPanel from './settings.cliPanel';
import DebugLogPanel from './settings.debugLogPanel';
import ExportKeysPanel from './settings.exportKeysPanel';
// import ImportKeysPanel from './settings.importKeysPanel';
import SPVServersPanel from './settings.spvServersPanel';
import DaemonStdoutPanel from './settings.daemonStdoutPanel';
import NativeWalletDatKeysPanel from './settings.nativeWalletDatKeysPanel';
import CoindClearDataDirPanel from './settings.coindClearDataDirPanel';
import Bip39KeysPanel from './settings.bip39KeysPanel';
import SeedEncryptPanel from './settings.seedEncryptPanel';
import AddressBookPanel from './settings.addressBookPanel';
import SweepKeysPanel from './settings.sweepKeysPanel';

// import WalletBackupPanel from './settings.walletBackupPanel';

/*
              { !this.props.disableWalletSpecificUI &&
                <PanelSection
                  title={ translate('INDEX.ADD_NODE') }
                  icon="icon md-plus-square">
                  <AddNodePanel />
                </PanelSection>
              }
              { !this.props.disableWalletSpecificUI &&
                <PanelSection
                  title={ translate('INDEX.WALLET_BACKUP') }
                  icon="icon wb-briefcase">
                  <WalletBackupPanel />
                </PanelSection>
              }
              { !this.props.disableWalletSpecificUI &&
                <PanelSection
                  title={ translate('INDEX.IMPORT_KEYS') }
                  icon="icon md-key">
                  <ImportKeysPanel />
                </PanelSection>
              }
*/

export const SettingsRender = function() {
  const _coins = this.props.Main.coins;

  return (
    <div
      id="section-iguana-wallet-settings"
      className="padding-30">
      <div className="row">
        <div className="col-sm-12">
          <h4 className="font-size-14 text-uppercase">{ translate('INDEX.WALLET_SETTINGS') }</h4>
          <Panel
            uniqId="SettingsAccordion"
            singleOpen={ true }>
            <PanelSection
              title={ translate('INDEX.DEBUG_LOG') }
              icon="icon fa-bug">
              <DebugLogPanel />
            </PanelSection>
            { _coins &&
              _coins.native &&
              Object.keys(_coins.native).length > 0 &&
              <PanelSection
                title="Komodod stdout"
                icon="icon fa-bug">
                <DaemonStdoutPanel />
              </PanelSection>
            }
            { staticVar.arch === 'x64' &&
              <PanelSection
                title={ `${translate('SETTINGS.APP_CONFIG')} (config.json)` }
                icon="icon fa-wrench">
                <AppSettingsPanel />
              </PanelSection>
            }
            <PanelSection
              title={ translate('SETTINGS.APP_INFO') }
              icon="icon md-info">
              <AppInfoPanel />
            </PanelSection>
            <PanelSection
              title={ translate('SETTINGS.ENCRYPT_SEED') }
              icon="icon fa-shield">
              <SeedEncryptPanel />
            </PanelSection>
            { _coins &&
              ((_coins.spv && Object.keys(_coins.spv).length) ||
              (_coins.eth && Object.keys(_coins.eth).length)) &&
              this.props.Main.isLoggedIn &&
              !mainWindow.isWatchOnly() &&
              <PanelSection
                title={ translate('INDEX.EXPORT_KEYS') }
                icon="icon md-key">
                <ExportKeysPanel />
              </PanelSection>
            }
            { staticVar.arch === 'x64' &&
              <PanelSection
                title={ `Wallet.dat ${translate('SETTINGS.KEYS_SM')}` }
                icon="icon md-key">
                <NativeWalletDatKeysPanel />
              </PanelSection>
            }
            { Config.experimentalFeatures &&
              _coins.spv &&
              Object.keys(_coins.spv).length &&
              <PanelSection
                title={ translate('SETTINGS.SWEEP_KEY') }
                icon="icon md-key">
                <SweepKeysPanel />
              </PanelSection>
            }
            <PanelSection
              title={ `BIP39 ${translate('SETTINGS.KEYS_CAP')}` }
              icon="icon fa-usb">
              <Bip39KeysPanel />
            </PanelSection>
            { staticVar.arch === 'x64' &&
              <PanelSection
                title={ translate('SETTINGS.CLEAR_NATIVE_DATADIR') }
                icon="icon fa-trash">
                <CoindClearDataDirPanel />
              </PanelSection>
            }
            { _coins &&
              _coins.spv &&
              Object.keys(_coins.spv).length &&
              this.displaySPVServerListTab() &&
              <PanelSection
                title={ translate('SETTINGS.SPV_SERVERS') }
                icon="icon fa-server">
                <SPVServersPanel />
              </PanelSection>
            }
            { _coins &&
              _coins.native &&
              Object.keys(_coins.native).length > 0 &&
              <PanelSection
                title="CLI"
                icon="icon fa-code">
                <CliPanel />
              </PanelSection>
            }
            <PanelSection
              title={ translate('SETTINGS.ADDRESS_BOOK') }
              icon="icon fa-address-book">
              <AddressBookPanel />
            </PanelSection>
            { /*this.state.isExperimentalOn &&
              <PanelSection
                title={ translate('INDEX.UPDATE') }
                icon="icon fa fa-cloud-download">
                <AppUpdatePanel />
              </PanelSection>*/
            }
          </Panel>
        </div>
      </div>
    </div>
  );
};