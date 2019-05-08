### This is experimental and unfinished software. Use at your own risk! No warranty for any kind of damage!

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Safewallet Wallet
Safecoins Desktop Multicoin Wallet

## Build & Installation

#### Prerequirements:

1) [Install nodeJS](https://nodejs.org/en/download/package-manager/)/npm

2) Install git
```shell
 apt-get install git
```

#### Build & Start FairExchange-GUI (frontend)

```shell
git clone --recursive https://github.com/safewallets/safewallet --branch master --single-branch
cd safewallet/gui/FairExchange-GUI/react/
git checkout master && git pull origin master
npm update && npm install
npm run build && npm start
```

*Note:* if you have errors during build on master branch try to checkout and build from dev (both safewallet and fairexchange-gui repos). Usually dev has all latest fixes including build scripts. Master is merged when new release comes out.

Leave the above process running and use a new terminal windows/tab when proceeding with the below steps.

Now please create a directory called `bin` inside `assets/` and afterwards copy `safecoind` and `safecoin-cli` to a new subfolder named after the operating system you are building Safewallet for: `linux64`, `osx` or `win64`. 
From within `safewallet/` the structure will be `assets/bin/linux64` (for example on linux).


#### Start Safewallet App (electron)

```shell
cd safewallet
npm update && npm install
npm start
```
In order to use debug/dev mode please stop Safewallet App (electron) and either set `dev: true` and `debug: true` in `~/.safewallet/config.json` and then restart the app or replace step 4) from above with the start command below:

```shell
npm start devmode
```

You re ready to dev!


## Bundling & packaging:

In order to build the release bundles please install the `electron-packager` and `electron-prebuilt` packages:

```shell
npm install electron-packager --save-dev
npm install electron-prebuilt --save-dev
```
We refer to the original [electron-packager](https://github.com/electron-userland/electron-packager) repository for more detailed information and further documentation.

#### Linux

```shell
cd safewallet
./node_modules/.bin/electron-packager . --platform=linux --arch=x64 --icon=assets/icons/safewallet_icons/128x128.png --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/win64 --ignore=assets/bin/osx --overwrite
```
change architecture build parameter to ```--arch=x32``` for 32 bit build

#### OSX

```shell
cd safewallet
./node_modules/.bin/electron-packager . --platform=darwin --arch=x64 --icon=assets/icons/safewallet_icons/safewallet_app_icon.icns --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/win64 --ignore=assets/bin/linux64 --overwrite
```

#### Windows

```shell
dir safewallet
./node_modules/.bin/electron-packager.exe . --platform=win32 --arch=x64 --icon=assets/icons/safewallet_icons/safewallet_app_icon.ico --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/osx --ignore=assets/bin/linux64 --overwrite

# 32bit
electron-packager . --platform=win32 --arch=ia32 --icon=assets/icons/safewallet_icons/safewallet_app_icon.ico --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/osx --ignore=assets/bin/linux64 --overwrite

# x64 and x86
electron-packager . --platform=win32 --arch=all --icon=assets/icons/safewallet_icons/safewallet_app_icon.ico --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/osx --ignore=assets/bin/linux64 --overwrite
```

## Additional bundling tools for deb and rpm packages

[electron-installer-debian](https://github.com/electron-userland/electron-installer-debian)
[electron-installer-redhat](https://github.com/electron-userland/electron-installer-redhat)
