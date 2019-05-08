import React from 'react';
import translate from '../../../translate/translate';
import Spinner from '../spinner/spinner';
import ReactTooltip from 'react-tooltip';
const { secondsElapsedToString } = require('agama-wallet-lib/src/time');

export const _ClaimInterestTableRender = function() {
  const _transactionsList = this.state.transactionsList;
  let _items = [];

  for (let i = 0; i < _transactionsList.length; i++) {
    if ((_transactionsList[i].interest === 0 && this.state.showZeroInterest) ||
        (_transactionsList[i].amount > 0 && _transactionsList[i].interest > 0)) {
      _items.push(
        <tr key={ `${_transactionsList[i].txid}-${_transactionsList[i].address}-${i}` }>
          <td>
            <button
              className="btn btn-default btn-xs clipboard-edexaddr copy-string-btn"
              title={ translate('INDEX.COPY_TO_CLIPBOARD') }
              onClick={ () => this.copyTxId(_transactionsList[i].txid) }>
              <i className="icon wb-copy"></i> { `${translate('INDEX.COPY')} TXID` }
            </button>
          </td>
          <td className="blur selectable">{ _transactionsList[i].address }</td>
          <td className={ _transactionsList[i].amount < 10 || (this.props.ActiveCoin.mode === 'spv' && !_transactionsList[i].interestRulesCheckPass) ? 'red bold' : 'green bold' }>
          { _transactionsList[i].amount }
          </td>
          <td>{ _transactionsList[i].interest }</td>
          <td className="locktime center">
            { _transactionsList[i].locktime > 0 &&
              <i
                data-tip={ `${translate('CLAIM_INTEREST.LOCKTIME_IS_SET_TO')} ${_transactionsList[i].locktime}` }
                data-for="claimInterest"
                className="fa-check-circle green"></i>
            }
            { (!_transactionsList[i].locktime || (_transactionsList[i].locktime && _transactionsList[i].locktime === 0)) &&
              <i
                data-tip={ translate('CLAIM_INTEREST.LOCKTIME_IS_UNSET') }
                data-for="claimInterest"
                className="fa-exclamation-circle red"></i>
            }
            <ReactTooltip
              id="claimInterest"
              effect="solid"
              className="text-left" />
          </td>
          { this.props.ActiveCoin.mode === 'spv' &&
            <td
              data-tip={ translate('CLAIM_INTEREST.ACTUAL_LOCKTIME_SEC') + secondsElapsedToString(_transactionsList[i].timeElapsedFromLocktimeInSeconds, true) }
              data-for="claimInterestLocktimeActual"
              className="time">
              { secondsElapsedToString(_transactionsList[i].timeElapsedFromLocktimeInSeconds - 777, true) }
              <ReactTooltip
                id="claimInterestLocktimeActual"
                effect="solid"
                className="text-left" />
            </td>
          }
          { this.props.ActiveCoin.mode === 'spv' &&
            <td className="time">
              { !_transactionsList[i].timeTill1MonthInterestStopsInSeconds ? translate('CLAIM_INTEREST.NEED_TO_CLAIM') : secondsElapsedToString(_transactionsList[i].timeTill1MonthInterestStopsInSeconds, true) }
            </td>
          }
        </tr>
      );
    }
  }

  return (
    <span>
      <div>
        <p>
          <strong>{ translate('CLAIM_INTEREST.REQ_P1') }:</strong> { translate('CLAIM_INTEREST.REQ_P2') } <strong>10 KMD</strong>
        </p>
        <p>
          <strong>{ translate('CLAIM_INTEREST.TIP') } #1:</strong> { translate('CLAIM_INTEREST.TIP_DESC') }
        </p>
        <p>
          <strong>{ translate('CLAIM_INTEREST.TIP') } #2:</strong> { translate('CLAIM_INTEREST.MONTHLY_CLAIMING_TIP') }
        </p>
        { this.props.ActiveCoin &&
          this.props.ActiveCoin.mode === 'native' &&
          <p>
            <strong>{ translate('CLAIM_INTEREST.NOTICE') }:</strong> { translate('CLAIM_INTEREST.NATIVE_INTEREST_CHANGE_DESC') }
          </p>
        }
        <p>
          <strong>{ translate('CLAIM_INTEREST.CLAIM_INTEREST_FEE') }:</strong> { this.props.ActiveCoin.mode === 'native' ? '0.0001' : '0.0002' } KMD ({ this.props.ActiveCoin.mode === 'native' ? '10000' : '20000' } sats).
        </p>
      </div>
      { this.state.totalInterest > 0 &&
        <div className={ 'text-left padding-bottom-20' + (this.state.displayShowZeroInterestToggle ? ' padding-top-40' : '') }>
          { this.state.displayShowZeroInterestToggle &&
            <span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={ this.state.showZeroInterest }
                  readOnly />
                <div
                  className="slider"
                  onClick={ this.toggleZeroInterest }></div>
              </label>
              <div
                className="toggle-label margin-right-15 pointer"
                onClick={ this.toggleZeroInterest }>
                { translate('CLAIM_INTEREST.SHOW_ZERO_INTEREST') }
              </div>
            </span>
          }
          { !this.state.spvVerificationWarning &&
            <button
              type="button"
              className="btn btn-success waves-effect waves-light claim-btn"
              onClick={ () => this.claimInterest() }
              disabled={ this.state.spvPreflightSendInProgress }>
              { !this.state.spvPreflightSendInProgress &&
                <i className="icon fa-dollar margin-right-5"></i>
              }
              { !this.state.spvPreflightSendInProgress &&
                <span>{ translate('CLAIM_INTEREST.CLAIM_INTEREST', `${Number((this.state.totalInterest).toFixed(8))} KMD `) }</span>
              }
              { this.state.spvPreflightSendInProgress &&
                <span>{ translate('SEND.SPV_VERIFYING') }...</span>
              }
            </button>
          }
          { this.state.spvVerificationWarning &&
            <div className="padding-top-10 padding-bottom-10 fs-15">
              <strong className="color-warning">{ translate('SEND.WARNING') }:</strong> { translate('SEND.WARNING_SPV_P1') } { translate('SEND.WARNING_SPV_P2') }
              <div className="margin-top-15">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={ this.confirmClaimInterest }>
                  { translate('INDEX.CONFIRM') }
                </button>
                <button
                  type="button"
                  className="btn btn-primary margin-left-15"
                  onClick={ this.cancelClaimInterest }>
                  { translate('LOGIN.CANCEL') }
                </button>
              </div>
            </div>
          }
          { this.props.ActiveCoin.mode === 'native' &&
            this.state.addressses &&
            Object.keys(this.state.addressses).length > 0 &&
            <div className="margin-top-40 margin-bottom-20">
              <div className="margin-bottom-5">{ translate('CLAIM_INTEREST.SEND_MY_BALANCE_TO') }</div>
              { this.addressDropdownRender() }
            </div>
          }
          { this.props.ActiveCoin &&
            this.props.ActiveCoin.mode === 'native' &&
            (!this.isFullySynced() || !navigator.onLine) &&
            <div className="col-lg-12 padding-top-5 padding-bottom-35 send-coin-sync-warning no-padding-left">
              <i className="icon fa-warning color-warning margin-right-5"></i> <span className="desc">{ translate('SEND.SEND_NATIVE_SYNC_WARNING') }</span>
            </div>
          }
        </div>
      }
      <div className="table-scroll">
        <table className="table table-hover dataTable table-striped">
          <thead>
            <tr>
              <th></th>
              <th>{ translate('INDEX.ADDRESS') }</th>
              <th>{ translate('INDEX.AMOUNT') }</th>
              <th>{ translate('INDEX.INTEREST') }</th>
              <th>{ translate('TOOLS.LOCKTIME') }</th>
              { this.props.ActiveCoin.mode === 'spv' &&
                <th className="time">{ translate('CLAIM_INTEREST.TIME_SINCE_LOCKTIME') }</th>
              }
              { this.props.ActiveCoin.mode === 'spv' &&
                <th className="time">{ translate('CLAIM_INTEREST.TIME_TILL_REWARDS_STOP') }</th>
              }
            </tr>
          </thead>
          <tbody>
          { _items }
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th>{ translate('INDEX.ADDRESS') }</th>
              <th>{ translate('INDEX.AMOUNT') }</th>
              <th>{ translate('INDEX.INTEREST') }</th>
              <th>{ translate('TOOLS.LOCKTIME') }</th>
              { this.props.ActiveCoin.mode === 'spv' &&
                <th className="time">{ translate('CLAIM_INTEREST.TIME_SINCE_LOCKTIME') }</th>
              }
              { this.props.ActiveCoin.mode === 'spv' &&
                <th className="time">{ translate('CLAIM_INTEREST.TIME_TILL_REWARDS_STOP') }</th>
              }
            </tr>
          </tfoot>
        </table>
      </div>
    </span>
  );
};

