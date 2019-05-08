import React from 'react';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import ReactTable from 'react-table';
import TablePaginationRenderer from '../pagination/pagination';
import { formatValue } from 'agama-wallet-lib/src/utils';
import Config from '../../../config';
import Spinner from '../spinner/spinner';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import { tableSorting } from '../pagination/utils';
import dpowCoins from 'agama-wallet-lib/src/electrum-servers-dpow';

const kvCoins = {
  'KV': true,
  'BEER': true,
  'PIZZA': true,
};

export const TxConfsRender = function(tx) {
  if (Number(tx.confirmations) > -1) {
    return (
      <span>
        { dpowCoins.indexOf(this.props.ActiveCoin.coin) > -1 &&
          tx.hasOwnProperty('rawconfirmations') &&
          tx.confirmations !== tx.rawconfirmations &&
          <span>
            <span
              data-tip={ `${translate('INDEX.RAW_CONFS')}: ${tx.rawconfirmations}` }
              data-for="txHistoryDpowRawConf">
              { tx.confirmations }
            </span>
            <ReactTooltip
              id="txHistoryDpowRawConf"
              effect="solid"
              className="text-left" />
          </span>
        }
        { (dpowCoins.indexOf(this.props.ActiveCoin.coin) === -1 || !tx.hasOwnProperty('rawconfirmations') || (tx.hasOwnProperty('rawconfirmations') && tx.confirmations === tx.rawconfirmations)) &&
          <span>{ tx.confirmations }</span>
        }
        { dpowCoins.indexOf(this.props.ActiveCoin.coin) > -1 &&
          ((this.props.ActiveCoin.mode === 'spv' && tx.hasOwnProperty('dpowSecured') && tx.dpowSecured) ||
           (this.props.ActiveCoin.mode === 'native' && tx.hasOwnProperty('rawconfirmations') && tx.confirmations >=2)) &&
          <span>
            <i
              className="icon fa-shield margin-left-10"
              data-tip={ translate('INDEX.THIS_TX_IS_SECURED_WITH_DPOW') } 
              data-for="txHistoryDpow"></i>
            <ReactTooltip
              id="txHistoryDpow"
              effect="solid"
              className="text-left" />
          </span>
        }
      </span>
    );
  } else if (
    this.props.ActiveCoin.mode === 'native' &&
    staticVar.chainParams &&
    staticVar.chainParams[this.props.ActiveCoin.coin] &&
    staticVar.chainParams[this.props.ActiveCoin.coin].ac_private
  ) {
    return (
      <span>{ translate('DASHBOARD.NA') }</span>
    );
  } else {
    return (
      <span>
        <i
          className="icon fa-warning color-warning margin-right-5"
          data-tip={ translate('DASHBOARD.FAILED_TX_INFO') }
          data-for="txHistory1"></i>
        <ReactTooltip
          id="txHistory1"
          effect="solid"
          className="text-left" />
      </span>
    );
  }
}

export const AddressTypeRender = function() {
  return (
    <span>
      <span className="label label-default">
        <i className="icon fa-eye"></i>&nbsp;
        { translate('IAPI.PUBLIC_SM') }
      </span>
    </span>
  );
};

export const TransactionDetailRender = function(transactionIndex) {
  return (
    <button
      type="button"
      className="btn btn-xs white btn-info waves-effect waves-light btn-kmdtxid"
      onClick={ () => this.toggleTxInfoModal(!this.props.ActiveCoin.showTransactionInfo, transactionIndex) }>
      <i className="icon fa-search"></i>
    </button>
  );
};

export const AddressRender = function(address) {
  if (!address) {
    return (
      <span>
        <span className="label label-dark">
          { translate('DASHBOARD.ZADDR_NOT_LISTED') }
        </span>
      </span>
    );
  }

  if (this.props.AddressBook &&
      this.props.AddressBook.obj &&
      this.props.AddressBook.obj[address]) {
    address = this.props.AddressBook.obj[address].title;
  }

  return (
    <span className="blur">{ address }</span>
  );
};

export const AddressItemRender = function(address, type, amount, coin) {
  let _address = address;
  
  if (this.props.AddressBook &&
      this.props.AddressBook.obj &&
      this.props.AddressBook.obj[address]) {
    _address = this.props.AddressBook.obj[address].title;
  }

  return (
    <li
      key={ address }
      className={ address === this.state.currentAddress ? 'selected' : '' }>
      <a onClick={ () => this.updateAddressSelection(address) }>
        <i className={ 'icon fa-eye' + (type === 'public' ? '' : '-slash') }></i>&nbsp;&nbsp;
        <span className="text">
          [ { amount } { coin } ]  <span className="selectable">{ _address }</span>
        </span>
        <span className="glyphicon glyphicon-ok check-mark"></span>
      </a>
    </li>
  );
};

