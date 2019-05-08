const fs = require('fs-extra');
const os = require('os');
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const request = require('request');

module.exports = (api) => {
  api.getConf = (chain) => {
    let _confLocation = chain === 'safecoind' ? `${api.safecoinDir}/safecoin.conf` : `${api.safecoinDir}/${chain}/${chain}.conf`;
    _confLocation = chain === 'CHIPS' ? `${api.chipsDir}/chips.conf` : _confLocation;

    // any coind
    if (chain) {
      if (api.nativeCoindList[chain.toLowerCase()]) {
        const _osHome = os.platform === 'win32' ? process.env.APPDATA : process.env.HOME;
        let coindDebugLogLocation = `${_osHome}/.${api.nativeCoindList[chain.toLowerCase()].bin.toLowerCase()}/debug.log`;

        _confLocation = `${_osHome}/.${api.nativeCoindList[chain.toLowerCase()].bin.toLowerCase()}/${api.nativeCoindList[chain.toLowerCase()].bin.toLowerCase()}.conf`;
      }

      if (fs.existsSync(_confLocation)) {
        const _rpcConf = fs.readFileSync(_confLocation, 'utf8');
        let _port = api.assetChainPorts[chain];

        // any coind
        if (api.nativeCoindList[chain.toLowerCase()]) {
          _port = api.nativeCoindList[chain.toLowerCase()].port;
        }

        if (_rpcConf.length) {
          let _match;
          let parsedRpcConfig = {
            user: '',
            pass: '',
            port: _port,
          };

          if (_match = _rpcConf.match(/rpcuser=\s*(.*)/)) {
            parsedRpcConfig.user = _match[1];
          }

          if ((_match = _rpcConf.match(/rpcpass=\s*(.*)/)) ||
              (_match = _rpcConf.match(/rpcpassword=\s*(.*)/))) {
            parsedRpcConfig.pass = _match[1];
          }

          if (api.nativeCoindList[chain.toLowerCase()]) {
            api.rpcConf[chain] = parsedRpcConfig;
          } else {
            api.rpcConf[chain === 'safecoind' ? 'SAFE' : chain] = parsedRpcConfig;
          }
        } else {
          api.log(`${_confLocation} is empty`, 'native.confd');
        }
      } else {
        api.log(`${_confLocation} doesnt exist`, 'native.confd');
      }
    }
  }

  /*
   *  type: POST
   *  params: payload
   */
  api.post('/cli', (req, res, next) => {
    const payload = req.body.payload;

    if (api.checkToken(payload.token)) {
      if (!payload) {
        const retObj = {
          msg: 'error',
          result: 'no payload provided',
        };

        res.end(JSON.stringify(retObj));
      /*} else if (!payload.cmd.match(/^[0-9a-zA-Z _\,\.\[\]"'/\\]+$/g)) {
        const retObj = {
          msg: 'error',
          result: 'wrong cli string format',
        };

        res.end(JSON.stringify(retObj));*/
      } else {
        const _mode = payload.mode === 'passthru' ? 'passthru' : 'default';
        const _chain = payload.chain === 'SAFE' ? null : payload.chain;
        let _params = payload.params ? ` ${payload.params}` : '';
        let _cmd = payload.cmd;

        if (!api.rpcConf[_chain]) {
          api.getConf(payload.chain === 'SAFE' || !payload.chain && api.safeMainPassiveMode ? 'safecoind' : payload.chain);
        }

        if (_mode === 'default') {
          if (payload.rpc2cli === true) {
            let _coindCliBin = api.safecoincliBin;

            api.log(`${payload.chain} ${payload.cmd} ${payload.rpc2cli}`, 'native.rpc2cli');

            if (api.nativeCoindList &&
                _chain &&
                api.nativeCoindList[_chain.toLowerCase()]) {
              _coindCliBin = `${api.coindRootDir}/${_chain.toLowerCase()}/${api.nativeCoindList[_chain.toLowerCase()].bin.toLowerCase()}-cli`;
            }

            if (_params.indexOf('*')) {
              _params = _params.replace('*', '"*"');
            }
            if (_params.indexOf(',') > -1) {
              _params = _params.split(',');
            }
            if (_cmd.indexOf('getaddressesbyaccount') > -1) {
              _cmd = 'getaddressesbyaccount ""';
            }

            let _arg = (_chain ? ' -ac_name=' + _chain : '') + ' ' + _cmd + (typeof _params === 'object' ? _params.join(' ') : _params);

            if (api.appConfig.native.dataDir.length) {
              _arg = `${_arg} -datadir=${api.appConfig.native.dataDir  + (_chain ? '/' + key : '')}`;
            }

            exec(`"${_coindCliBin}" ${_arg}`, {
              maxBuffer: 1024 * 1000000 // 1000 mb
            }, (error, stdout, stderr) => {
              // api.log(`stdout: ${stdout}`, 'native.debug');
              // api.log(`stderr: ${stderr}`, 'native.debug');

              if (error !== null) {
                api.log(`exec error: ${error}`, 'native.cli');
              }

              let retObj;

              if (stderr) {
                let _res;
                let _error;

                if (_chain !== 'safecoind' &&
                    stderr.indexOf(`error creating`) > -1) {
                  api.log(`replace error creating (gen${_chain})`, 'native.debug');
                  stderr = stderr.replace(`error creating (gen${_chain})`, '');
                  api.log(stderr, 'native.debug');
                }

                if ((stderr.indexOf('{') > -1 && stderr.indexOf('}') > -1) ||
                    (stderr.indexOf('[') > -1 && stderr.indexOf(']') > -1)) {
                  try {
                    _res = JSON.parse(stderr);
                  } catch (e) {
                    _error = {
                      code: -777,
                      message: 'can\'t parse json, max buffer size is exceeded?',
                    };
                  }
                } else {
                  _res = stderr.trim();
                }

                if (stderr.indexOf('error code:') > -1) {
                  _error = {
                    code: Number(stderr.substring(stderr.indexOf('error code:') + 11, stderr.indexOf('error message:') - stderr.indexOf('error code:')).trim()),
                    message: stderr.substring(stderr.indexOf('error message:') + 15, stderr.length).trim(),
                  };
                }

                if (_error) {
                  retObj = {
                    error: _error,
                  };
                } else {
                  retObj = {
                    result: _res,
                  };
                }
              } else {
                let _res;
                let _error;

                if (_chain !== 'safecoind' &&
                    stdout.indexOf(`error creating`) > -1) {
                  api.log(`replace error creating (gen${_chain})`, 'native.debug');
                  stdout = stdout.replace(`error creating (gen${_chain})`, '');
                  api.log(stdout, 'native.debug');
                }

                if ((stdout.indexOf('{') > -1 && stdout.indexOf('}') > -1) ||
                    (stdout.indexOf('[') > -1 && stdout.indexOf(']') > -1)) {
                  try {
                    _res = JSON.parse(stdout);
                  } catch (e) {
                    _error = {
                      code: -777,
                      message: 'can\'t parse json, max buffer size is exceeded?',
                    };
                  }
                } else {
                  _res = stdout.trim();
                }

                if (stdout.indexOf('error code:') > -1) {
                  _error = {
                    code: Number(stdout.substring(stdout.indexOf('error code:') + 11, stdout.indexOf('error message:') - stdout.indexOf('error code:')).trim()),
                    message: stdout.substring(stdout.indexOf('error message:') + 15, stdout.length).trim(),
                  };
                }

                if (_error) {
                  retObj = {
                    error: _error,
                  };
                } else {
                  retObj = {
                    result: _res,
                  };
                }
              }

              res.end(JSON.stringify(retObj));
              // api.killRogueProcess('safecoin-cli');
            });
          } else {
            if (_cmd === 'debug' &&
                _chain !== 'CHIPS') {
              if (api.nativeCoindList[_chain.toLowerCase()]) {
                const _osHome = os.platform === 'win32' ? process.env.APPDATA : process.env.HOME;
                let coindDebugLogLocation;

                if (_chain === 'CHIPS') {
                  coindDebugLogLocation = `${api.chipsDir}/debug.log`;
                } else {
                  coindDebugLogLocation = `${_osHome}/.${api.nativeCoindList[_chain.toLowerCase()].bin.toLowerCase()}/debug.log`;
                }

                api.readDebugLog(coindDebugLogLocation, 1)
                .then((result) => {
                  const retObj = {
                    msg: 'success',
                    result: result,
                  };

                  // api.log('bitcoinrpc debug ====>');
                  // console.log(result);

                  res.end(JSON.stringify(retObj));
                }, (result) => {
                  const retObj = {
                    error: result,
                    result: 'error',
                  };

                  res.end(JSON.stringify(retObj));
                });
              } else {
                const retObj = {
                  error: 'bitcoinrpc debug error',
                  result: 'error',
                };
                res.end(retObj);
                // console.log('bitcoinrpc debug error');
              }
            } else {
              if (_chain === 'CHIPS' &&
                  _cmd === 'debug') {
                _cmd = 'getblockchaininfo';
              }

              let _body = {
                agent: 'bitcoinrpc',
                method: _cmd,
              };

              if (payload.params) {
                _body = {
                  agent: 'bitcoinrpc',
                  method: _cmd,
                  params: payload.params === ' ' ? [''] : payload.params,
                };
              }

              if (req.body.payload.chain) {
                const options = {
                  url: `http://localhost:${api.rpcConf[payload.chain].port}`,
                  method: 'POST',
                  auth: {
                    user: api.rpcConf[payload.chain].user,
                    pass: api.rpcConf[payload.chain].pass,
                  },
                  body: JSON.stringify(_body),
                };

                // send back body on both success and error
                // this bit replicates iguana core's behaviour
                request(options, (error, response, body) => {
                  if (response &&
                      response.statusCode &&
                      response.statusCode === 200) {
                    res.end(body);
                  } else {
                    const retObj = {
                      result: 'error',
                      error: {
                        code: -777,
                        message: `unable to call method ${_cmd} at port ${api.rpcConf[payload.chain].port}`,
                      },
                    };
                    res.end(body ? body : JSON.stringify(retObj));
                  }
                });
              }
            }
          }
        } else {
          let _coindCliBin = api.safecoincliBin;

          if (api.nativeCoindList &&
              _chain &&
              api.nativeCoindList[_chain.toLowerCase()]) {
            _coindCliBin = `${api.coindRootDir}/${_chain.toLowerCase()}/${api.nativeCoindList[_chain.toLowerCase()].bin.toLowerCase()}-cli`;
          }

          let _arg = (_chain ? ' -ac_name=' + _chain : '') + ' ' + _cmd + _params;

          if (api.appConfig.native.dataDir.length) {
            _arg = `${_arg} -datadir=${api.appConfig.native.dataDir  + (_chain ? '/' + key : '')}`;
          }

          _arg = _arg.trim().split(' ');
          execFile(_coindCliBin, _arg, {
            maxBuffer: 1024 * 1000000 // 1000 mb
          }, (error, stdout, stderr) => {
            api.log(`stdout: ${stdout}`, 'native.debug');
            api.log(`stderr: ${stderr}`, 'native.debug');

            if (error !== null) {
              api.log(`exec error: ${error}`);
            }

            let retObj;

            if (stderr) {
              retObj = {
                msg: 'error',
                result: stderr,
              };
            } else {
              retObj = {
                msg: 'success',
                result: stdout,
              };
            }

            res.end(JSON.stringify(retObj));
            api.killRogueProcess('safecoin-cli');
          });
        }
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};