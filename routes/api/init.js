const fs = require('fs-extra');
const path = require('path');
let _foldersInitRan = false;

module.exports = (api) => {
  api.readVersionFile = () => {
    // read app version
    const rootLocation = path.join(__dirname, '../../');
    const localVersionFile = fs.readFileSync(`${rootLocation}version`, 'utf8');

    return localVersionFile;
  }

  api.createSafewalletDirs = () => {
    if (!_foldersInitRan) {
      const rootLocation = path.join(__dirname, '../../');

      fs.readdir(rootLocation, (err, items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].substr(0, 3) === 'gen') {
            api.log(`remove ${items[i]}`, 'init');
            fs.unlinkSync(rootLocation + items[i]);
          }
        }
      });

      if (!fs.existsSync(api.safewalletDir)) {
        fs.mkdirSync(api.safewalletDir);

        if (fs.existsSync(api.safewalletDir)) {
          api.log(`created safewallet folder at ${api.safewalletDir}`, 'init');
          api.writeLog(`created safewallet folder at ${api.safewalletDir}`);
        }
      } else {
        api.log('safewallet folder already exists', 'init');
      }

      if (!fs.existsSync(`${api.safewalletDir}/shepherd`)) {
        fs.mkdirSync(`${api.safewalletDir}/shepherd`);

        if (fs.existsSync(`${api.safewalletDir}/shepherd`)) {
          api.log(`created shepherd folder at ${api.safewalletDir}/shepherd`, 'init');
          api.writeLog(`create shepherd folder at ${api.safewalletDir}/shepherd`);
        }
      } else {
        api.log('safewallet/shepherd folder already exists', 'init');
      }

      const _subFolders = [
        'pin',
        'csv',
        'log',
      ];

      for (let i = 0; i < _subFolders.length; i++) {
        if (!fs.existsSync(`${api.safewalletDir}/shepherd/${_subFolders[i]}`)) {
          fs.mkdirSync(`${api.safewalletDir}/shepherd/${_subFolders[i]}`);

          if (fs.existsSync(`${api.safewalletDir}/shepherd/${_subFolders[i]}`)) {
            api.log(`created ${_subFolders[i]} folder at ${api.safewalletDir}/shepherd/${_subFolders[i]}`, 'init');
            api.writeLog(`create ${_subFolders[i]} folder at ${api.safewalletDir}/shepherd/${_subFolders[i]}`);
          }
        } else {
          api.log(`shepherd/${_subFolders[i]} folder already exists`, 'init');
        }
      }

      if (!fs.existsSync(api.zcashParamsDir)) {
        fs.mkdirSync(api.zcashParamsDir);
      } else {
        api.log('zcashparams folder already exists', 'init');
      }

      _foldersInitRan = true;
    }
  }

  return api;
};