export const AddressListRender = function() {
  const _addresses = this.props.ActiveCoin.addresses;
  const isMultiPublicAddress = _addresses && _addresses.public && _addresses.public.length > 1;
  const isMultiPrivateAddress = _addresses && _addresses.private && _addresses.private.length > 1;

  if (isMultiPublicAddress ||
      isMultiPrivateAddress) {
    return (
      <div className={ `btn-group bootstrap-select form-control form-material showkmdwalletaddrs show-tick margin-bottom-10${(this.state.addressSelectorOpen ? ' open ' : '')}` }>
        <button
          type="button"
          className="btn dropdown-toggle btn-info"
          data-tip={ translate('KMD_NATIVE.SELECT_ADDRESS') }
          data-for="txHistory2"
          onClick={ this.openDropMenu }>
          <span className="filter-option pull-left">{ this.renderSelectorCurrentLabel() } </span>&nbsp;
          <span className="bs-caret">
            <span className="caret"></span>
          </span>
        </button>
        <ReactTooltip
          id="txHistory2"
          effect="solid"
          className="text-left" />
        <div className="dropdown-menu open">
          <ul className="dropdown-menu inner">
            <li className="no--hover">
              <a><span className="text">{ translate('KMD_NATIVE.SELECT_ADDRESS') }</span></a>
            </li>
            <li className={ !this.state.currentAddress ? 'selected' : '' }>
              <a onClick={ () => this.updateAddressSelection('') }>
                <span className="text">{ translate('INDEX.ALL') }</span>
                <span className="glyphicon glyphicon-ok check-mark"></span>
              </a>
            </li>
            { this.renderAddressByType('public') }
          </ul>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export const TxTypeRender = function(category) {
  if (category === 'send' ||
      category === 'sent') {
    return (
      <span className="label label-danger">
        <i className="icon fa-arrow-circle-left"></i> <span>{ translate('DASHBOARD.OUT') }</span>
      </span>
    );
  } else if (
    category === 'receive' ||
    category === 'received'
  ) {
    return (
      <span className="label label-success">
        <i className="icon fa-arrow-circle-right"></i> <span>{ translate('DASHBOARD.IN') }</span>
      </span>
    );
  } else if (category === 'generate') {
    return (
      <span>
        <i className="icon fa-cogs"></i> <span>{ translate('DASHBOARD.MINED') }</span>
      </span>
    );
  } else if (category === 'immature') {
    return (
      <span>
        <i className="icon fa-clock-o"></i> <span>{ translate('DASHBOARD.IMMATURE') }</span>
      </span>
    );
  } else if (category === 'unknown') {
    return (
      <span>
        <i className="icon fa-meh-o"></i> <span>{ translate('DASHBOARD.UNKNOWN') }</span>
      </span>
    );
  } else if (category === 'self') {
    return (
      <span className="label label-info self-send">
        <span>{ translate('INDEX.SELF_SM') }</span>
      </span>
    );
  }
};

export const TxAmountRender = function(tx) {
  if (Config.roundValues) {
    return (
      <span>
        <span
          data-for="txHistory3"
          data-tip={ tx.amount }>
          { this.props.ActiveCoin.mode === 'eth' ? formatValue(tx.amount) : Math.abs(tx.interest) !== Math.abs(tx.amount) ? formatValue(tx.amount) || translate('DASHBOARD.UNKNOWN') : '' }
          { tx.interest &&
            <span
              className="tx-interest"
              data-for="txHistory4"
              data-tip={ `${translate('DASHBOARD.SPV_CLAIMED_INTEREST')} ${formatValue(Math.abs(tx.interest))}` }>
              +{ formatValue(Math.abs(tx.interest)) }
            </span>
          }
          <ReactTooltip
            id="txHistory4"
            effect="solid"
            className="text-left" />
        </span>
        <ReactTooltip
          id="txHistory4"
          effect="solid"
          className="text-left" />
        { tx.vinLen > tx.vinMaxLen &&
          <i
            className="icon fa-question tx-history-vin-len-err"
            data-tip={ translate('INDEX.SPV_TX_VIN_COUNT_WARN') }
            data-html={ true }
            data-for="txHistory5"></i>
        }
        <ReactTooltip
          id="txHistory5"
          effect="solid"
          className="text-left" />
      </span>
    );
  }

  return (
    <span>
      { this.props.ActiveCoin.mode === 'eth' ? formatValue(tx.amount) : Math.abs(tx.interest) !== Math.abs(tx.amount) ? (Number(tx.amount) || translate('DASHBOARD.UNKNOWN')) : '' }
      { tx.interest &&
        <span
          className="tx-interest"
          data-for="txHistory6"
          data-tip={ `${translate('DASHBOARD.SPV_CLAIMED_INTEREST')} ${Math.abs(Number(tx.interest))}` }>
          +{ Math.abs(Number(tx.interest)) }
        </span>
      }
      <ReactTooltip
        id="txHistory6"
        effect="solid"
        className="text-left" />
      { tx.vinLen > tx.vinMaxLen &&
        <i
          className="icon fa-question tx-history-vin-len-err"
          data-for="txHistory7"
          data-tip={ translate('INDEX.SPV_TX_VIN_COUNT_WARN') }
          data-html={ true }></i>
      }
      <ReactTooltip
        id="txHistory7"
        effect="solid"
        className="text-left" />
    </span>
  );
};

export const TxHistoryListRender = function() {
  const _activeCoin = this.props.ActiveCoin.coins[mainWindow.activeCoin];
  let _data;

  if (_activeCoin &&
      _activeCoin.txhistory &&
      !this.state.searchTerm) {
    _data = this.props.ActiveCoin.txhistory || _activeCoin;
  }

  _data = _data || this.state.filteredItemsList;

  if (typeof _data === 'string' &&
      typeof this.state.itemsList === 'object') {
    _data = this.state.itemsList;
  }

  return (
    <ReactTable
      data={ _data }
      columns={ this.state.itemsListColumns }
      minRows="0"
      sortable={ true }
      className="-striped -highlight"
      PaginationComponent={ TablePaginationRenderer }
      nextText={ translate('INDEX.NEXT_PAGE') }
      previousText={ translate('INDEX.PREVIOUS_PAGE') }
      showPaginationBottom={ this.state.showPagination }
      pageSize={ this.state.pageSize }
      defaultSortMethod={ this.tableSorting }
      defaultSorted={[{ // default sort
        id: 'timestamp',
        desc: true,
      }]}
      onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
  );
};

export const WalletsDataRender = function() {
  const _balance = this.props.ActiveCoin.balance;
  const _txhistory = this.props.ActiveCoin.txhistory;

  return (
    <span>
      <div id="edexcoin_dashboardinfo">
        { (this.displayClaimInterestUI() === 777 || this.displayClaimInterestUI() === -777) &&
          <div className="col-xs-12 margin-top-20 backround-gray">
            <div className="panel no-margin">
              <div>
                <div className="col-xlg-12 col-lg-12 col-sm-12 col-xs-12">
                  <div className="panel no-margin padding-top-10 padding-bottom-10 center">
                    { this.displayClaimInterestUI() === 777 &&
                      <div>
                        { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_P1') } <strong>{ _balance.interest }</strong> KMD { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_P2') }.
                        <button
                          type="button"
                          className="btn btn-success waves-effect waves-light dashboard-claim-interest-btn"
                          onClick={ this.openClaimInterestModal }>
                          <i className="icon fa-dollar"></i> { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_P3') }
                        </button>
                        { this.props.ActiveCoin &&
                          _balance &&
                          _balance.utxoIssues &&
                          <i
                            data-tip={ translate('DASHBOARD.KMD_UTXO_ISSUES') }
                            data-html={ true }
                            data-for="txHistory8"
                            className="fa-exclamation-circle red dashboard-utxo-issues-icon"></i>
                        }
                        <ReactTooltip
                          id="txHistory8"
                          effect="solid"
                          className="text-left" />
                      </div>
                    }
                    { this.displayClaimInterestUI() === -777 &&
                      <div>
                        { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_ALT_P1') }.
                        <button
                          type="button"
                          className="btn btn-success waves-effect waves-light dashboard-claim-interest-btn"
                          onClick={ this.openClaimInterestModal }>
                          <i className="icon fa-search"></i> { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_ALT_P2') }
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <div className="col-xs-12 margin-top-20 backround-gray">
          <div className="panel nav-tabs-horizontal">
            <div>
              <div className="col-xlg-12 col-lg-12 col-sm-12 col-xs-12">
                <div className="panel">
                  <header className="panel-heading z-index-10">
                    { this.state.loading &&
                      <span className="spinner--small">
                        <Spinner />
                      </span>
                    }
                    { !this.state.loading &&
                      <i
                        className="icon fa-refresh manual-txhistory-refresh pointer"
                        onClick={ this.refreshTxHistory }></i>
                    }
                    <h4 className="panel-title">{ !this.state.kvView ? translate('INDEX.TRANSACTION_HISTORY') : translate('KV.KV_HISTORY') }</h4>
                    { this.props.ActiveCoin.mode === 'spv' &&
                      Config.experimentalFeatures &&
                      kvCoins[this.props.ActiveCoin.coin] &&
                      <button
                        type="button"
                        className="btn btn-default btn-switch-kv"
                        onClick={ this.toggleKvView }>
                        { translate('KV.' + (!this.state.kvView ? 'KV_VIEW' : 'TX_VIEW')) }
                      </button>
                    }
                  </header>
                  <div className="panel-body">
                    <div className="row padding-bottom-30 padding-top-10">
                      { _txhistory !== 'loading' &&
                        _txhistory !== 'no data' &&
                        _txhistory !== 'connection error' &&
                        _txhistory !== 'connection error or incomplete data' &&
                        _txhistory !== 'cant get current height' &&
                        !this.state.kvView &&
                        <div className="col-sm-4 search-box">
                          <input
                            className="form-control"
                            onChange={ e => this.onSearchTermChange(e.target.value) }
                            placeholder={ translate('DASHBOARD.SEARCH') } />
                        </div>
                      }
                    </div>
                    <div className="row txhistory-table">
                      { this.renderTxHistoryList() }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </span>
  );
};