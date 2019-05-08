import React from 'react';
import { connect } from 'react-redux';
import {
  getCoinTitle,
  getModeInfo,
  isKomodoCoin,
} from '../../../util/coinHelper';
import CoinTileItem from './coinTileItem';
import translate from '../../../translate/translate';

import CoinTileRender from './coinTile.render';

class CoinTile extends React.Component {
  constructor() {
    super();
    this.state = {
      toggledSidebar: false,
    };
    this.renderTiles = this.renderTiles.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  toggleSidebar() {
    this.setState({
      toggledSidebar: !this.state.toggledSidebar,
    });
  }

  renderTiles() {
    const modes = [
      'native',
      'spv',
      'eth',
    ];
    const allCoins = this.props.allCoins;
    let items = [];

    if (allCoins) {
      for (let i = 0; i < modes.length; i++) {
        allCoins[modes[i]].sort();
        
        for (let j = 0; j < allCoins[modes[i]].length; j++) {
          const _coinMode = getModeInfo(modes[i]);
          const modecode = _coinMode.code;
          const modetip = _coinMode.tip;
          const modecolor = _coinMode.color;

          const _coinTitle = getCoinTitle(allCoins[modes[i]][j].toUpperCase());
          const coinlogo = allCoins[modes[i]][j].toUpperCase();
          const coinname = translate(((modes[i] === 'spv' || modes[i] === 'native') && isKomodoCoin(allCoins[modes[i]][j]) ? 'ASSETCHAINS.' : 'CRYPTO.') + allCoins[modes[i]][j].toUpperCase());
          const data = {
            coinlogo,
            coinname,
            coin: allCoins[modes[i]][j],
            mode: modes[i],
            modecolor,
            modetip,
            modecode,
          };

          items.push(
            <CoinTileItem
              key={ `coin-tile-${modes[i]}-${allCoins[modes[i]][j]}` }
              i={ i }
              item={ data } />
          );
        }
      }
    }

    return items;
  }

  render() {
    return CoinTileRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    allCoins: state.Main.coins,
  };
};

export default connect(mapStateToProps)(CoinTile);