// prequsites: https://www.npmjs.com/package/electron-installer-dmg

var installer = require('electron-installer-dmg');

var options = {
  appPath: 'build/Safewallet-darwin-x64/Safewallet.app',
  dest: 'build/',
  arch: 'amd64',
  icon: 'assets/icons/safewallet_icons/64x64.png',
  name: 'safewallet-app',
  bin: 'Safewallet',
  categories: ['Office', 'Internet'],
  homepage: 'https://safecoin.org',
  maintainer: 'Safecoin <safe@safecoin.org>',
}

console.log('Creating package (this may take a while)');

installer(options, function (err) {
  if (err) {
    console.error(err, err.stack);
    process.exit(1);
  }

  console.log('Successfully created package at ' + options.dest);
});