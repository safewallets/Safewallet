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

class ToolsGetUtxos extends React.Component {
  constructor() {
    super();
    this.state = {
      utxoAddr: '',
      utxoCoin: '',
      utxoResult: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.getUtxos = this.getUtxos.bind(this);
  }

  getUtxos() {
    const _coin = this.state.utxoCoin.split('|');

    apiElectrumListunspent(_coin[0], this.state.utxoAddr)
    .then((res) => {
      if (res.msg === 'success') {
        this.setState({
          utxoResult: res.result,
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            translate('TOOLS.ERR_GET_UTXO'),
            'error'
          )
        );
      }
    });
  }

  renderUTXOResponse() {
    const _utxos = this.state.utxoResult;
    const _coin = this.state.utxoCoin.split('|');
    let _items = [];

    if (_utxos &&
        _utxos.length) {
      for (let i = 0; i < _utxos.length; i++) {
        _items.push(
          <tr key={ `tools-utxos-${i}` }>
            <td>{ _utxos[i].amount }</td>
            <td>{ _utxos[i].confirmations }</td>
            <td>{ _utxos[i].vout }</td>
            { _coin[0] === 'KMD' &&
              <td>{ _utxos[i].locktime }</td>
            }
            <td className="blur selectable">{ _utxos[i].txid }</td>
          </tr>
        );
      }
    }

    if (_utxos.length &&
        _utxos !== 'connection error or incomplete data') {
      return (
        <table className="table table-hover dataTable table-striped">
          <thead>
            <tr>
              <th>{ translate('TOOLS.AMOUNT') }</th>
              <th>{ translate('TOOLS.CONFS') }</th>
              <th>{ translate('TOOLS.VOUT') }</th>
              { _coin[0] === 'KMD' &&
                <th>{ translate('TOOLS.LOCKTIME') }</th>
              }
              <th>{ translate('KMD_NATIVE.TXID') }</th>
            </tr>
          </thead>
          <tbody>
          { _items }
          </tbody>
          <tfoot>
            <tr>
              <th>{ translate('TOOLS.AMOUNT') }</th>
              <th>{ translate('TOOLS.CONFS') }</th>
              <th>{ translate('TOOLS.VOUT') }</th>
              { _coin[0] === 'KMD' &&
                <th>{ translate('TOOLS.LOCKTIME') }</th>
              }
              <th>{ translate('KMD_NATIVE.TXID') }</th>
            </tr>
          </tfoot>
        </table>
      );
    } else {
      return (
        <div>{ translate('TOOLS.NO_UTXO') }</div>
      );
    }
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
          <h4>{ translate('TOOLS.GET_UTXO_LIST') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-70">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.COIN') }
          </label>
          <Select
            name="utxoCoin"
            className="col-sm-3"
            value={ this.state.utxoCoin }
            onChange={ (event) => this.updateSelectedCoin(event, 'utxoCoin') }
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
            htmlFor="kmdWalletSendTo">{ translate('TOOLS.ADDR') }</label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="utxoAddr"
            onChange={ this.updateInput }
            value={ this.state.utxoAddr }
            placeholder={ translate('SEND.ENTER_ADDRESS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.getUtxos }>
            { translate('TOOLS.GET_UTXO') }
          </button>
        </div>
        { this.state.utxoResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            { this.renderUTXOResponse() }
          </div>
        }
      </div>
    );
  }
}

export default ToolsGetUtxos;