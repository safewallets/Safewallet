const {
  pathsSafewallet,
  pathsDaemons,
} = require('./pathsUtil');
const path = require('path');
const fixPath = require('fix-path');
const os = require('os');

module.exports = (api) => {
  api.pathsSafewallet = () => {
    api.safewalletDir = pathsSafewallet();
  }

  api.pathsDaemons = () => {
    api = pathsDaemons(api);
  }

  return api;
};