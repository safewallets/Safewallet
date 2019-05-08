import React from 'react';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import Spinner from '../spinner/spinner';
import Config from '../../../config';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';

const WalletsBalanceRender = function() {
  const _mode = this.props.ActiveCoin.mode;
  const _coin = this.props.ActiveCoin.coin;
  const _notAcPrivate = staticVar.chainParams && staticVar.chainParams[_coin] && !staticVar.chainParams[_coin].ac_private;
  const _isAcPrivate = staticVar.chainParams && staticVar.chainParams[_coin] && staticVar.chainParams[_coin].ac_private;
  const _balanceUnconf = this.props.ActiveCoin.balance && this.props.ActiveCoin.balance.unconfirmed ? this.props.ActiveCoin.balance.unconfirmed : 0;

  return (
    <div
      id="wallet-widgets"
      className="wallet-widgets">
      { this.renderBalance('transparent') !== -777 &&
        <div className="col-xs-12 flex">
          { (_mode === 'spv' ||
             _mode === 'eth' ||
             (_mode === 'native' && _notAcPrivate) ||
              (_mode === 'native' && _coin === 'KMD')) &&
            <div className={
              _coin === 'CHIPS' ||
              (_mode === 'spv' && _coin !== 'KMD') ||
              this.renderBalance('total') === this.renderBalance('transparent') ||
              this.renderBalance('total') === 0 ? 'col-lg-12 col-xs-12 balance-placeholder--bold' : (_mode || Number(this.renderBalance('private')) === 0 ? 'col-lg-4 col-xs-12' : 'col-lg-3 col-xs-12')
            }>
              <div className="widget widget-shadow">
                <div className="widget-content">
                  { this.state.loading &&
                    <span className="spinner--small">
                      <Spinner />
                    </span>
                  }
                  { !this.state.loading &&
                    <i
                      className="icon fa-refresh manual-balance-refresh pointer"
                      onClick={ this.refreshBalance }></i>
                  }
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        { ((isKomodoCoin(_coin) && _mode === 'native') || _coin === 'KMD') &&
                          <i className="icon fa-eye font-size-24 vertical-align-bottom margin-right-10"></i>
                        }
                        { translate('INDEX.' + (_coin === 'CHIPS' || _mode === 'spv' || _mode === 'eth' ? 'BALANCE' : 'TRANSPARENT_BALANCE')) }
                        { _mode === 'spv' &&
                          Number(_balanceUnconf) < 0 &&
                          <i
                            className="icon fa-info-circle margin-left-5 icon-unconf-balance"
                            data-tip={ `${translate('INDEX.UNCONFIRMED_BALANCE')} ${Math.abs(_balanceUnconf)}` }
                            data-for="balance2"></i>
                        }
                        <ReactTooltip
                          id="balance2"
                          effect="solid"
                          className="text-left" />
                      </div>
                      <span className="pull-right padding-top-10 font-size-22">
                        { this.renderBalance('transparent', true) }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <div className={ ((_mode === 'native' && Number(this.renderBalance('private'))) > 0 || _isAcPrivate) ? (_isAcPrivate ? 'col-lg-12 col-xs-12' : 'col-lg-3 col-xs-12') : 'hide' }>
            <div className="widget widget-shadow">
              <div className="padding-20 padding-top-10">
                <div className="clearfix cursor-default">
                  <div className="pull-left padding-vertical-10">
                    <i className="icon fa-eye-slash font-size-24 vertical-align-bottom margin-right-10"></i>
                    { translate('INDEX.Z_BALANCE') }
                  </div>
                  <span
                    className="pull-right padding-top-10 font-size-22"
                    data-tip={ Config.roundValues ? this.renderBalance('private') : '' }
                    data-for="balance3">
                    { this.renderBalance('private', true) }
                  </span>
                  <ReactTooltip
                    id="balance3"
                    effect="solid"
                    className="text-left" />
                </div>
              </div>
            </div>
          </div>

          { _coin === 'KMD' &&
            Number(this.renderBalance('interest')) > 0 &&
            <div className={ _mode === 'spv' || Number(this.renderBalance('private')) === 0 ? 'col-lg-4 col-xs-12' : 'col-lg-3 col-xs-12' }>
              <div className="widget widget-shadow">
                <div className="widget-content">
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        <i className="icon fa-money font-size-24 vertical-align-bottom margin-right-10"></i>
                        { translate('INDEX.INTEREST_EARNED') }
                      </div>
                      <span
                        className="pull-right padding-top-10 font-size-22"
                        data-tip={ Config.roundValues ? this.renderBalance('interest') : '' }
                        data-for="balance4">
                        { this.renderBalance('interest', true) }
                      </span>
                      <ReactTooltip
                        id="balance4"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          { ((_mode === 'spv' && _coin === 'KMD') ||
             (_mode === 'native' && _notAcPrivate) ||
              (_mode === 'native' && _coin === 'KMD')) &&
            this.renderBalance('total') !== this.renderBalance('transparent') &&
            Number(this.renderBalance('total')) !== 0 &&
            <div className={ _mode === 'spv' || Number(this.renderBalance('private')) === 0 ? 'col-lg-4 col-xs-12' : 'col-lg-3 col-xs-12' }>
              <div className="widget widget-shadow">
                <div className="widget-content">
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        <i className="icon fa-bullseye font-size-24 vertical-align-bottom margin-right-10"></i>
                        { translate('INDEX.TOTAL_BALANCE') }
                      </div>
                      <span
                        className="pull-right padding-top-10 font-size-22"
                        data-tip={ Config.roundValues ? this.renderBalance('total') : '' }
                        data-for="balance5">
                        { this.renderBalance('total', true) }
                      </span>
                      <ReactTooltip
                        id="balance5"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  );
};

export default WalletsBalanceRender;