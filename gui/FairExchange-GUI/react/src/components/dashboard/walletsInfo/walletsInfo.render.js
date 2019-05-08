import React from 'react';
import translate from '../../../translate/translate';
import { secondsToString } from 'agama-wallet-lib/src/time';
import {
  formatBytes,
  fromSats,
} from 'agama-wallet-lib/src/utils';
import fees from 'agama-wallet-lib/src/fees';
import erc20ContractId from 'agama-wallet-lib/src/eth-erc20-contract-id';

const WalletsInfoRender = function() {
  const _coin = this.props.ActiveCoin.coin;
  const _mode = this.props.ActiveCoin.mode;
  const nativeCoinsParams = this.props.coins.params;

  const renderNativeCoinsParams = (coin) => {
    let _items = [];
    
    if (nativeCoinsParams &&
        nativeCoinsParams[_coin]) {
      for (let i = 0; i < nativeCoinsParams[_coin].length; i++) {
        _items.push(
          <div key={ `native-launch-params-${i}` }>{ nativeCoinsParams[_coin][i] }</div>
        );
      }
    }

    return _items;
  };

  if (_mode === 'native') {
    const _progress = this.props.ActiveCoin.progress;
    const _netTotals = this.props.ActiveCoin.net.totals;
    const _netPeers = this.props.ActiveCoin.net.peers;
    let _peerItems = [];

    if (_netPeers) {
      for (let i = 0; i < _netPeers.length; i++) {
        _peerItems.push(
          <table
            key={ `native-net-peers-${i}` }
            className="table table-striped">
            <tbody>
              <tr>
                <td>{ _netPeers[i].id }</td>
                <td></td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.ADDRESS') }</td>
                <td className="selectable">
                  { _netPeers[i].addr }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.ADDRESS_LOCAL') }</td>
                <td className="selectable">
                  { _netPeers[i].addrlocal }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.SERVICES') }</td>
                <td>
                  { _netPeers[i].services }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.VERSION') }</td>
                <td>
                  { _netPeers[i].version }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.SUBVERSION') }</td>
                <td>
                  { _netPeers[i].subver }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.WHITELISTED') }</td>
                <td>
                  { translate('INDEX' + (_netPeers[i].whitelisted ? 'TRUE_SM' : 'FALSE_SM')) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.INBOUND') }</td>
                <td>
                  { translate('INDEX' + (_netPeers[i].inbound ? 'TRUE_SM' : 'FALSE_SM')) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.TIME_OFFSET') }</td>
                <td>
                  { _netPeers[i].timeoffset }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.PING_TIME') }</td>
                <td>
                  { _netPeers[i].pingtime }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.CONNECTION_TIME') }</td>
                <td>
                  { secondsToString(_netPeers[i].conntime) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.LAST_SEND') }</td>
                <td>
                  { secondsToString(_netPeers[i].lastsend) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.LAST_RECEIVED') }</td>
                <td>
                  { secondsToString(_netPeers[i].lastrecv) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.DATA_SENT') }</td>
                <td>
                  { formatBytes(_netPeers[i].bytessent) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.DATA_RECEIVED') }</td>
                <td>
                  { formatBytes(_netPeers[i].bytesrecv) }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.BAN_SCORE') }</td>
                <td>
                  { _netPeers[i].banscore }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.STARTING_HEIGHT') }</td>
                <td>
                  { _netPeers[i].startingheight }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.SYNCED_HEADERS') }</td>
                <td>
                  { _netPeers[i].synced_headers }
                </td>
              </tr>
              <tr>
                <td>{ translate('WALLETS_INFO.SYNCED_BLOCKS') }</td>
                <td>
                  { _netPeers[i].synced_blocks }
                </td>
              </tr>
              <tr>
                <td className="bg--white">&nbsp;</td>
                <td className="bg--white">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        );
      }
    }

    return (
      <div>
        <div className="col-xlg-6 col-md-4">
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">{ translate('INDEX.WALLET_INFO') }</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <tbody>
                  <tr>
                    <td>{ translate('INDEX.WALLET_VERSION') }</td>
                    <td>
                      { _progress.walletversion }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.BALANCE') }</td>
                    <td>
                      { _progress.balance }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.UNCONFIRMED_BALANCE') }</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.IMMATURE_BALANCE') }</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.TOTAL_TX_COUNT') }</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">{ translate('WALLETS_INFO.NETWORK_TOTALS') }</h3>
            </div>
            <div className="table-responsive">
              { _netTotals &&
                _netTotals.timemillis &&
                _netTotals.totalbytesrecv &&
                _netTotals.totalbytessent &&
                <table className="table table-striped">
                  <tbody>
                    <tr>
                      <td>{ translate('WALLETS_INFO.TIME') }</td>
                      <td>
                        { secondsToString(_netTotals.timemillis, true) }
                      </td>
                    </tr>
                    <tr>
                      <td>{ translate('WALLETS_INFO.DATA_RECEIVED') }</td>
                      <td>
                        { formatBytes(_netTotals.totalbytesrecv) }
                      </td>
                    </tr>
                    <tr>
                      <td>{ translate('WALLETS_INFO.DATA_SENT') }</td>
                      <td>
                        { formatBytes(_netTotals.totalbytessent) }
                      </td>
                    </tr>
                  </tbody>
                </table>
              }
              { !_netTotals &&
                <div>{ translate('WALLETS_INFO.LOADING') }</div>
              }
            </div>
          </div>
        </div>
        <div className="col-xlg-6 col-md-8">
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">
                { _coin === 'KMD' ? 'Komodo' : _coin }&nbsp;
                { translate('INDEX.INFO') }
              </h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <tbody>
                  <tr>
                    <td>{ translate('INDEX.VERSION') }</td>
                    <td>
                      { _progress.KMDversion }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.PROTOCOL_VERSION') }</td>
                    <td>
                      { _progress.protocolversion }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.NOTARIZED') }</td>
                    <td>
                      { _progress.notarized }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      { translate('INDEX.NOTARIZED') } { translate('INDEX.HASH') }
                    </td>
                    <td className="selectable">
                      { _progress.notarizedhash ?
                        _progress.notarizedhash.substring(
                          0,
                          Math.floor(_progress.notarizedhash.length / 2)
                        ) +
                        '\t' +
                        _progress.notarizedhash.substring(
                          Math.floor(_progress.notarizedhash.length / 2),
                          _progress.notarizedhash.length
                        )
                        : ''
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      { translate('INDEX.NOTARIZED') } BTC
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.BLOCKS') }</td>
                    <td>
                      { _progress.blocks }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.CONNECTIONS') }</td>
                    <td>
                      { _progress.connections }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.DIFFICULTY') }</td>
                    <td>
                      { _progress.difficulty }
                    </td>
                  </tr>
                  <tr>
                    <td>Testnet</td>
                    <td>
                      { _progress.testnet }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.PAY_TX_FEE') }</td>
                    <td className="selectable">
                      { _progress.paytxfee }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.RELAY_FEE') }</td>
                    <td>
                      { _progress.relayfee }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.ERRORS') }</td>
                    <td className="selectable">
                      { _progress.errors }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.LAUNCH_PARAMS') }</td>
                    <td className="selectable">
                      <button
                        className="btn btn-default btn-xs clipboard-edexaddr copy-native-params-btn"
                        title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                        onClick={ this.copyParams }>
                        <i className="icon wb-copy"></i> { `${translate('INDEX.COPY')} ${translate('INDEX.LAUNCH_PARAMS').toLowerCase()}` }
                      </button>
                      { renderNativeCoinsParams() }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xlg-12 col-md-12">
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">
                { translate('WALLETS_INFO.PEERS') }
              </h3>
            </div>
            { !_netPeers &&
              <div>{ translate('WALLETS_INFO.LOADING') }</div>
            }
            { _netPeers &&
              <div className="table-responsive">
                { _peerItems }
              </div>
            }
          </div>
        </div>
      </div>
    );
  } else if (_mode === 'spv') {
    const _balance = this.props.ActiveCoin.balance;
    const _server = this.props.Dashboard.electrumCoins[_coin];

    return (
      <div>
        <div className="col-xlg-6 col-md-6">
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">{ translate('INDEX.WALLET_INFO') }</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <tbody>
                  <tr>
                    <td>{ translate('INDEX.SPV_SERVER_IP') }</td>
                    <td className="selectable">
                      { _server.server.ip }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.SPV_SERVER_PORT') }</td>
                    <td className="selectable">
                      { _server.server.port }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.SPV_SERVER_CON_TYPE') }</td>
                    <td className="selectable">
                      { _server.server.proto }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.PAY_TX_FEE') }</td>
                    <td>
                      { fromSats(_server.txfee) } ({ _server.txfee } sats)
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.BALANCE') }</td>
                    <td>
                      { _balance.balance }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.UNCONFIRMED_BALANCE') }</td>
                    <td>
                      { _balance.unconfirmed }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (_mode === 'eth') {
    const _balance = this.props.ActiveCoin.balance;
    const _server = this.props.Dashboard.ethereumCoins[_coin];

    return (
      <div>
        <div className="col-xlg-6 col-md-6">
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">{ translate('INDEX.WALLET_INFO') }</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <tbody>
                  { !erc20ContractId[_coin] &&
                    <tr>
                      <td>{ translate('INDEX.GAS_LIMIT') }</td>
                      <td className="selectable">
                        { fees[_coin.toLowerCase()] }
                      </td>
                    </tr>
                  }
                  <tr>
                    <td>{ translate('INDEX.NETWORK') }</td>
                    <td className="selectable">
                      { _server.network }
                    </td>
                  </tr>
                  <tr>
                    <td>{ translate('INDEX.BALANCE') }</td>
                    <td>
                      { _balance.balance }
                    </td>
                  </tr>
                  {/*<tr>
                    <td>{ translate('INDEX.UNCONFIRMED_BALANCE') }</td>
                    <td>
                      { _balance.unconfirmed }
                    </td>
                  </tr>*/}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default WalletsInfoRender;