import { PRICES } from '../storeType';
import { triggerToaster } from '../actionCreators';
import Config from '../../config';
import translate from '../../translate/translate';
import fetchType from '../../util/fetchType';

export const prices = (coins, currency) => {
  return dispatch => {
    return fetch(
      `https://www.atomicexplorer.com/api/mm/prices/v2?currency=${currency}&coins=${typeof coins === 'object' ? coins.join(',') : coins}&pricechange=true`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(json && json.msg === 'success' ? pricesState(json.result) : pricesState('error'));
    });
  }
}

const pricesState = (json) => {
  return {
    type: PRICES,
    prices: json,
  }
}

export const pricesPromise = (coins, currency) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.atomicexplorer.com/api/mm/prices/v2?currency=${currency}&coins=${typeof coins === 'object' ? coins.join(',') : coins}&pricechange=true`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
    })
    .then(response => response.json())
    .then(json => resolve(json && json.msg === 'success' ? json.result : 'error'));
  });
}