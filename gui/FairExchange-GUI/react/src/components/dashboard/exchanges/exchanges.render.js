import React from 'react';
import translate from '../../../translate/translate';
import mainWindow from '../../../util/mainWindow';
import ReactTooltip from 'react-tooltip';
import Config from '../../../config';
import {
  formatValue,
  sort,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import ExchangesOrderInfoModal from '../exchangesOrderInfoModal/exchangesOrderInfoModal';
import Select from 'react-select';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import SendCoin from '../sendCoin/sendCoin';
import ExchangesTOSModal from '../exchangesTOSModal/exchangesTOSModal';
import ExchangesSupportedCoinsModal from '../exchangesSupportedCoinsModal/exchangesSupportedCoinsModal';

const statusLookup = {
  coinswitch: {
    timeout: translate('EXCHANGES.STATUS_EXPIRED'),
    no_deposit: translate('EXCHANGES.STATUS_AWAITING_DEPOSIT'),
    confirming: translate('EXCHANGES.STATUS_CONFIRMING'),
    exchanging: translate('EXCHANGES.STATUS_EXCHANGING'),
    sending: translate('EXCHANGES.STATUS_SENDING'),
  },
};

export const RenderNewOrderForm = function() {  
  return (
    <section className="exchanges-new-order-form">
      { this.state.newExchangeOrderDetails.step === 0 &&
        this.props.Main.coins &&
        this.props.Main.coins.spv.length > 1 &&
        <div className="step1">
          <h3 className="padding-left-15">{ translate('EXCHANGES.EXCHANGE_ORDER_DETAILS') }</h3>
          <a
            className="pointer supported-coins-btn"
            onClick={ this._toggleExchangesSupportedCoinsModal }>{ translate('EXCHANGES.SUPPORTED_COINS') }</a>
          <ExchangesSupportedCoinsModal />
          <div className="col-sm-12 padding-top-10 coin-send-form">
            <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
              <div className="steps row margin-top-10">
                <div className="step col-md-4 current">
                  <span className="step-number">1</span>
                  <div className="step-desc">
                    <span className="step-title">{ translate('EXCHANGES.FILL_ORDER_FORM') }</span>
                    <p>{ translate('EXCHANGES.FILL_EXCHANGE_ORDER_DETAILS') }</p>
                  </div>
                </div>
                <div className="step col-md-4">
                  <span className="step-number">2</span>
                  <div className="step-desc">
                    <span className="step-title">{ translate('EXCHANGES.CONFIRMING') }</span>
                    <p>{ translate('EXCHANGES.CONFIRM_IF_DETAILS_ARE_CORRECT') }</p>
                  </div>
                </div>
                <div className="step col-md-4">
                  <span className="step-number">3</span>
                  <div className="step-desc">
                    <span className="step-title">{ translate('EXCHANGES.PROCESSING') }</span>
                    <p>{ translate('EXCHANGES.PROCESSING_AND_SHOWING_DETAILS') }</p>
                  </div>
                </div>
              </div>
            </div>
            { this.state.newExchangeOrderDetails.orderStep === 0 &&
              <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="panel">
                  <div className="panel-body">
                    <div className="row">
                      <button
                        type="button"
                        className="btn btn-primary waves-effect waves-light pull-right hide"
                        onClick={ this.loadTestData }>
                        Load test data
                      </button>
                      <div className="col-lg-12 form-group form-material">
                        <a
                          className="pointer exchange-order-clear"
                          onClick={ this.clearOrder }>{ translate('EXCHANGES.CLEAR') }</a>
                        <label
                          className="control-label select"
                          htmlFor="newExchangeOrderDetailsCoinSrc">
                          { translate('EXCHANGES.SOURCE') }
                        </label>
                        <Select
                          id="newExchangeOrderDetailsCoinSrc"
                          name="newExchangeOrderDetails-coinSrc"
                          value={ this.state.newExchangeOrderDetails.coinSrc }
                          onChange={ (event) => this.updateSelectedCoin(event, 'src') }
                          optionRenderer={ this.renderCoinOption }
                          valueRenderer={ this.renderCoinOption }
                          options={ addCoinOptionsCrypto(this.coinsSrcList || this.props.Main.coins, true, true) } />
                      </div>
                      <div className="col-lg-12 form-group form-material">
                        <label
                          className="control-label select"
                          htmlFor="newExchangeOrderDetailsCoinDest">
                          { translate('EXCHANGES.DESTINATION') }
                        </label>
                        <Select
                          id="newExchangeOrderDetailsCoinDest"
                          name="newExchangeOrderDetails-coinDest"
                          value={ this.state.newExchangeOrderDetails.coinDest }
                          onChange={ (event) => this.updateSelectedCoin(event, 'dest') }
                          optionRenderer={ this.renderCoinOption }
                          valueRenderer={ this.renderCoinOption }
                          options={ addCoinOptionsCrypto(this.coinsDestList || this.props.Main.coins, true, true) } />
                      </div>
                      <div className="col-lg-12 form-material text-right">
                        <span className={ 'pointer buy-fixed-dest-coin-toggle' + (this.state.newExchangeOrderDetails.coinSrc ? '' : ' disabled') }>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={ this.state.buyFixedDestCoin }
                              readOnly />
                            <div
                              className="slider"
                              onClick={ () => this.toggleBuyFixedDestCoin() }></div>
                          </label>
                          <div
                            className="toggle-label"
                            onClick={ () => this.toggleBuyFixedDestCoin() }>
                            { translate('EXCHANGES.AMOUNT_IN') } { this.state.newExchangeOrderDetails.coinSrc ? this.state.newExchangeOrderDetails.coinSrc.split('|')[0] : '...' }
                          </div>
                        </span>
                      </div>
                      <div className="col-lg-12 form-group form-material">
                        { this.state.buyFixedDestCoin &&
                          <button
                            type="button"
                            className="btn btn-default btn-send-self"
                            disabled={
                              Number(this.state.newExchangeOrderDetails.currentBalance) === 0 ||
                              this.state.newExchangeOrderDetails.currentBalance === 'none' ||
                              this.state.newExchangeOrderDetails.currentBalance === 'loading'
                            }
                            onClick={ this.setSendAmountAll }>
                            { translate('SEND.ALL') }
                          </button>
                        }
                        <label
                          className="control-label"
                          htmlFor="kmdWalletAmount">
                          <span>{ translate('INDEX.AMOUNT') }{ this.state.newExchangeOrderDetails.coinSrc && this.state.newExchangeOrderDetails.coinDest ? ` ${translate('EXCHANGES.IN_SM')} ${(this.state.buyFixedDestCoin ? this.state.newExchangeOrderDetails.coinSrc.split('|')[0] : this.state.newExchangeOrderDetails.coinDest.split('|')[0])}` : '' }</span>
                          { this.state.newExchangeOrderDetails.currentBalance !== 'none' &&
                            this.state.newExchangeOrderDetails.currentBalance !== 'loading' &&
                            this.state.buyFixedDestCoin &&
                            <span className="padding-left-5">
                              <strong>[ { this.state.newExchangeOrderDetails.currentBalance } { this.state.newExchangeOrderDetails.coinSrc.split('|')[0] }]</strong>
                            </span>
                          }
                          { this.state.newExchangeOrderDetails.currentBalance === 'loading' &&
                            this.state.buyFixedDestCoin &&
                            <span className="padding-left-5">
                              <strong>[...]</strong>
                            </span>
                          }
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="newExchangeOrderDetails-amount"
                          disabled={
                            Number(this.state.newExchangeOrderDetails.currentBalance) === 0 ||
                            this.state.newExchangeOrderDetails.currentBalance === 'none' ||
                            this.state.newExchangeOrderDetails.currentBalance === 'loading'
                          }
                          value={ this.state.newExchangeOrderDetails.amount !== 0 ? this.state.newExchangeOrderDetails.amount : '' }
                          onChange={ this.updateInput }
                          id="kmdWalletAmount"
                          placeholder="0.000"
                          autoComplete="off" />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary waves-effect waves-light pull-right"
                        onClick={ this.nextStep }
                        disabled={
                          this.state.processing ||
                          !this.state.newExchangeOrderDetails.coinSrc ||
                          !this.state.newExchangeOrderDetails.coinDest ||
                          !this.state.newExchangeOrderDetails.amount
                        }>
                        { this.state.processing ? `${translate('EXCHANGES.PLEASE_WAIT')}...` : translate('EXCHANGES.NEXT') }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
            { this.state.newExchangeOrderDetails.orderStep === 1 &&
              <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="panel">
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.YOU_PAY') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { this.state.newExchangeOrderDetails.amount } { this.state.newExchangeOrderDetails.coinSrc.split('|')[0] }
                        <span className="padding-left-30">
                          { Number(this.state.newExchangeOrderDetails.amount * this.state.newExchangeOrderDetails.prices[this.state.newExchangeOrderDetails.coinSrc.split('|')[0]][Config.defaultFiatCurrency.toUpperCase()]).toFixed(8) } { Config.defaultFiatCurrency.toUpperCase() }
                        </span>
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.YOU_RECEIVE') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { Number(this.state.newExchangeOrderDetails.amount * this.state.newExchangeOrderDetails.exchangeRate.rate).toFixed(8) } { this.state.newExchangeOrderDetails.coinDest.split('|')[0] }
                        <span className="padding-left-30">
                          { Number(this.state.newExchangeOrderDetails.amount * this.state.newExchangeOrderDetails.exchangeRate.rate * this.state.newExchangeOrderDetails.prices[this.state.newExchangeOrderDetails.coinDest.split('|')[0]][Config.defaultFiatCurrency.toUpperCase()]).toFixed(8) } { Config.defaultFiatCurrency.toUpperCase() }
                        </span>
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.EXCHANGE_RATE') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { this.state.newExchangeOrderDetails.exchangeRate.rate } { this.state.newExchangeOrderDetails.coinDest.split('|')[0] } for 1 { this.state.newExchangeOrderDetails.coinSrc.split('|')[0] }
                      </div>
                    </div>
                    { this.state.newExchangeOrderDetails.amount > this.state.newExchangeOrderDetails.exchangeRate.limitMaxDepositCoin &&
                      <div className="row padding-top-20">
                        <div className="col-xs-12">
                          <strong>{ translate('EXCHANGES.ERROR') }</strong>
                        </div>
                        <div className="col-lg-12 col-sm-12 col-xs-12">
                          { this.state.newExchangeOrderDetails.coinSrc.split('|')[0] } { translate('EXCHANGES.AMOUNT_EXCEEDS_MAX_VAL') } { this.state.newExchangeOrderDetails.exchangeRate.limitMaxDepositCoin }
                        </div>
                      </div>
                    }
                    { this.state.newExchangeOrderDetails.amount < this.state.newExchangeOrderDetails.exchangeRate.limitMinDepositCoin &&
                      <div className="row padding-top-20">
                        <div className="col-xs-12">
                          <strong>{ translate('EXCHANGES.ERROR') }</strong>
                        </div>
                        <div className="col-lg-12 col-sm-12 col-xs-12">
                          { this.state.newExchangeOrderDetails.coinSrc.split('|')[0] } { translate('EXCHANGES.AMOUNT_IS_TOO_LOW') } { this.state.newExchangeOrderDetails.exchangeRate.limitMinDepositCoin }
                        </div>
                      </div>
                    }
                    <div className="widget-body-footer">
                      <a
                        onClick={ this.prevStep }
                        className="btn btn-default waves-effect waves-light">{ translate('EXCHANGES.BACK') }</a>
                      <div className="widget-actions pull-right">
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={
                            this.state.newExchangeOrderDetails.amount < this.state.newExchangeOrderDetails.exchangeRate.limitMinDepositCoin ||
                            this.state.newExchangeOrderDetails.amount > this.state.newExchangeOrderDetails.exchangeRate.limitMaxDepositCoin ||
                            this.state.processing
                          }
                          onClick={ this.nextStep }>
                          { this.state.processing ? `${translate('EXCHANGES.PLEASE_WAIT')}...` : translate('EXCHANGES.CONFIRM') }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            { this.state.newExchangeOrderDetails.orderStep === 2 &&
              <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="panel">
                  <div className="panel-body">
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.DATE') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { secondsToString(this.state.newExchangeOrderDetails.exchangeOrder.createdAt / 1000) }
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.VALID_UNTIL') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { secondsToString(this.state.newExchangeOrderDetails.exchangeOrder.validTill / 1000) }
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.YOU_PAY') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { Number(this.state.newExchangeOrderDetails.exchangeOrder.expectedDepositCoinAmount).toFixed(8) } { this.state.newExchangeOrderDetails.exchangeOrder.depositCoin.toUpperCase() }
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.YOU_RECEIVE') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { Number(this.state.newExchangeOrderDetails.exchangeOrder.expectedDestinationCoinAmount).toFixed(8) } { this.state.newExchangeOrderDetails.exchangeOrder.destinationCoin.toUpperCase() }
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.EXCHANGE_RATE') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { Number((1 / this.state.newExchangeOrderDetails.exchangeOrder.expectedDepositCoinAmount) * this.state.newExchangeOrderDetails.exchangeOrder.expectedDestinationCoinAmount).toFixed(8) } { this.state.newExchangeOrderDetails.exchangeOrder.destinationCoin.toUpperCase() } for 1 { this.state.newExchangeOrderDetails.exchangeOrder.depositCoin.toUpperCase() }
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.DEPOSIT_ADDRESS') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        <span
                          onClick={ () => this.openExplorerWindow(this.state.newExchangeOrderDetails.exchangeOrder.exchangeAddress.address, 'pub', this.state.newExchangeOrderDetails.exchangeOrder.depositCoin.toUpperCase()) }
                          className="pointer">
                          { this.state.newExchangeOrderDetails.exchangeOrder.exchangeAddress.address }
                        </span>
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.RECEIVE_ADDRESS') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        <span
                          onClick={ () => this.openExplorerWindow(this.state.newExchangeOrderDetails.exchangeOrder.destinationAddress.address, 'pub', this.state.newExchangeOrderDetails.exchangeOrder.destinationCoin.toUpperCase()) }
                          className="pointer">
                          { this.state.newExchangeOrderDetails.exchangeOrder.destinationAddress.address }
                        </span>
                      </div>
                    </div>
                    <div className="row padding-top-20">
                      <div className="col-xs-12">
                        <strong>{ translate('EXCHANGES.ORDER_ID') }</strong>
                      </div>
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        { this.state.newExchangeOrderDetails.exchangeOrder.orderId }
                      </div>
                    </div>
                    <div className="widget-body-footer">
                      <a
                        onClick={ this.clearOrder }
                        className="btn btn-default waves-effect waves-light">{ translate('EXCHANGES.BACK_TO_ORDERS') }</a>
                      <div className="widget-actions pull-right">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={ this.nextStep }>
                          { translate('EXCHANGES.PROCEED_TO_DEPOSIT') }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
      { this.state.newExchangeOrderDetails.step === 1 &&
        this.props.Main.coins &&
        this.props.Main.coins.spv.length > 1 &&
        <div className="step2">
          <SendCoin
            initState={ this.state.newExchangeOrderDetails }
            cb={ this.sendCoinCB }
            activeSection="send" />
        </div>
      }
      { this.props.Main.coins &&
        this.props.Main.coins.spv.length < 2 &&
        <div>{ translate('EXCHANGES.PLEASE_ACTIVATE_LITE_MODE_COINS') }</div>
      }
      <div className="text-center padding-bottom-30">
        <a
          onClick={ this.toggleCreateOrder }
          className="pointer">{ translate('EXCHANGES.BACK_TO_ORDERS') }</a>
        <div className="hide" onClick={ this.testDepositResponse }>test deposit</div>
      </div>
    </section>
  );
};

export const RenderExchangeHistory = function() {
  const _cache = this.props.Dashboard.exchanges && this.props.Dashboard.exchanges[this.state.provider];
  let _cacheFlat = [];
  let _items = [];

  for (let key in _cache) {
    if (key !== 'deposits') {
      _cacheFlat.push(_cache[key]);
    }
  }

  _cacheFlat = sort(_cacheFlat, 'createdAt', true);

  for (let i = 0; i < _cacheFlat.length; i++) {
    if (this.state.provider === 'coinswitch') {
      _items.push(
        <tr key={ `${this.state.provider}-${i}` }>
          <td>
            { secondsToString(_cacheFlat[i].createdAt / 1000) }
          </td>
          <td>
            <img
              className="margin-right-10"
              height="25px"
              src={ `assets/images/cryptologo/btc/${_cacheFlat[i].depositCoin}.png` } />
            { formatValue(_cacheFlat[i].expectedDepositCoinAmount) } { _cacheFlat[i].depositCoin.toUpperCase() }
          </td>
          <td>
            <img
              className="margin-right-10"
              height="25px"
              src={ `assets/images/cryptologo/btc/${_cacheFlat[i].destinationCoin}.png` } />
            { formatValue(_cacheFlat[i].expectedDestinationCoinAmount) } { _cacheFlat[i].destinationCoin.toUpperCase() }
          </td>
          <td className={ _cacheFlat[i].status === 'confirming' || _cacheFlat[i].status === 'exchanging' || (_cacheFlat[i].status === 'sending' && !_cacheFlat[i].outputTransactionHash) ? 'col-warning' : '' }>
            { _cacheFlat[i].outputTransactionHash ? 'complete' : statusLookup.coinswitch[_cacheFlat[i].status] ? statusLookup.coinswitch[_cacheFlat[i].status] : _cacheFlat[i].status }
          </td>
          <td>
            { this.findDeposits(_cacheFlat[i].orderId).length > 0 || (this.state.provider === 'coinswitch' && _cacheFlat[i].inputTransactionHash) || (this.state.provider === 'coinswitch' && _cacheFlat[i].inputTransactionHash && _cache.deposits && _cache.deposits[`${_cacheFlat[i].depositCoin.toLowerCase()}-${_cacheFlat[i].inputTransactionHash}`]) ? translate('EXCHANGES.YES') : translate('EXCHANGES.NO') }
            { ((this.state.provider === 'coinswitch' && this.findDeposits(_cacheFlat[i].orderId).length === 0 && _cacheFlat[i].status === 'no_deposit')/* ||
              (this.state.provider === 'coinswitch' && _cacheFlat[i].status === 'no_deposit' && _cacheFlat[i].inputTransactionHash && _cache.deposits && !_cache.deposits[`${_cacheFlat[i].depositCoin.toLowerCase()}-${_cacheFlat[i].inputTransactionHash}`])*/) &&
              <button
                type="button"
                className="btn btn-xs white btn-success waves-effect waves-lightm margin-left-10"
                disabled={ this.state.syncHistoryProgressing }
                onClick={ () => this.makeDeposit(_cacheFlat[i].orderId) }>
                { translate('EXCHANGES.SEND') }
              </button>
            }
          </td>
          <td>
            <button
              type="button"
              className="btn btn-xs white btn-info waves-effect waves-light btn-kmdtxid"
              disabled={ this.state.syncHistoryProgressing }
              onClick={ () => this._toggleExchangesOrderInfoModal(_cacheFlat[i].orderId) }>
              <i className="icon fa-search"></i>
            </button>
          </td>
        </tr>
      );
    }
  }

  if (_items.length) {
    return (
      <div className="table-scroll">
        <table className="table table-hover dataTable table-striped">
          <thead>
            <tr>
              <th>{ translate('EXCHANGES.DATE') }</th>
              <th>{ translate('EXCHANGES.SOURCE') }</th>
              <th>{ translate('EXCHANGES.DESTINATION') }</th>
              <th>{ translate('EXCHANGES.STATUS') }</th>
              <th>{ translate('EXCHANGES.DEPOSIT') }</th>
              <th>{ translate('EXCHANGES.DETAILS') }</th>
            </tr>
          </thead>
          <tbody>
          { _items }
          </tbody>
          <tfoot>
            <tr>
              <th>{ translate('EXCHANGES.DATE') }</th>
              <th>{ translate('EXCHANGES.SOURCE') }</th>
              <th>{ translate('EXCHANGES.DESTINATION') }</th>
              <th>{ translate('EXCHANGES.STATUS') }</th>
              <th>{ translate('EXCHANGES.DEPOSIT') }</th>
              <th>{ translate('EXCHANGES.DETAILS') }</th>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  } else {
    return (
      <div>{ translate('EXCHANGES.NO_HISTORY') }</div>
    );
  }
};

const ExchangesRender = function() {
  return (
    <section className="exchanges-main">
      <div className="page margin-left-0">
        <div className="page-content tools background--white">
          <div className="row">
            <div className="col-sm-12 no-padding-left padding-top-10">
              <div className="margin-top-20 exchanges-selector-main text-center">
                <img
                  onClick={ () => this.toggleExchangeProvider('coinswitch') }
                  className={ `pointer${this.state.provider === 'coinswitch' ? ' active' : ''}` }
                  height="30px"
                  src="assets/images/exchanges/coinswitch.png" />
                {/*<img
                  onClick={ () => this.toggleExchangeProvider('changelly') }
                  className={ `pointer${this.state.provider === 'changelly' ? ' active' : ''} margin-left-70` }
                  height="50px"
                src="assets/images/exchanges/changelly.png" />*/}
              </div>
              { !this.state.newExchangeOrder &&
                <div className="margin-top-40 exchanges-history">
                  <h4>{ translate('EXCHANGES.MY_EXCHANGE_HISTORY') }</h4>
                  <i
                    className={ 'icon fa-refresh exchanges-refresh-btn' + (this.state.exchangeCacheUpdateProgress ? ' rotate' : '') }
                    onClick={ this.updateCache }></i>
                  <div
                    className="btn-exchange-tos-modal"
                    onClick={ this._toggleExchangesTOSModal }>
                    { translate('EXCHANGES.TOS') }
                  </div>
                  <div
                    className={ 'btn-exchange-sync' + (this.state.syncHistoryProgressing ? ' rotate' : '') }
                    onClick={ this.syncHistory }>
                    <i className="icon fa-refresh margin-right-5"></i> { translate('EXCHANGES.SYNC_HISTORY') }
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs white btn-info waves-effect waves-light btn-exchange-new"
                    disabled={ this.state.syncHistoryProgressing }
                    onClick={ this.toggleCreateOrder }>
                    + { translate('EXCHANGES.NEW_EXCHANGE_ORDER') }
                  </button>
                  <div>
                    { this._RenderExchangeHistory() }
                  </div>
                  <ExchangesOrderInfoModal provider={ this.state.provider } />
                </div>
              }
              { this.state.newExchangeOrder &&
                <div className="margin-top-40">
                  { this._RenderNewOrderForm() }
                </div>
              }
              <ExchangesTOSModal />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExchangesRender;