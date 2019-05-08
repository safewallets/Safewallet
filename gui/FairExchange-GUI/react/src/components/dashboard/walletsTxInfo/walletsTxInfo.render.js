import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';
import { secondsToString } from 'agama-wallet-lib/src/time';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import erc20ContractId from 'agama-wallet-lib/src/eth-erc20-contract-id';

const renderKvContent = (content) => {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace('\n\n', '<br/><br/>')
    .replace('\n', '<br/>');
}

const WalletsTxInfoRender = function(txInfo) {
  const isSpv = this.props.ActiveCoin.mode === 'spv' || this.props.ActiveCoin.mode === 'eth';
  const isEth = this.props.ActiveCoin.mode === 'eth';
  
  return (
    <div onKeyDown={ (event) => this.handleKeydown(event) }>
      <div
        className={ `modal modal-3d-sign tx-details-modal ${this.state.className}` }
        id="kmd_txid_info_mdl">
        <div
          onClick={ this.toggleTxInfoModal }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-lg">
          <div
            onClick={ this.toggleTxInfoModal }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
               <button
                 type="button"
                 className="close white"
                 onClick={ this.toggleTxInfoModal }>
                 <span>×</span>
               </button>
               <h4 className="modal-title white">
                 { translate('INDEX.TX_DETAILS') }
               </h4>
             </div>
            <div className="modal-body modal-body-container">
              <div className="panel nav-tabs-horizontal">
                <ul className="nav nav-tabs nav-tabs-line">
                  { this.state.txDetails &&
                    this.state.txDetails.opreturn &&
                    this.state.txDetails.opreturn.kvDecoded &&
                    Config.experimentalFeatures &&
                    <li className={ this.state.activeTab === 4 ? 'active' : '' }>
                      <a onClick={ () => this.openTab(4) }>
                        <i className="icon fa-file-text-o"></i>{ translate('INDEX.KV_INFO') }
                      </a>
                    </li>
                  }
                  <li className={ this.state.activeTab === 0 ? 'active' : '' }>
                    <a onClick={ () => this.openTab(0) }>
                      <i className="icon md-balance-wallet"></i>{ translate('INDEX.TXID_INFO') }
                    </a>
                  </li>
                  <li className={ this.state.activeTab === 1 ? 'hide active' : 'hide' }>
                    <a onClick={ () => this.openTab(1) }>
                      <i className="icon md-plus-square"></i>Vjointsplits, Details
                    </a>
                  </li>
                  { !isEth &&
                    <li className={ this.state.activeTab === 2 ? 'active' : '' }>
                      <a onClick={ () => this.openTab(2) }>
                        <i className="icon wb-briefcase"></i>{ translate('INDEX.HEX') }
                      </a>
                    </li>
                  }
                  <li className={ this.state.activeTab === 3 ? 'active' : '' }>
                    <a onClick={ () => this.openTab(3) }>
                      <i className="icon wb-file"></i>{ translate('INDEX.RAW_INFO') }
                    </a>
                  </li>
                </ul>
                <div className="panel-body">
                  { this.state.txDetails &&
                    <div className="tab-content">
                      { this.state.activeTab === 0 &&
                        <div className="tab-pane active">
                          <table className="table table-striped">
                            <tbody>
                              <tr>
                                <td>{ this.capitalizeFirstLetter(translate('TX_INFO.ADDRESS')) }</td>
                                <td className="blur selectable word-break--all">
                                  { isSpv ? this.state.txDetails.address : this.state.txDetails.details[0] && this.state.txDetails.details[0].address || txInfo.address }
                                </td>
                              </tr>
                              <tr>
                                <td>{ this.capitalizeFirstLetter(translate('TX_INFO.AMOUNT')) }</td>
                                <td>
                                  { isSpv ? (Number(this.state.txDetails.amount) === 0 ? translate('DASHBOARD.UNKNOWN') : Number(this.state.txDetails.amount)) : txInfo.amount }
                                </td>
                              </tr>
                              { (isEth || (isSpv && this.state.txDetails.amount !== this.state.txDetails.fee)) &&
                                <tr>
                                  <td>{ this.capitalizeFirstLetter(translate('SEND.FEE')) }</td>
                                  <td>
                                    { Number(this.state.txDetails.fee) }
                                  </td>
                                </tr>
                              }
                              <tr>
                                <td>{ this.capitalizeFirstLetter(translate('TX_INFO.CATEGORY')) }</td>
                                <td>
                                  { isSpv ? this.state.txDetails.type : this.state.txDetails.details[0] && this.state.txDetails.details[0].category || txInfo.type }
                                </td>
                              </tr>
                              <tr>
                                <td>{ this.capitalizeFirstLetter(translate('TX_INFO.CONFIRMATIONS')) }</td>
                                <td>
                                  { this.state.txDetails.confirmations }
                                </td>
                              </tr>
                              { this.state.txDetails.hasOwnProperty('rawconfirmations') &&
                                this.state.txDetails.confirmations !== this.state.txDetails.rawconfirmations &&
                                <tr>
                                  <td>{ translate('INDEX.RAW_CONFS') }</td>
                                  <td>
                                    { this.state.txDetails.rawconfirmations }
                                  </td>
                                </tr>
                              }
                              { this.state.txDetails.blockindex &&
                                <tr>
                                  <td>{ this.capitalizeFirstLetter('blockindex') }</td>
                                  <td className="selectable">
                                    { this.state.txDetails.blockindex }
                                  </td>
                                </tr>
                              }
                              { this.state.txDetails.blockhash &&
                                <tr>
                                  <td>{ isSpv ? this.capitalizeFirstLetter('blockheight') : this.capitalizeFirstLetter('blockhash') }</td>
                                  <td className="selectable">
                                    { isSpv ? this.state.txDetails.height : this.state.txDetails.blockhash }
                                  </td>
                                </tr>
                              }
                              { (this.state.txDetails.blocktime || this.state.txDetails.timestamp) &&
                                <tr>
                                  <td>{ this.capitalizeFirstLetter('blocktime') }</td>
                                  <td>
                                    { secondsToString(this.state.txDetails.blocktime || this.state.txDetails.timestamp) }
                                  </td>
                                </tr>
                              }
                              <tr>
                                <td>{ this.capitalizeFirstLetter('txid') }</td>
                                <td className="blur selectable">
                                  { this.state.txDetails.txid }
                                </td>
                              </tr>
                              { this.state.txDetails.walletconflicts &&
                                <tr>
                                  <td>{ this.capitalizeFirstLetter('walletconflicts') }</td>
                                  <td>
                                    { this.state.txDetails.walletconflicts.length }
                                  </td>
                                </tr>
                              }
                              <tr>
                                <td>{ this.capitalizeFirstLetter('time') }</td>
                                <td>
                                  { secondsToString(isSpv ? this.state.txDetails.blocktime || this.state.txDetails.timestamp : this.state.txDetails.time) }
                                </td>
                              </tr>
                              { !isEth &&
                                <tr>
                                  <td>{ this.capitalizeFirstLetter('timereceived') }</td>
                                  <td>
                                    { secondsToString(isSpv ? this.state.txDetails.blocktime : this.state.txDetails.timereceived) }
                                  </td>
                                </tr>
                              }
                              { ((this.props.ActiveCoin.mode === 'spv' && this.state.txDetails.hasOwnProperty('dpowSecured') && this.state.txDetails.dpowSecured) ||
                                (this.props.ActiveCoin.mode === 'native' && this.state.txDetails.hasOwnProperty('rawconfirmations') && this.state.txDetails.confirmations >=2)) &&
                                <tr>
                                  <td>dPoW { translate('INDEX.SECURED') }</td>
                                  <td>
                                    { translate('SETTINGS.YES') }
                                  </td>
                                </tr>
                              }
                              { ((this.props.ActiveCoin.mode === 'spv' && this.state.txDetails.hasOwnProperty('dpowSecured') && !this.state.txDetails.dpowSecured) ||
                                (this.props.ActiveCoin.mode === 'native' && this.state.txDetails.hasOwnProperty('rawconfirmations') && this.state.txDetails.confirmations < 2)) &&
                                <tr>
                                  <td>dPoW { translate('INDEX.SECURED') }</td>
                                  <td>
                                    { translate('SETTINGS.NO') }
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      }
                      { this.state.activeTab === 1 &&
                        <div className="tab-pane active">
                          <table className="table table-striped">
                            <tbody>
                              <tr>
                                <td>{ this.capitalizeFirstLetter('txid') }</td>
                                <td className="selectable">
                                  { txInfo.txid }
                                </td>
                              </tr>
                              <tr>
                                <td>{ this.capitalizeFirstLetter('walletconflicts') }</td>
                                <td className="selectable">
                                  { txInfo.walletconflicts ? txInfo.walletconflicts.length : '' }
                                </td>
                              </tr>
                              <tr>
                                <td>{ this.capitalizeFirstLetter('vjoinsplit') }</td>
                                <td className="selectable">
                                  { txInfo.vjoinsplit }
                                </td>
                              </tr>
                              <tr>
                                <td>{ this.capitalizeFirstLetter('details') }</td>
                                <td className="selectable">
                                  { txInfo.details }
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      }
                      { this.state.activeTab === 2 &&
                        <div className="tab-pane active">
                          <textarea
                            className="full-width"
                            rows="15"
                            cols="80"
                            defaultValue={ this.state.rawTxDetails.hex }
                            disabled></textarea>
                        </div>
                      }
                      { this.state.activeTab === 3 &&
                        <div className="tab-pane active">
                          <textarea
                            className="full-width"
                            rows="15"
                            cols="80"
                            defaultValue={ JSON.stringify(this.state.rawTxDetails, null, '\t') }
                            disabled></textarea>
                        </div>
                      }
                      { this.state.activeTab === 4 &&
                        Config.experimentalFeatures &&
                        <div className="tab-pane active">
                          <table className="table table-striped">
                            <tbody>
                              <tr>
                                <td>{ translate('KV.TAG') }</td>
                                <td className="selectable">
                                  { renderKvContent(this.state.txDetails.opreturn.kvDecoded.tag) }
                                </td>
                              </tr>
                              <tr>
                                <td>{ translate('KV.TITLE') }</td>
                                <td className="selectable">
                                  { renderKvContent(this.state.txDetails.opreturn.kvDecoded.content.title) }
                                </td>
                              </tr>
                              <tr>
                                <td>{ this.capitalizeFirstLetter('time') }</td>
                                <td>
                                  { secondsToString(isSpv ? this.state.txDetails.blocktime : this.state.txDetails.time) }
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div
                            className="kv-content padding-top-20 selectable"
                            dangerouslySetInnerHTML={{ __html: renderKvContent(this.state.txDetails.opreturn.kvDecoded.content.body) }}>
                          </div>
                        </div>
                      }
                    </div>
                  }
                  { !this.state.txDetails &&
                    <div>{ translate('INDEX.LOADING') }...</div>
                  }
                </div>
              </div>
            </div>
            <div className="modal-footer">
              { this.state.txDetails &&
                (explorerList[this.props.ActiveCoin.coin] || erc20ContractId[this.props.ActiveCoin.coin]) &&
                <button
                  type="button"
                  className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                  onClick={ () => this.openExplorerWindow(this.state.txDetails.txid) }>
                  <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', isEth ? 'Etherscan' : this.props.ActiveCoin.coin) }
                </button>
              }
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </div>
  );
};

export default WalletsTxInfoRender;