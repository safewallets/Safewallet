import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';
import { secondsToString } from 'agama-wallet-lib/src/time';
import {
  formatValue,
} from 'agama-wallet-lib/src/utils';

const statusLookup = {
  coinswitch: {
    timeout: translate('EXCHANGES.STATUS_EXPIRED'),
    no_deposit: translate('EXCHANGES.STATUS_AWAITING_DEPOSIT'),
    confirming: translate('EXCHANGES.STATUS_CONFIRMING'),
    exchanging: translate('EXCHANGES.STATUS_EXCHANGING'),
    sending: translate('EXCHANGES.STATUS_SENDING'),
  },
};

const ExchangesOrderInfoModalRender = function() {
  const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.props.provider];
  const _key = this.props.Dashboard.showExchangesOrderInfoId;
  const isSpv = true;
  const isEth = false;

  if (_cache &&
      _key) {
    return (
      <div onKeyDown={ (event) => this.handleKeydown(event) }>
        <div
          className={ `modal modal-3d-sign tx-details-modal ${this.state.className}` }
          id="kmd_txid_info_mdl">
          <div
            onClick={ this._toggleExchangesOrderInfoModal }
            className="modal-close-overlay"></div>
          <div className="modal-dialog modal-center modal-lg">
            <div
              onClick={ this._toggleExchangesOrderInfoModal }
              className="modal-close-overlay"></div>
            <div className="modal-content">
              <div className="modal-header bg-orange-a400 wallet-send-header">
                <button
                  type="button"
                  className="close white"
                  onClick={ this._toggleExchangesOrderInfoModal }>
                  <span>×</span>
                </button>
                <h4 className="modal-title white">
                  { translate('EXCHANGES.EXCHANGE_ORDER_DETAILS') }
                </h4>
              </div>
              <div className="modal-body modal-body-container">
                <div className="panel nav-tabs-horizontal">
                  <ul className="nav nav-tabs nav-tabs-line">
                    <li className={ this.state.activeTab === 0 ? 'active' : '' }>
                      <a onClick={ () => this.openTab(0) }>
                        <i className="icon md-balance-wallet"></i>{ translate('EXCHANGES.ORDER_INFO') }
                      </a>
                    </li>
                    { (_cache[_key].inputTransactionHash || this.findDeposits(_cache[_key].orderId).length > 0) &&
                      <li className={ this.state.activeTab === 1 ? 'active' : '' }>
                        <a onClick={ () => this.openTab(1) }>
                          <i className="icon wb-file"></i>{ translate('EXCHANGES.DEPOSIT_INFO') }
                        </a>
                      </li>
                    }
                  </ul>
                  <div className="panel-body">
                    <div className="tab-content">
                      { this.state.activeTab === 0 &&
                        <div className="tab-pane active">
                          <table className="table table-striped">
                            <tbody>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.DATE') }
                                </td>
                                <td>
                                  { secondsToString(_cache[_key].createdAt / 1000) }
                                </td>
                              </tr>
                              { _cache[_key].validTill &&
                                <tr>
                                  <td>
                                    { translate('EXCHANGES.VALID_UNTIL') }
                                  </td>
                                  <td>
                                    { secondsToString(_cache[_key].validTill / 1000) }
                                  </td>
                                </tr>
                              }
                              <tr>
                                <td>
                                  { translate('EXCHANGES.SOURCE') }
                                </td>
                                <td>
                                  <img
                                    className="margin-right-10"
                                    height="25px"
                                    src={ `assets/images/cryptologo/btc/${_cache[_key].depositCoin}.png` } />
                                  { formatValue(_cache[_key].expectedDepositCoinAmount) } { _cache[_key].depositCoin.toUpperCase() }
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.DESTINATION') }
                                </td>
                                <td>
                                  <img
                                    className="margin-right-10"
                                    height="25px"
                                    src={ `assets/images/cryptologo/btc/${_cache[_key].destinationCoin}.png`} />
                                  { formatValue(_cache[_key].expectedDestinationCoinAmount) } { _cache[_key].destinationCoin.toUpperCase() }
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.DEPOSIT_ADDRESS') }
                                </td>
                                <td className="blur selectable word-break--all">
                                  { _cache[_key].exchangeAddress.address }
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.DESTINATION_ADDRESS') }
                                </td>
                                <td className="blur selectable word-break--all">
                                  { _cache[_key].destinationAddress.address }
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.DEPOSIT_TX_HASH') }
                                </td>
                                <td className="blur selectable word-break--all">
                                  { _cache[_key].inputTransactionHash || this.findDeposits(_cache[_key].orderId)[0] }
                                </td>
                              </tr>
                              <tr>
                                <td className="blur selectable word-break--all">
                                  { translate('EXCHANGES.DESTINATION_TX_HASH') }
                                </td>
                                <td className="blur selectable word-break--all">
                                  { _cache[_key].outputTransactionHash }
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.ORDER_ID') }
                                </td>
                                <td className="blur selectable word-break--all">
                                  { _cache[_key].orderId }
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  { translate('EXCHANGES.STATUS') }
                                </td>
                                <td>
                                  { _cache[_key].outputTransactionHash ? translate('EXCHANGES.STATUS_COMPLETE') : statusLookup.coinswitch[_cache[_key].status] ? statusLookup.coinswitch[_cache[_key].status] : _cache[_key].status }
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="padding-top-15">
                            <button
                              type="button"
                              className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                              onClick={ () => this.openOrderWindow(_cache[_key].orderId) }>
                              <i className="icon fa-external-link"></i> { translate('EXCHANGES.OPEN_ON') } Coinswitch.co
                            </button>
                          </div>
                        </div>
                      }
                      { this.state.activeTab === 1 &&
                        <div className="tab-pane active">
                          { this.state.depositFetching &&
                            <div className="padding-top-20">{ translate('EXCHANGES.FETCHING_TX_DATA') }...</div>
                          }
                          { !this.state.depositFetching &&
                            this.state.deposit &&
                            <div>
                              <table className="table table-striped">
                                <tbody>
                                  <tr>
                                    <td>{ translate('INDEX.FROM') }</td>
                                    <td className="blur selectable word-break--all">
                                      { this.state.deposit.inputAddresses ? this.state.deposit.inputAddresses[0] : translate('DASHBOARD.NA') }
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>{ translate('INDEX.TO') }</td>
                                    <td className="blur selectable word-break--all">
                                      { isSpv ? this.state.deposit.address : this.state.deposit.details[0] && this.state.deposit.details[0].address || txInfo.address }
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>{ this.capitalizeFirstLetter(translate('TX_INFO.AMOUNT')) }</td>
                                    <td>
                                      { isSpv ? (Number(this.state.deposit.amount) === 0 ? translate('DASHBOARD.UNKNOWN') : Number(this.state.deposit.amount)) : txInfo.amount }
                                    </td>
                                  </tr>
                                  { (isEth || (isSpv && this.state.deposit.amount !== this.state.deposit.fee)) &&
                                    <tr>
                                      <td>{ this.capitalizeFirstLetter(translate('SEND.FEE')) }</td>
                                      <td>
                                        { Number(this.state.deposit.fee) }
                                      </td>
                                    </tr>
                                  }
                                  <tr>
                                    <td>{ this.capitalizeFirstLetter(translate('TX_INFO.CONFIRMATIONS')) }</td>
                                    <td>
                                      { this.state.deposit.confirmations }
                                    </td>
                                  </tr>
                                  { this.state.deposit.blockindex &&
                                    <tr>
                                      <td>{ translate('TX_INFO.BLOCKINDEX') }</td>
                                      <td className="selectable">
                                        { this.state.deposit.blockindex }
                                      </td>
                                    </tr>
                                  }
                                  { this.state.deposit.blockhash &&
                                    <tr>
                                      <td>{ translate('TX_INFO.' + (isSpv ? 'BLOCKHEIGHT' : 'BLOCKHASH')) }</td>
                                      <td className="selectable">
                                        { isSpv ? this.state.deposit.height : this.state.deposit.blockhash }
                                      </td>
                                    </tr>
                                  }
                                  { (this.state.deposit.blocktime || this.state.deposit.timestamp) &&
                                    <tr>
                                      <td>{ translate('TX_INFO.BLOCKTIME') }</td>
                                      <td>
                                        { secondsToString(this.state.deposit.blocktime || this.state.deposit.timestamp) }
                                      </td>
                                    </tr>
                                  }
                                  <tr>
                                    <td>{ translate('TX_INFO.TXID') }</td>
                                    <td className="blur selectable">
                                      { this.state.deposit.txid }
                                    </td>
                                  </tr>
                                  { this.state.deposit.walletconflicts &&
                                    <tr>
                                      <td>{ translate('TX_INFO.WALLETCONFLICTS') }</td>
                                      <td>
                                        { this.state.deposit.walletconflicts.length }
                                      </td>
                                    </tr>
                                  }
                                  <tr>
                                    <td>{ translate('TX_INFO.TIME') }</td>
                                    <td>
                                      { secondsToString(isSpv ? this.state.deposit.blocktime || this.state.deposit.timestamp : this.state.deposit.time) }
                                    </td>
                                  </tr>
                                  { !isEth &&
                                    <tr>
                                      <td>{ translate('TX_INFO.TIMERECEIVED') }</td>
                                      <td>
                                        { secondsToString(isSpv ? this.state.deposit.blocktime : this.state.deposit.timereceived) }
                                      </td>
                                    </tr>
                                  }
                                </tbody>
                              </table>
                              <div className="padding-top-15">
                                <button
                                  type="button"
                                  className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                                  onClick={ () => this.openExplorerWindow(_cache[_key].inputTransactionHash || this.findDeposits(_cache[_key].orderId)[0]) }>
                                  <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', isEth ? 'Etherscan' : _cache[_key].depositCoin.toUpperCase()) }
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={ `modal-backdrop ${this.state.className}` }></div>
      </div>
    );
  } else {
    return null;
  }
};

export default ExchangesOrderInfoModalRender;