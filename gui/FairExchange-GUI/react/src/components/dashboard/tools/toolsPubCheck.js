import React from 'react';
import translate from '../../../translate/translate';
import mainWindow, { staticVar } from '../../../util/mainWindow';
import { getAddressVersion } from 'agama-wallet-lib/src/keys';

class ToolsPubCheck extends React.Component {
  constructor() {
    super();
    this.state = {
      pub: '',
      pubResult: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.pubCheck = this.pubCheck.bind(this);
  }

  pubCheck() {
    this.setState({
      pubResult: getAddressVersion(this.state.pub),
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderCoins() {
    const _coins = this.state.pubResult.coins;
    let _items = [];

    for (let i = 0; i < _coins.length; i++) {
      _items.push(
        <div key={ `tools-pub-check-${i}` }>{ _coins[i] }</div>
      );
    }

    return _items;
  }

  render() {
    return (
      <div className="row margin-left-10">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.PUB_ADDR_VER_CHECK') }</h4>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left padding-top-10 padding-bottom-20">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">
            { translate('TOOLS.PUB_ADDR') }
          </label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="pub"
            onChange={ this.updateInput }
            value={ this.state.pub }
            placeholder={ translate('TOOLS.ENTER_A_PUB_ADDR') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.pubCheck }>
            { translate('TOOLS.CHECK_VERSION') }
          </button>
        </div>
        { this.state.pubResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
          { this.state.pubResult &&
            this.state.pubResult.coins &&
            <div>
              <div>{ translate('TOOLS.COINS') }: { this.renderCoins() }</div>
              <div className="margin-top-10">{ translate('TOOLS.VERSION') }: { this.state.pubResult.version }</div>
            </div>
          }
          { !this.state.pubResult.coin || (this.state.pubResult.coin && !this.state.pubResult.coins) &&
            <div className="selectable">{ this.state.pubResult }</div>
          }
          </div>
        }
      </div>
    );
  }
}

export default ToolsPubCheck;