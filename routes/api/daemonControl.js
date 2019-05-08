const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const _fs = require('graceful-fs');
const fsnode = require('fs');
const path = require('path');
const os = require('os');
const portscanner = require('portscanner');
const execFile = require('child_process').execFile;
const md5 = require('safewallet-wallet-lib/src/crypto/md5');
const { safeAssetChains } = require('safewallet-wallet-lib/src/coin-helpers');

module.exports = (api) => {
  const getConf = (flock, coind) => {
    const _platform = os.platform();
    let DaemonConfPath = '';
    let nativeCoindDir;

    if (flock === 'CHIPS') {
      flock = 'chipsd';
    }

    api.log(flock, 'native.confd');
    api.log(`getconf coind ${coind}`, 'native.confd');
    api.writeLog(`getconf flock: ${flock}`, 'native.confd');

    if (coind) {
      switch (_platform) {
        case 'darwin':
          nativeCoindDir = `${process.env.HOME}/Library/Application Support/${api.nativeCoindList[coind.toLowerCase()].bin}`;
          break;
        case 'linux':
          nativeCoindDir = coind ? `${process.env.HOME}/.${api.nativeCoindList[coind.toLowerCase()].bin.toLowerCase()}` : null;
          break;
        case 'win32':
          nativeCoindDir = coind ? `${process.env.APPDATA}/${api.nativeCoindList[coind.toLowerCase()].bin}` : null;
          break;
      }
    }

    switch (flock) {
      case 'safecoind':
        DaemonConfPath = api.safecoinDir;
        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
          api.log('===>>> API OUTPUT ===>>>', 'native.confd');
        }
        break;
      case 'zcashd':
        DaemonConfPath = api.ZcashDir;
        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
        break;
      case 'chipsd':
        DaemonConfPath = api.chipsDir;
        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
        break;
      case 'coind':
        DaemonConfPath = _platform === 'win32' ? path.normalize(`${api.coindRootDir}/${coind.toLowerCase()}`) : `${api.coindRootDir}/${coind.toLowerCase()}`;
        break;
      default:
        DaemonConfPath = `${api.safecoinDir}/${flock}`;
        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
    }

    api.writeLog(`getconf path: ${DaemonConfPath}`);
    api.log(`daemon path: ${DaemonConfPath}`, 'native.confd');

    return DaemonConfPath;
  }

  // TODO: json.stringify wrapper

  const herder = (flock, data, coind) => {
    if (data === undefined) {
      data = 'none';
      api.log('it is undefined', 'native.confd');
    }

    api.log(`herder flock: ${flock} coind: ${coind}`, 'native.confd');
    api.log(`selected data: ${JSON.stringify(data, null, '\t')}`, 'native.confd');

    // TODO: notify gui that reindex/rescan param is used to reflect on the screen
    //       asset chain debug.log unlink
    if (flock === 'safecoind') {
      let safeDebugLogLocation = (data.ac_name !== 'safecoind' ? `${api.safecoinDir}/${data.ac_name}` : api.safecoinDir) + '/debug.log';

      // get custom coind port
      const _coindConf = data.ac_name !== 'safecoind' ? `${api.safecoinDir}/${data.ac_name}/${data.ac_name}.conf` : `${api.safecoinDir}/safecoin.conf`;

      try {
        const _coindConfContents = fs.readFileSync(_coindConf, 'utf8');

        if (_coindConfContents) {
          const _coindCustomPort = _coindConfContents.match(/rpcport=\s*(.*)/);

          if (_coindCustomPort[1]) {
            api.assetChainPorts[data.ac_name] = _coindCustomPort[1];
            api.rpcConf[data.ac_name === 'safecoind' ? 'SAFE' : data.ac_name].port = _coindCustomPort[1];
            api.log(`${data.ac_name} custom port ${_coindCustomPort[1]}`, 'native.confd');
          } else {
            api.assetChainPorts[data.ac_name] = api.assetChainPortsDefault[data.ac_name];
            api.rpcConf[data.ac_name === 'safecoind' ? 'SAFE' : data.ac_name].port = api.assetChainPortsDefault[data.ac_name];
            api.log(`${data.ac_name} port ${api.assetChainPorts[data.ac_name]}`, 'native.confd');
          }
        } else {
          api.assetChainPorts[data.ac_name] = api.assetChainPortsDefault[data.ac_name];
          api.rpcConf[data.ac_name === 'safecoind' ? 'SAFE' : data.ac_name].port = api.assetChainPortsDefault[data.ac_name];
          api.log(`${data.ac_name} port ${api.assetChainPorts[data.ac_name]}`, 'native.confd');
        }
      } catch (e) {
        if (api.rpcConf[data.ac_name === 'safecoind' ? 'SAFE' : data.ac_name]) {
          api.rpcConf[data.ac_name === 'safecoind' ? 'SAFE' : data.ac_name].port = api.assetChainPortsDefault[data.ac_name];
        }
        api.assetChainPorts[data.ac_name] = api.assetChainPortsDefault[data.ac_name];
        api.log(`${data.ac_name} port ${api.assetChainPorts[data.ac_name]}`, 'native.confd');
      }

      api.log('safecoind flock selected...', 'native.confd');
      api.log(`selected data: ${JSON.stringify(data, null, '\t')}`, 'native.confd');
      api.writeLog('safecoind flock selected...', 'native.confd');
      api.writeLog(`selected data: ${data}`, 'native.confd');

      // datadir case, check if safecoin/chain folder exists
      if (api.appConfig.native.dataDir.length &&
          data.ac_name !== 'safecoind') {
        const _dir = data.ac_name !== 'safecoind' ? `${api.safecoinDir}/${data.ac_name}` : api.safecoinDir;

        try {
          _fs.accessSync(_dir, fs.R_OK | fs.W_OK);

          api.log(`safecoind datadir ${_dir} exists`, 'native.confd');
        } catch (e) {
          api.log(`safecoind datadir ${_dir} access err: ${e}`, 'native.confd');
          api.log(`attempting to create safecoind datadir ${_dir}`, 'native.confd');

          fs.mkdirSync(_dir);

          if (fs.existsSync(_dir)) {
            api.log(`created safecoind datadir folder at ${_dir}`, 'native.confd');
          } else {
            api.log(`unable to create safecoind datadir folder at ${_dir}`, 'native.confd');
          }
        }
      }

      // truncate debug.log
      if (!api.safeMainPassiveMode) {
        try {
          const _confFileAccess = _fs.accessSync(
            safeDebugLogLocation,
            fs.R_OK | fs.W_OK
          );

          if (_confFileAccess) {
            api.log(`error accessing ${safeDebugLogLocation}`, 'native.debug');
            api.writeLog(`error accessing ${safeDebugLogLocation}`, 'native.debug');
          } else {
            try {
              fs.unlinkSync(safeDebugLogLocation);
              api.log(`truncate ${safeDebugLogLocation}`, 'native.debug');
              api.writeLog(`truncate ${safeDebugLogLocation}`);
            } catch (e) {
              api.log('cant unlink debug.log', 'native.debug');
            }
          }
        } catch (e) {
          api.log(`safecoind debug.log access err: ${e}`, 'native.debug');
          api.writeLog(`safecoind debug.log access err: ${e}`, 'native.debug');
        }
      }

      // get safecoind instance port
      const _port = api.assetChainPorts[data.ac_name];

      try {
        // check if safecoind instance is already running
        portscanner.checkPortStatus(_port, '127.0.0.1', (error, status) => {
          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'closed' ||
              !api.appConfig.native.stopNativeDaemonsOnQuit) {
            // start safecoind via exec
            const _customParamDict = {
              silent: '&',
              reindex: '-reindex',
              change: '-pubkey=',
              datadir: '-datadir=',
              rescan: '-rescan',
              gen: '-gen',
              regtest: '-regtest',
            };
            let _customParam = '';

            if (data.ac_custom_param === 'silent' ||
                data.ac_custom_param === 'reindex' ||
                data.ac_custom_param === 'rescan' ||
                data.ac_custom_param === 'gen' ||
                data.ac_custom_param === 'regtest') {
              _customParam = ` ${_customParamDict[data.ac_custom_param]}`;
            } else if (
              data.ac_custom_param === 'change' &&
              data.ac_custom_param_value
            ) {
              _customParam = ` ${_customParamDict[data.ac_custom_param]}${data.ac_custom_param_value}`;
            }

            if (api.appConfig.native.dataDir.length) {
              _customParam = `${_customParam} -datadir=${api.appConfig.native.dataDir}${(data.ac_name !== 'safecoind' ? `/${data.ac_name}` : '')}`;
            }

            const isChain = safeAssetChains.indexOf(data.ac_name) > -1 ? true : false;
            const coindACParam = isChain && data.ac_options.indexOf('ac_name') === -1 ? ` -ac_name=${data.ac_name} ` : '';

            api.log(`exec ${api.safecoindBin} ${coindACParam} ${data.ac_options.join(' ')}${_customParam}`, 'native.process');
            api.writeLog(`exec ${api.safecoindBin} ${coindACParam} ${data.ac_options.join(' ')}${_customParam}`, 'native.process');
            api.log(`daemon param ${data.ac_custom_param}`, 'native.confd');

            api.coindInstanceRegistry[data.ac_name] = true;

            if (!api.safeMainPassiveMode) {
              let _arg = `${coindACParam}${data.ac_options.join(' ')}${_customParam}`;
              _arg = _arg.trim().split(' ');
              api.native.startParams[data.ac_name] = _arg;
              
              const _daemonName = data.ac_name !== 'safecoind' ? data.ac_name : 'safecoind';
              const _daemonLogName = `${api.safewalletDir}/${_daemonName}.log`;

              try {
                fs.accessSync(_daemonLogName, fs.R_OK | fs.W_OK);
                api.log(`created ${_daemonLogName}`, 'native.debug');
                fs.unlinkSync(_daemonLogName);
              } catch (e) {
                api.log(`error accessing ${_daemonLogName}, doesnt exist or another proc is already running`, 'native.process');
              }

              if (api.wallet.fname) {
                api.wallet.data.coins = api.getActiveCoins();
                api.updateActiveWalletFSData();
              }

              if (!api.appConfig.native.stopNativeDaemonsOnQuit) {
                let spawnOut = fs.openSync(_daemonLogName, 'a');
                let spawnErr = fs.openSync(_daemonLogName, 'a');

                spawn(api.safecoindBin, _arg, {
                  stdio: [
                    'ignore',
                    spawnOut,
                    spawnErr
                  ],
                  detached: true,
                })
                .unref();
              } else {
                let logStream = fs.createWriteStream(
                  _daemonLogName,
                  { flags: 'a' }
                );

                let _daemonChildProc = execFile(`${api.safecoindBin}`, _arg, {
                  maxBuffer: 1024 * 1000000, // 1000 mb
                }, (error, stdout, stderr) => {
                  api.writeLog(`stdout: ${stdout}`, 'native.debug');
                  api.writeLog(`stderr: ${stderr}`, 'native.debug');

                  if (error !== null) {
                    api.log(`exec error: ${error}`, 'native.debug');
                    api.writeLog(`exec error: ${error}`, 'native.debug');

                    // TODO: check other edge cases
                    if (error.toString().indexOf('using -reindex') > -1) {
                      api.io.emit('service', {
                        safecoind: {
                          error: 'run -reindex',
                        },
                      });
                    }
                  }
                });

                // TODO: logger add verbose native output
                _daemonChildProc.stdout.on('data', (data) => {
                  // api.log(`${_daemonName} stdout: \n${data}`);
                })
                .pipe(logStream);

                _daemonChildProc.stdout.on('error', (data) => {
                  // api.log(`${_daemonName} stdout: \n${data}`);
                })
                .pipe(logStream);

                _daemonChildProc.stderr.on('data', (data) => {
                  // api.error(`${_daemonName} stderr:\n${data}`);
                })
                .pipe(logStream);

                _daemonChildProc.on('exit', (exitCode) => {
                  const _errMsg = exitCode === 0 ? `${_daemonName} exited with code ${exitCode}` : `${_daemonName} exited with code ${exitCode}, crashed?`;

                  fs.appendFile(_daemonLogName, _errMsg, (err) => {
                    if (err) {
                      api.writeLog(_errMsg);
                      api.log(_errMsg, 'native.debug');
                    }
                    api.log(_errMsg, 'native.debug');
                  });
                });
              }
            }
          } else { // deprecated(?)
            if (api.safeMainPassiveMode) {
              api.coindInstanceRegistry[data.ac_name] = true;
            }
            api.log(`port ${_port} (${data.ac_name}) is already in use`, 'native.process');
            api.writeLog(`port ${_port} (${data.ac_name}) is already in use`);
          }
        });
      } catch(e) {
        api.log(`failed to start safecoind err: ${e}`, 'native.process');
        api.writeLog(`failed to start safecoind err: ${e}`);
      }
    }

    // TODO: refactor
    if (flock === 'chipsd') {
      let safeDebugLogLocation = `${api.chipsDir}/debug.log`;

      api.log('chipsd flock selected...', 'native.confd');
      api.log(`selected data: ${JSON.stringify(data, null, '\t')}`, 'native.confd');
      api.writeLog('chipsd flock selected...', 'native.confd');
      api.writeLog(`selected data: ${data}`, 'native.confd');

      // truncate debug.log
      try {
        const _confFileAccess = _fs.accessSync(
          safeDebugLogLocation,
          fs.R_OK | fs.W_OK
        );

        if (_confFileAccess) {
          api.log(`error accessing ${safeDebugLogLocation}`, 'native.debug');
          api.writeLog(`error accessing ${safeDebugLogLocation}`);
        } else {
          try {
            fs.unlinkSync(safeDebugLogLocation);
            api.log(`truncate ${safeDebugLogLocation}`, 'native.debug');
            api.writeLog(`truncate ${safeDebugLogLocation}`);
          } catch (e) {
            api.log('cant unlink debug.log', 'native.debug');
          }
        }
      } catch(e) {
        api.log(`chipsd debug.log access err: ${e}`, 'native.debug');
        api.writeLog(`chipsd debug.log access err: ${e}`);
      }

      // get safecoind instance port
      const _port = api.assetChainPorts.chipsd;

      try {
        // check if safecoind instance is already running
        portscanner.checkPortStatus(_port, '127.0.0.1', (error, status) => {
          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'closed') {
            // start safecoind via exec
            const _customParamDict = {
              silent: '&',
              reindex: '-reindex',
              change: '-pubkey=',
              rescan: '-rescan',
            };
            let _customParam = '';

            if (data.ac_custom_param === 'silent' ||
                data.ac_custom_param === 'reindex' ||
                data.ac_custom_param === 'rescan') {
              _customParam = ` ${_customParamDict[data.ac_custom_param]}`;
            } else if (
              data.ac_custom_param === 'change' &&
              data.ac_custom_param_value
            ) {
              _customParam = ` ${_customParamDict[data.ac_custom_param]}${data.ac_custom_param_value}`;
            }

            api.log(`exec ${api.chipsBin} ${_customParam}`, 'native.process');
            api.writeLog(`exec ${api.chipsBin} ${_customParam}`);

            api.log(`daemon param ${data.ac_custom_param}`, 'native.confd');

            api.coindInstanceRegistry.CHIPS = true;
            let _arg = `${_customParam}`;
            _arg = _arg.trim().split(' ');

            if (_arg &&
                _arg.length > 1) {
              execFile(`${api.chipsBin}`, _arg, {
                maxBuffer: 1024 * 1000000, // 1000 mb
              }, (error, stdout, stderr) => {
                // TODO: verbose
                api.writeLog(`stdout: ${stdout}`);
                api.writeLog(`stderr: ${stderr}`);

                if (error !== null) {
                  api.log(`exec error: ${error}`);
                  api.writeLog(`exec error: ${error}`);

                  if (error.toString().indexOf('using -reindex') > -1) {
                    api.io.emit('service', {
                      safecoind: {
                        error: 'run -reindex',
                      },
                    });
                  }
                }
              });
            } else {
              execFile(`${api.chipsBin}`, {
                maxBuffer: 1024 * 1000000 // 1000 mb
              }, (error, stdout, stderr) => {
                api.writeLog(`stdout: ${stdout}`);
                api.writeLog(`stderr: ${stderr}`);

                if (error !== null) {
                  api.log(`exec error: ${error}`, 'native.process');
                  api.writeLog(`exec error: ${error}`);

                  if (error.toString().indexOf('using -reindex') > -1) {
                    api.io.emit('service', {
                      safecoind: {
                        error: 'run -reindex',
                      },
                    });
                  }
                }
              });
            }
          }
        });
      } catch(e) {
        api.log(`failed to start chipsd err: ${e}`, 'native.process');
        api.writeLog(`failed to start chipsd err: ${e}`);
      }
    }

    if (flock === 'zcashd') { // TODO: fix(?)
      let safeDebugLogLocation = `${api.zcashDir}/debug.log`;

      api.log('zcashd flock selected...', 'native.confd');
      api.log(`selected data: ${data}`, 'native.confd');
      api.writeLog('zcashd flock selected...', 'native.confd');
      api.writeLog(`selected data: ${data}`, 'native.confd');
    }

    if (flock === 'coind') {
      const _osHome = os.platform === 'win32' ? process.env.APPDATA : process.env.HOME;
      let coindDebugLogLocation = `${_osHome}/.${api.nativeCoindList[coind.toLowerCase()].bin.toLowerCase()}/debug.log`;

      api.log(`coind ${coind} flock selected...`, 'native.confd');
      api.log(`selected data: ${JSON.stringify(data, null, '\t')}`, 'native.confd');
      api.writeLog(`coind ${coind} flock selected...`, 'native.confd');
      api.writeLog(`selected data: ${data}`, 'native.confd');

      // truncate debug.log
      try {
        _fs.access(coindDebugLogLocation, fs.constants.R_OK, (err) => {
          if (err) {
            api.log(`error accessing ${coindDebugLogLocation}`, 'native.debug');
            api.writeLog(`error accessing ${coindDebugLogLocation}`);
          } else {
            api.log(`truncate ${coindDebugLogLocation}`, 'native.debug');
            api.writeLog(`truncate ${coindDebugLogLocation}`);
            fs.unlink(coindDebugLogLocation);
          }
        });
      } catch (e) {
        api.log(`coind ${coind} debug.log access err: ${e}`, 'native.debug');
        api.writeLog(`coind ${coind} debug.log access err: ${e}`);
      }

      // get safecoind instance port
      const _port = api.nativeCoindList[coind.toLowerCase()].port;
      const coindBin = `${api.coindRootDir}/${coind.toLowerCase()}/${api.nativeCoindList[coind.toLowerCase()].bin.toLowerCase()}d`;

      try {
        // check if coind instance is already running
        portscanner.checkPortStatus(_port, '127.0.0.1', (error, status) => {
          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'closed') {
            api.log(`exec ${coindBin} ${data.ac_options.join(' ')}`, 'native.process');
            api.writeLog(`exec ${coindBin} ${data.ac_options.join(' ')}`);

            api.coindInstanceRegistry[coind] = true;
            let _arg = `${data.ac_options.join(' ')}`;
            _arg = _arg.trim().split(' ');
            execFile(`${coindBin}`, _arg, {
              maxBuffer: 1024 * 1000000, // 1000 mb
            }, (error, stdout, stderr) => {
              api.writeLog(`stdout: ${stdout}`);
              api.writeLog(`stderr: ${stderr}`);

              if (error !== null) {
                api.log(`exec error: ${error}`, 'native.process');
                api.writeLog(`exec error: ${error}`);
              }
            });
          } else {
            api.log(`port ${_port} (${coind}) is already in use`, 'native.process');
            api.writeLog(`port ${_port} (${coind}) is already in use`);
          }
        });
      } catch (e) {
        api.log(`failed to start ${coind} err: ${e}`, 'native.process');
        api.writeLog(`failed to start ${coind} err: ${e}`);
      }
    }
  }

  const setConf = (flock, coind) => {
    const _platform = os.platform();
    let nativeCoindDir;
    let DaemonConfPath;

    api.log(flock, 'native.confd');
    api.writeLog(`setconf ${flock}`);

    switch (_platform) {
      case 'darwin':
        nativeCoindDir = coind ? `${process.env.HOME}/Library/Application Support/${api.nativeCoindList[coind.toLowerCase()].bin}` : null;
        break;
      case 'linux':
        nativeCoindDir = coind ? `${process.env.HOME}/.${api.nativeCoindList[coind.toLowerCase()].bin.toLowerCase()}` : null;
        break;
      case 'win32':
        nativeCoindDir = coind ?  `${process.env.APPDATA}/${api.nativeCoindList[coind.toLowerCase()].bin}` : null;
        break;
    }

    switch (flock) {
      case 'safecoind':
        DaemonConfPath = `${api.safecoinDir}/safecoin.conf`;

        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
        break;
      case 'zcashd':
        DaemonConfPath = `${api.ZcashDir}/zcash.conf`;

        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
        break;
      case 'chipsd':
        DaemonConfPath = `${api.chipsDir}/chips.conf`;

        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
        break;
      case 'coind':
        DaemonConfPath = `${nativeCoindDir}/${api.nativeCoindList[coind.toLowerCase()].bin.toLowerCase()}.conf`;

        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
        break;
      default:
        DaemonConfPath = `${api.safecoinDir}/${flock}/${flock}.conf`;

        if (_platform === 'win32') {
          DaemonConfPath = path.normalize(DaemonConfPath);
        }
    }

    api.log(DaemonConfPath, 'native.confd');
    api.writeLog(`setconf ${DaemonConfPath}`);

    const CheckFileExists = () => {
      return new Promise((resolve, reject) => {
        const result = 'Check Conf file exists is done';
        const confFileExist = fs.ensureFileSync(DaemonConfPath);

        if (confFileExist) {
          api.log(result, 'native.confd');
          api.writeLog(`setconf ${result}`);

          resolve(result);
        } else {
          api.log('conf file doesnt exist', 'native.confd');
          resolve('conf file doesnt exist');
        }
      });
    }

    const FixFilePermissions = () => {
      return new Promise((resolve, reject) => {
        const result = 'Conf file permissions updated to Read/Write';

        fsnode.chmodSync(DaemonConfPath, '0666');
        api.log(result, 'native.confd');
        api.writeLog(`setconf ${result}`);

        resolve(result);
      });
    }

    const RemoveLines = () => {
      return new Promise((resolve, reject) => {
        const result = 'RemoveLines is done';

        fs.readFile(DaemonConfPath, 'utf8', (err, data) => {
          if (err) {
            api.writeLog(`setconf error ${err}`);
            return api.log(err);
          }

          const rmlines = data.replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, '\n');

          fs.writeFile(DaemonConfPath, rmlines, 'utf8', (err) => {
            if (err)
              return api.log(err);

            fsnode.chmodSync(DaemonConfPath, '0666');
            api.writeLog(`setconf ${result}`, 'native.confd');
            api.log(result);
            resolve(result);
          });
        });
      });
    }

    const CheckConf = () => {
      return new Promise((resolve, reject) => {
        const result = 'CheckConf is done';

        api.setconf.status(DaemonConfPath, (err, status) => {
          const rpcuser = () => {
            return new Promise((resolve, reject) => {
              const result = 'checking rpcuser...';

              if (status[0].hasOwnProperty('rpcuser')) {
                api.log('rpcuser: OK', 'native.confd');
                api.writeLog('rpcuser: OK');
              } else {
                const randomstring = md5((Math.random() * Math.random() * 999).toString());

                api.log('rpcuser: NOT FOUND', 'native.confd');
                api.writeLog('rpcuser: NOT FOUND');

                fs.appendFile(DaemonConfPath, `\nrpcuser=user${randomstring.substring(0, 16)}`, (err) => {
                  if (err) {
                    api.writeLog(`append daemon conf err: ${err}`);
                    api.log(`append daemon conf err: ${err}`, 'native.confd');
                  }
                  // throw err;
                  api.log('rpcuser: ADDED', 'native.confd');
                  api.writeLog('rpcuser: ADDED');
                });
              }

              resolve(result);
            });
          }

          const rpcpass = () => {
            return new Promise((resolve, reject) => {
              const result = 'checking rpcpassword...';

              if (status[0].hasOwnProperty('rpcpassword')) {
                api.log('rpcpassword: OK', 'native.confd');
                api.writeLog('rpcpassword: OK');
              } else {
                const randomstring = md5((Math.random() * Math.random() * 999).toString());

                api.log('rpcpassword: NOT FOUND');
                api.writeLog('rpcpassword: NOT FOUND');

                fs.appendFile(DaemonConfPath, `\nrpcpassword=${randomstring}`, (err) => {
                  if (err) {
                    api.writeLog(`append daemon conf err: ${err}`);
                    api.log(`append daemon conf err: ${err}`, 'native.confd');
                  }
                  api.log('rpcpassword: ADDED', 'native.confd');
                  api.writeLog('rpcpassword: ADDED');
                });
              }

              resolve(result);
            });
          }

          const rpcport = () => {
            return new Promise((resolve, reject) => {
              const result = 'checking rpcport...';

              if (flock === 'safecoind') {
                if (status[0].hasOwnProperty('rpcport')) {
                  api.log('rpcport: OK', 'native.confd');
                  api.writeLog('rpcport: OK');
                } else {
                  api.log('rpcport: NOT FOUND', 'native.confd');
                  api.writeLog('rpcport: NOT FOUND');

                  fs.appendFile(DaemonConfPath, '\nrpcport=8771', (err) => {
                    if (err) {
                      api.writeLog(`append daemon conf err: ${err}`);
                      api.log(`append daemon conf err: ${err}`, 'native.confd');
                    }
                    api.log('rpcport: ADDED', 'native.confd');
                    api.writeLog('rpcport: ADDED');
                  });
                }
              }

              resolve(result);
            });
          }

          const server = () => {
            return new Promise((resolve, reject) => {
              const result = 'checking server...';

              if (status[0].hasOwnProperty('server')) {
                api.log('server: OK', 'native.confd');
                api.writeLog('server: OK');
              } else {
                api.log('server: NOT FOUND');
                api.writeLog('server: NOT FOUND');

                fs.appendFile(DaemonConfPath, '\nserver=1', (err) => {
                  if (err) {
                    api.writeLog(`append daemon conf err: ${err}`, 'native.confd');
                    api.log(`append daemon conf err: ${err}`);
                  }
                  // throw err;
                  api.log('server: ADDED', 'native.confd');
                  api.writeLog('server: ADDED');
                });
              }

              resolve(result);
            });
          }

          const addnode = () => {
            return new Promise((resolve, reject) => {
              const result = 'checking addnode...';

              if (flock === 'chipsd' ||
                  flock === 'safecoind') {
                if (status[0].hasOwnProperty('addnode')) {
                  api.log('addnode: OK', 'native.confd');
                  api.writeLog('addnode: OK');
                } else {
                  let nodesList;

                  if (flock === 'chipsd') {
                    nodesList = '\naddnode=95.110.191.193' +
                    '\naddnode=144.76.167.66' +
                    '\naddnode=158.69.248.93' +
                    '\naddnode=149.202.49.218' +
                    '\naddnode=95.213.205.222' +
                    '\naddnode=5.9.253.198' +
                    '\naddnode=164.132.224.253' +
                    '\naddnode=163.172.4.66' +
                    '\naddnode=217.182.194.216' +
                    '\naddnode=94.130.96.114' +
                    '\naddnode=5.9.253.195';
                  } else if (flock === 'safecoind') {
                    nodesList = '\naddnode=78.47.196.146' +
                    '\naddnode=5.9.102.210' +
                    '\naddnode=178.63.69.164' +
                    '\naddnode=88.198.65.74' +
                    '\naddnode=5.9.122.241' +
                    '\naddnode=144.76.94.3';
                  }

                  api.log('addnode: NOT FOUND', 'native.confd');
                  fs.appendFile(DaemonConfPath, nodesList, (err) => {
                    if (err) {
                      api.writeLog(`append daemon conf err: ${err}`);
                      api.log(`append daemon conf err: ${err}`, 'native.confd');
                    }
                    api.log('addnode: ADDED', 'native.confd');
                    api.writeLog('addnode: ADDED');
                  });
                }
              } else {
                result = 'skip addnode';
              }

              resolve(result);
            });
          }

          rpcuser()
          .then((result) => {
            return rpcpass();
          })
          .then(server)
          .then(rpcport)
          .then(addnode);
        });

        api.log(result, 'native.confd');
        api.writeLog(`checkconf addnode ${result}`);

        resolve(result);
      });
    }

    CheckFileExists()
    .then((result) => {
      return FixFilePermissions();
    })
    .then(RemoveLines)
    .then(CheckConf);
  }

  /*
   *  type: POST
   *  params: herd
   */
  api.post('/herd', (req, res) => {
    if (api.checkToken(req.body.token)) {
      const _body = req.body;
      api.log('herd req.body =>', 'native.confd');
      api.log(_body, 'native.confd');

      if (_body.options &&
          !api.safeMainPassiveMode) {
        const testCoindPort = (skipError) => {
          const _acName = req.body.options.ac_name;

          if (!api.lockDownAddCoin) {
            const _port = api.assetChainPorts[_acName];

            portscanner.checkPortStatus(_port, '127.0.0.1', (error, status) => {
              // Status is 'open' if currently in use or 'closed' if available
              if (status === 'open' &&
                  api.appConfig.native.stopNativeDaemonsOnQuit) {
                if (!skipError) {
                  api.log(`safecoind service start error at port ${_port}, reason: port is closed`, 'native.process');
                  api.writeLog(`safecoind service start error at port ${_port}, reason: port is closed`);
                  api.io.emit('service', {
                    safecoind: {
                      error: `error starting ${_body.herd} ${_acName} daemon. Port ${_port} is already taken!`,
                    },
                  });

                  const retObj = {
                    msg: 'error',
                    result: `error starting ${_body.herd} ${_acName} daemon. Port ${_port} is already taken!`,
                  };

                  res.status(500);
                  res.end(JSON.stringify(retObj));
                } else {
                  api.log(`safecoind service start success at port ${_port}`, 'native.process');
                  api.writeLog(`safecoind service start success at port ${_port}`);
                }
              } else {
                if (!skipError) {
                  herder(_body.herd, _body.options);

                  const retObj = {
                    msg: 'success',
                    result: 'result',
                  };

                  res.end(JSON.stringify(retObj));
                } else {
                  api.log(`safecoind service start error at port ${_port}, reason: unknown`, 'native.process');
                  api.writeLog(`safecoind service start error at port ${_port}, reason: unknown`);
                }
              }
            });
          }
        }

        if (_body.herd === 'safecoind') {
          // check if safecoind instance is already running
          testCoindPort();
          setTimeout(() => {
            testCoindPort(true);
          }, 10000);
        } else {
          herder(_body.herd, _body.options, _body.coind);

          const retObj = {
            msg: 'success',
            result: 'result',
          };

          res.end(JSON.stringify(retObj));
        }
      } else {
        // (?)
        herder(_body.herd, _body.options);

        const retObj = {
          msg: 'success',
          result: 'result',
        };

        res.end(JSON.stringify(retObj));
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: POST
   */
  api.post('/setconf', (req, res) => {
    if (api.checkToken(req.body.token)) {
      const _body = req.body;

      api.log('setconf req.body =>', 'native.confd');
      api.log(_body, 'native.confd');

      if (os.platform() === 'win32' &&
          _body.chain == 'safecoind') {
        setsafecoinconf = spawn(path.join(__dirname, '../assets/bin/win64/gensafeconf.bat'));
      } else {
        api.setConf(_body.chain);
      }

      const retObj = {
        msg: 'success',
        result: 'result',
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: POST
   */
  api.post('/getconf', (req, res) => {
    const _body = req.body;

    if (api.checkToken(_body.token)) {
      api.log('getconf req.body =>', 'native.confd');
      api.log(_body, 'native.confd');

      const confpath = getConf(_body.chain, _body.coind);

      api.log(`getconf path is: ${confpath}`, 'native.confd');
      api.writeLog(`getconf path is: ${confpath}`, 'native.confd');

      const retObj = {
        msg: 'success',
        result: confpath,
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.setConfSAFE = (isChips) => {
    // check if safe conf exists
    _fs.access(isChips ? `${api.chipsDir}/chips.conf` : `${api.safecoinDir}/safecoin.conf`, fs.constants.R_OK, (err) => {
      if (err) {
        api.log(isChips ? 'creating chips conf' : 'creating safecoin conf', 'native.confd');
        api.writeLog(isChips ? `creating chips conf in ${api.chipsDir}/chips.conf` : `creating safecoin conf in ${api.safecoinDir}/safecoin.conf`);
        setConf(isChips ? 'chipsd' : 'safecoind');
      } else {
        const _confSize = fs.lstatSync(isChips ? `${api.chipsDir}/chips.conf` : `${api.safecoinDir}/safecoin.conf`);

        if (_confSize.size === 0) {
          api.log(isChips ? 'err: chips conf file is empty, creating chips conf' : 'err: safecoin conf file is empty, creating safecoin conf', 'native.confd');
          api.writeLog(isChips ? `creating chips conf in ${api.chipsDir}/chips.conf` : `creating safecoin conf in ${api.safecoinDir}/safecoin.conf`);
          setConf(isChips ? 'chipsd' : 'safecoind');
        } else {
          api.writeLog(isChips ? 'chips conf exists' : 'safecoin conf exists');
          api.log(isChips ? 'chips conf exists' : 'safecoin conf exists', 'native.confd');
        }
      }
    });
  }

  api.getAssetChainPorts = () => {
    return api.assetChainPorts;
  }

  return api;
};