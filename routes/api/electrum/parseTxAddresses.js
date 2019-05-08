const parseTransactionAddresses = require('safewallet-wallet-lib/src/transaction-type');

module.exports = (api) => {
  api.parseTransactionAddresses = parseTransactionAddresses;

  return api;
};