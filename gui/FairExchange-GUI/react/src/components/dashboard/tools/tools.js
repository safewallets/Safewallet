import React from 'react';
import translate from '../../../translate/translate';

import ToolsGetBalance from './toolsGetBalance';
import ToolsGetBalanceMulti from './toolsGetBalanceMulti';
import ToolsGetUtxos from './toolsGetUtxos';
import ToolsOfflineSigCreate from './toolsOfflineSigCreate';
import ToolsOfflineSigScan from './toolsOfflineSigScan';
import ToolsSeedToWif from './toolsSeedToWif';
import ToolsWifToWif from './toolsWifToWif';
import ToolsPubCheck from './toolsPubCheck';
import ToolsStringToQr from './toolsStringToQr';
import ToolsMergeUTXO from './toolsMergeUtxo';
import ToolsSplitUTXO from './toolsSplitUtxo';
import ToolsGetBalanceMultiCoins from './toolsGetBalanceMultiCoins';
import ToolsTxPush from './toolsTxPush';
import ToolsOfflineSig from './toolsOfflineSig';
import ToolsMultisigAddress from './toolsMultisigAddress';
import ToolsMultisigAddressStorage from './toolsMultisigAddressStorage';
import ToolsMultisigTx from './toolsMultisigTx';

class Tools extends React.Component {
  constructor() {
    super();
    this.state = {
    };
    this.setActiveSection = this.setActiveSection.bind(this);
  }

  setActiveSection(section) {
    this.setState({
      activeSection: section,
    });
  }

  render() {
    return (
      <div className="page margin-left-0">
        <div className="page-content tools background--white">
          <div className="row">
            <div className="col-sm-12 no-padding-left">
              <h2>{ translate('TOOLS.TOOLS') }</h2>
              <div className="margin-top-20 tools-btn-block">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('offlinesig-create') }>
                  { translate('TOOLS.OFFLINE_SIG_CREATE') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('offlinesig-sign') }>
                  { translate('TOOLS.SIGN_MULTISIG_TX') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('offlinesig-push') }>
                  { translate('TOOLS.PUSH_TX') } *
                </button>
                {/*<button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('offlinesig-scan') }>
                  { translate('TOOLS.OFFLINE_SIG_SCAN') }
                </button>*/}
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('string2qr') }>
                  { translate('TOOLS.STR_TO_QR') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('seed2kp') }>
                  { translate('TOOLS.SEED_TO_KP') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('wif2wif') }>
                  { translate('TOOLS.WIF_TO_WIF') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('pubcheck') }>
                  { translate('TOOLS.ADDR_VER_CHECK') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('balance') }>
                  { translate('TOOLS.BALANCE') } *
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('balance-multi') }>
                  KMD { translate('TOOLS.BALANCE') } ({ transcode('TOOLS.MULTI_ADDRESS_SM') }) *
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('balance-multi-coins') }>
                  { translate('TOOLS.CROSS_ASSETS_BALANCE') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('utxo') }>
                  UTXO *
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('utxo-split') }>
                  { translate('TOOLS.SPLIT') } UTXO **
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('utxo-merge') }>
                  { translate('TOOLS.MERGE') } UTXO **
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('multisig-address') }>
                  { translate('TOOLS.GEN_MULTISIG_ADDRESS') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('multisig-address-storage') }>
                  { translate('TOOLS.MULTISIG_ADDREESS_STORAGE') }
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={ () => this.setActiveSection('multisig-tx') }>
                  { translate('TOOLS.MULTISIG_TX') }
                </button>
                <div className="margin-top-10 margin-left-20">{ translate('TOOLS.SPV_NATIVE') }</div>
              </div>
              <hr />
              { this.state.activeSection === 'offlinesig-create' &&
                <ToolsOfflineSigCreate />
              }
              { this.state.activeSection === 'offlinesig-scan' &&
                <ToolsOfflineSigScan />
              }
              { this.state.activeSection === 'string2qr' &&
                <ToolsStringToQr />
              }
              { this.state.activeSection === 'balance' &&
                <ToolsGetBalance />
              }
              { this.state.activeSection === 'utxo' &&
                <ToolsGetUtxos />
              }
              { this.state.activeSection === 'wif2wif' &&
                <ToolsWifToWif />
              }
              { this.state.activeSection === 'pubcheck' &&
                <ToolsPubCheck />
              }
              { this.state.activeSection === 'seed2kp' &&
                <ToolsSeedToWif />
              }
              { this.state.activeSection === 'utxo-split' &&
                <ToolsSplitUTXO />
              }
              { this.state.activeSection === 'utxo-merge' &&
                <ToolsMergeUTXO />
              }
              { this.state.activeSection === 'balance-multi' &&
                <ToolsGetBalanceMulti />
              }
              { this.state.activeSection === 'balance-multi-coins' &&
                <ToolsGetBalanceMultiCoins />
              }
              { this.state.activeSection === 'offlinesig-push' &&
                <ToolsTxPush />
              }
              { this.state.activeSection === 'offlinesig-sign' &&
                <ToolsOfflineSig />
              }
              { this.state.activeSection === 'multisig-address' &&
                <ToolsMultisigAddress />
              }
              { this.state.activeSection === 'multisig-address-storage' &&
                <ToolsMultisigAddressStorage />
              }
              { this.state.activeSection === 'multisig-tx' &&
                <ToolsMultisigTx />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Tools;