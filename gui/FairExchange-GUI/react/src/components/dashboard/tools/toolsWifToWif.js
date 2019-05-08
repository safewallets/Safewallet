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
import devlog from '../../../util/devlog';

class ToolsWifToWif extends React.Component {
  constructor() {
    super();
    this.state = {
      w2wWif: '',
      w2wCoin: '',
      w2wResult: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.wif2wif = this.wif2wif.bind(this);
  }

  wif2wif() {
    const _coin = this.state.w2wCoin.split('|');

    apiToolsWifToKP(_coin[0], this.state.w2wWif)
    .then((res) => {
      devlog(res);

      if (res.msg === 'success') {
        this.setState({
          w2wResult: res.result,
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            translate('TOOLS.ERR_SEED_TO_WIF'),
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
          <h4>{ translate('TOOLS.WIF_TO_WIF_ALT') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-70">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.COIN') }
          </label>
          <Select
            name="w2wCoin"
            className="col-sm-3"
            value={ this.state.w2wCoin }
            onChange={ (event) => this.updateSelectedCoin(event, 'w2wCoin') }
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
            WIF
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="w2wWif"
            onChange={ this.updateInput }
            value={ this.state.w2wWif }
            placeholder={ translate('TOOLS.ENTER_A_WIF') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.wif2wif }>
            { translate('TOOLS.GET_WIF') }
          </button>
        </div>
        { this.state.w2wResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            <div>
              <strong>WIF:</strong> <span className="blur selectable">{ this.state.w2wResult.keys.priv }</span>
            </div>
            <div className="margin-top-10">
              <strong>{ translate('TOOLS.PUB_ADDR') }:</strong> <span className="blur selectable">{ this.state.w2wResult.keys.pub }</span>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default ToolsWifToWif;