export const ClaimInterestModalRender = function() {
  return (
    <span onClick={ this.closeDropMenu }>
      <div className={ `modal modal-claim-interest modal-3d-sign ${this.state.className}` }>
        <div
          onClick={ this.closeModal }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-sm">
          <div
            onClick={ this.closeModal }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.closeModal }>
                <span>×</span>
              </button>
              <h4 className="modal-title white text-left">{ translate('CLAIM_INTEREST.CLAIM_INTEREST', ' ') }</h4>
            </div>
            <div className="modal-body">
              { this.state.loading &&
                <span className="spinner--medium">
                  <Spinner />
                </span>
              }
              { !this.state.loading &&
                <i
                  className="icon fa-refresh pointer refresh-icon"
                  onClick={ this.loadListUnspent }></i>
              }
              <div className={ 'animsition vertical-align ' + (this.state.open ? 'fade-in' : 'fade-out') }>
                <div className="page-content vertical-align-middle full-width">
                  { this.state.isLoading &&
                    <span>{ translate('INDEX.LOADING') }...</span>
                  }
                  { !this.state.isLoading &&
                    this.checkTransactionsListLength() &&
                    <div>{ this.claimInterestTableRender() }</div>
                  }
                  { !this.state.isLoading &&
                    !this.checkTransactionsListLength() &&
                    <div>{ translate('INDEX.NO_DATA') }</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </span>
  );
};