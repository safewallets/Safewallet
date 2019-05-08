const safeCalcInterest = require('safewallet-wallet-lib/src/safecoin-interest');

module.exports = (api) => {
  api.safeCalcInterest = safeCalcInterest;

  return api;
};