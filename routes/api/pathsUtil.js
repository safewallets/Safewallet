const path = require('path');
const fixPath = require('fix-path');
const os = require('os');

const pathsSafewallet = () => {
  switch (os.platform()) {
    case 'darwin':
      fixPath();
      return `${process.env.HOME}/Library/Application Support/Safewallet`;
      break;

    case 'linux':
      return `${process.env.HOME}/.safewallet`;
      break;

    case 'win32':
      const safewalletDir = `${process.env.APPDATA}/Safewallet`;
      return path.normalize(safewalletDir);
      break;
  }
};

const pathsDaemons = (api) => {
  if (!api) api = {};

  switch (os.platform()) {
    case 'darwin':
      fixPath();
      api.safewalletTestDir = `${process.env.HOME}/Library/Application Support/Safewallet/test`,
      api.safecoindBin = path.join(__dirname, '../../assets/bin/osx/safecoind'),
      api.safecoincliBin = path.join(__dirname, '../../assets/bin/osx/safecoin-cli'),
      api.safecoincliDir = path.join(__dirname, '../../assets/bin/osx'),
      api.safecoinDir = api.appConfig && api.appConfig.native.dataDir.length ? api.appConfig.native.dataDir : `${process.env.HOME}/Library/Application Support/Safecoin`,
      api.zcashdBin = '/Applications/ZCashSwingWalletUI.app/Contents/MacOS/zcashd',
      api.zcashcliBin = '/Applications/ZCashSwingWalletUI.app/Contents/MacOS/zcash-cli',
      api.zcashDir = `${process.env.HOME}/Library/Application Support/Zcash`,
      api.zcashParamsDir = `${process.env.HOME}/Library/Application Support/ZcashParams`,
      api.chipsBin = path.join(__dirname, '../../assets/bin/osx/chipsd'),
      api.chipscliBin = path.join(__dirname, '../../assets/bin/osx/chips-cli'),
      api.chipsDir = `${process.env.HOME}/Library/Application Support/Chips`,
      api.coindRootDir = path.join(__dirname, '../../assets/bin/osx/dex/coind'),
      api.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/darwin/x64/marketmaker');
      return api;
      break;

    case 'linux':
      api.safewalletTestDir = `${process.env.HOME}/.safewallet/test`,
      api.safecoindBin = path.join(__dirname, '../../assets/bin/linux64/safecoind'),
      api.safecoincliBin = path.join(__dirname, '../../assets/bin/linux64/safecoin-cli'),
      api.safecoincliDir = path.join(__dirname, '../../assets/bin/linux64'),
      api.safecoinDir = api.appConfig && api && api.appConfig.native.dataDir.length ? api.appConfig.native.dataDir : `${process.env.HOME}/.safecoin`,
      api.zcashParamsDir = `${process.env.HOME}/.zcash-params`,
      api.chipsBin = path.join(__dirname, '../../assets/bin/linux64/chipsd'),
      api.chipscliBin = path.join(__dirname, '../../assets/bin/linux64/chips-cli'),
      api.chipsDir = `${process.env.HOME}/.chips`,
      api.coindRootDir = path.join(__dirname, '../../assets/bin/linux64/dex/coind'),
      api.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/linux/x64/marketmaker');
      return api;
      break;

    case 'win32':
      api.safewalletTestDir = `${process.env.APPDATA}/Safewallet/test`;
      api.safewalletTestDir = path.normalize(api.safewalletTestDir);
      api.safecoindBin = path.join(__dirname, '../../assets/bin/win64/safecoind.exe'),
      api.safecoindBin = path.normalize(api.safecoindBin),
      api.safecoincliBin = path.join(__dirname, '../../assets/bin/win64/safecoin-cli.exe'),
      api.safecoincliBin = path.normalize(api.safecoincliBin),
      api.safecoincliDir = path.join(__dirname, '../../assets/bin/win64'),
      api.safecoincliDir = path.normalize(api.safecoincliDir),
      api.safecoinDir = api.appConfig && api && api.appConfig.native.dataDir.length ? api.appConfig.native.dataDir : `${process.env.APPDATA}/Safecoin`,
      api.safecoinDir = path.normalize(api.safecoinDir);
      api.chipsBin = path.join(__dirname, '../../assets/bin/win64/chipsd.exe'),
      api.chipsBin = path.normalize(api.chipsBin),
      api.chipscliBin = path.join(__dirname, '../../assets/bin/win64/chips-cli.exe'),
      api.chipscliBin = path.normalize(api.chipscliBin),
      api.chipsDir = `${process.env.APPDATA}/Chips`,
      api.chipsDir = path.normalize(api.chipsDir);
      api.zcashParamsDir = `${process.env.APPDATA}/ZcashParams`;
      api.zcashParamsDir = path.normalize(api.zcashParamsDir);
      api.coindRootDir = path.join(__dirname, '../../assets/bin/osx/dex/coind');
      api.coindRootDir = path.normalize(api.coindRootDir);
      api.mmBin = path.join(__dirname, '../../node_modules/marketmaker/bin/win32/x64/marketmaker.exe');
      api.mmBin = path.normalize(api.mmBin);
      return api;
      break;
  }
}

module.exports = {
  pathsSafewallet,
  pathsDaemons,
};