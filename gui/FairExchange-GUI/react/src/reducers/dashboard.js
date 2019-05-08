import {
  DASHBOARD_SECTION_CHANGE,
  GET_MAIN_ADDRESS,
  DISPLAY_COIND_DOWN_MODAL,
  DISPLAY_CLAIM_INTEREST_MODAL,
  DASHBOARD_SYNC_ONLY_UPDATE,
  DISPLAY_IMPORT_KEY_MODAL,
  DASHBOARD_ELECTRUM_COINS,
  DASHBOARD_ETHEREUM_COINS,
  ELECTRUM_SERVER_CHANGED,
  DISPLAY_ZCASH_PARAMS_FETCH,
  EXCHANGES_CACHE,
  DASHBOARD_ACTIVE_EXCHANGES_ORDER_MODAL,
  DASHBOARD_EXCHANGES_TOS_MODAL,
  DASHBOARD_EXCHANGES_SUPPORTED_COINS_MODAL,
  EXCHANGES_COINSWITCH_COINS,
  PRICES,
} from '../actions/storeType';

export const Dashboard = (state = {
  activeSection: 'wallets',
  activeHandle: null,
  displayCoindDownModal: false,
  displayClaimInterestModal: false,
  skipFullDashboardUpdate: false,
  displayImportKeyModal: false,
  electrumCoins: {},
  eletrumServerChanged: false,
  displayZcparamsModal: false,
  prices: null,
  ethereumCoins: {},
  exchanges: {
    coinswitch: {},
  },
  showExchangesOrderInfoId: null,
  displayExchangesTOSModal: false,
  displayExchangesSupportedCoinsModal: false,
}, action) => {
  let exchanges = JSON.parse(JSON.stringify(state.exchanges));
  
  switch (action.type) {
    case DASHBOARD_ELECTRUM_COINS:
      return {
        ...state,
        electrumCoins: action.electrumCoins,
      };
    case DASHBOARD_ETHEREUM_COINS:
      return {
        ...state,
        ethereumCoins: action.ethereumCoins,
      };
    case DASHBOARD_SECTION_CHANGE:
      return {
        ...state,
        activeSection: action.activeSection,
      };
    case GET_MAIN_ADDRESS:
      return {
        ...state,
        activeHandle: action.activeHandle,
      };
    case DISPLAY_ZCASH_PARAMS_FETCH:
      return {
        ...state,
        displayZcparamsModal: action.displayZcparamsModal,
      };
    case DISPLAY_COIND_DOWN_MODAL:
      return {
        ...state,
        displayCoindDownModal: action.displayCoindDownModal,
      };
    case DISPLAY_CLAIM_INTEREST_MODAL:
      return {
        ...state,
        displayClaimInterestModal: action.displayClaimInterestModal,
      };
    case DISPLAY_IMPORT_KEY_MODAL:
      return {
        ...state,
        displayImportKeyModal: action.displayImportKeyModal,
      };
    case DASHBOARD_SYNC_ONLY_UPDATE:
      return {
        ...state,
        skipFullDashboardUpdate: action.skipFullDashboardUpdate,
      };
    case ELECTRUM_SERVER_CHANGED:
      return {
        ...state,
        eletrumServerChanged: action.eletrumServerChanged,
      };
    case PRICES:
      return {
        ...state,
        prices: action.prices,
      };
    case EXCHANGES_CACHE:
      exchanges[action.provider] = action.cache;
      
      return {
        ...state,
        exchanges,
      };
    case DASHBOARD_ACTIVE_EXCHANGES_ORDER_MODAL:
      return {
        ...state,
        showExchangesOrderInfoId: action.showExchangesOrderInfoId,
      };
    case DASHBOARD_EXCHANGES_TOS_MODAL:
      return {
        ...state,
        displayExchangesTOSModal: action.display,
      };
    case DASHBOARD_EXCHANGES_SUPPORTED_COINS_MODAL:
      return {
        ...state,
        displayExchangesSupportedCoinsModal: action.display,
      };
    case EXCHANGES_COINSWITCH_COINS:
      exchanges.coinswitchCoins = action.coins;
      
      return {
        ...state,
        exchanges,
      };
    default:
      return state;
  }
}

export default Dashboard;