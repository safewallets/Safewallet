import React from 'react';
import translate from '../../../translate/translate';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../../addcoin/addcoinOptionsAC';
import Select from 'react-select';
import {
  triggerToaster,
  apiToolsBalance,
  apiToolsBuildUnsigned,
  apiToolsPushTx,
  apiToolsSeedToWif,
  apiToolsWifToKP,
  apiElectrumListunspent,
  apiCliPromise,
  apiElectrumSplitUtxoPromise,
} from '../../../actions/actionCreators';
import Store from '../../../store';

class ToolsGetBalance extends React.Component {
  constructor() {
    super();
    this.state = {
      balanceAddr: '',
      balanceCoin: '',
      balanceResult: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.getBalanceAlt = this.getBalanceAlt.bind(this);
  }

  getBalanceAlt() {
    const _coin = this.state.balanceCoin.split('|');

    apiToolsBalance(_coin[0], this.state.balanceAddr)
    .then((res) => {
      if (res.msg === 'success') {
        this.setState({
          balanceResult: res.result,
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            translate('TOOLS.ERR_GET_BALANCE'),
            'error'
          )
        );
      }
    });
  }

  renderCoinOption(option) {
    return (
      <div>
        <img
          src={ `assets/images/cryptologo/${option.icon.toLowerCase()}.png` }
          alt={ option.label }
          width="30px"
          height="30px" />
        <span className="margin-left-10">{ option.label }</span>
      </div>
    );
  }

  updateSelectedCoin(e, propName) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      this.setState({
        [propName]: e.value,
      });
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <div className="row margin-left-10">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.GET_BALANCE') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-70">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.COIN') }
          </label>
          <Select
            name="balanceCoin"
            className="col-sm-3"
            value={ this.state.balanceCoin }
            onChange={ (event) => this.updateSelectedCoin(event, 'balanceCoin') }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={
              addCoinOptionsCrypto('skip', true, false)
              .concat(addCoinOptionsAC('skip'))
            } />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.ADDR') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="balanceAddr"
            onChange={ this.updateInput }
            value={ this.state.balanceAddr }
            placeholder={ translate('SEND.ENTER_ADDRESS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.getBalanceAlt }>
            { translate('TOOLS.BALANCE') }
          </button>
        </div>
        { this.state.balanceResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            <div>
              <strong>{ translate('TOOLS.BALANCE_CONF') }:</strong> { this.state.balanceResult.balance }
            </div>
            <div className="margin-top-10">
              <strong>{ translate('TOOLS.BALANCE_UNCONF') }:</strong> { this.state.balanceResult.unconfirmed }
            </div>
          </div>
        }
      </div>
    );
  }
}

export default ToolsGetBalance;