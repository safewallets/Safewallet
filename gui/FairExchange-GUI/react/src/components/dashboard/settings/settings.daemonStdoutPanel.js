import React from 'react';
import translate from '../../../translate/translate';
import { connect } from 'react-redux';
import { coindGetStdout } from '../../../actions/actionCreators';
import Store from '../../../store';

class DaemonStdoutPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      coindStdOut: translate('INDEX.LOADING') + '...',
      coin: null,
      textareaHeight: '100px',
    };
    this.getCoindGetStdout = this.getCoindGetStdout.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentWillMount() {
    this.getCoindGetStdout();
  }

  getCoindGetStdout() {
    const _coin = this.state.coin || this.props.ActiveCoin.coin;

    coindGetStdout(_coin)
    .then((res) => {
      this.setState({
        coindStdOut: res.msg === 'success' ? res.result : `${translate('INDEX.ERROR_READING')} ${_coin} stdout`,
      });

      setTimeout(() => {
        const _ta = document.querySelector('#settingsCoindStdoutTextarea');
        _ta.style.height = '1px';
        _ta.style.height = `${(15 + _ta.scrollHeight)}px`;
      }, 100);
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });

    this.getCoindGetStdout();
  }

  renderCoinListSelectorOptions(coin) {
    let _items = [];
    let _nativeCoins = this.props.Main.coins.native;

    _nativeCoins.sort();

    for (let i = 0; i < _nativeCoins.length; i++) {
      _items.push(
        <option
          key={ `coind-stdout-coins-${i}` }
          value={ `${_nativeCoins[i]}` }>
          { `${_nativeCoins[i]}` }
        </option>
      );
    }

    return _items;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 padding-bottom-10">
            <div>
              <div className="col-sm-3 no-padding-left">
                <select
                  className="form-control form-material"
                  name="coin"
                  value={
                    this.state.coin ||
                    this.props.ActiveCoin.coin ||
                    ''
                  }
                  onChange={ (event) => this.updateInput(event) }
                  autoFocus>
                  { this.renderCoinListSelectorOptions() }
                </select>
              </div>
              <div className="col-sm-1">
                <i
                  className="icon fa-refresh coind-stdout-refresh-icon pointer"
                  onClick={ this.getCoindGetStdout }></i>
              </div>
            </div>
          </div>
          <div className="col-sm-12">
            <div className="form-group form-material floating col-sm-8 no-padding-left">
              <textarea
                readOnly
                id="settingsCoindStdoutTextarea"
                className="form-control settings-coind-stdout-textarea"
                value={ this.state.coindStdOut }
                style={{ height: this.state.textareaHeight }}></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      mode: state.ActiveCoin.mode,
    },
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(DaemonStdoutPanel);