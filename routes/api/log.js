const fs = require('fs-extra');
const { secondsToString } = require('safewallet-wallet-lib/src/time');

module.exports = (api) => {
  api.log = (msg, type) => {
    if (api.appConfig.dev ||
        api.appConfig.debug ||
        process.argv.indexOf('devmode') > -1) {
      if (type) {
        console.log(`\x1b[94m${type}`, '\x1b[0m', msg);
      } else {
        console.log(msg);
      }
    }

    api.appRuntimeLog.push({
      time: Date.now(),
      msg: msg,
      type: type,
    });
  }

  api.writeLog = (data) => {
    const logLocation = `${api.safewalletDir}/shepherd`;
    const timeFormatted = new Date(Date.now()).toLocaleString('en-US', { hour12: false });

    if (api.appConfig.debug) {
      if (fs.existsSync(`${logLocation}/safewalletlog.txt`)) {
        fs.appendFile(`${logLocation}/safewalletlog.txt`, `${timeFormatted}  ${data}\r\n`, (err) => {
          if (err) {
            api.log('error writing log file');
          }
        });
      } else {
        fs.writeFile(`${logLocation}/safewalletlog.txt`, `${timeFormatted}  ${data}\r\n`, (err) => {
          if (err) {
            api.log('error writing log file');
          }
        });
      }
    }
  }

  api.get('/log/runtime', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      let _res = JSON.parse(JSON.stringify(api.appRuntimeLog));
      let _searchTerm = req.query.term;
      let _logType = req.query.type;

      if (_logType) {
        _res = _res.filter(req.query.typeExact ? item => item.type === _logType : item => item.type.indexOf(_logType) > -1);
      }

      if (_searchTerm) {
        let _searchRes = [];

        for (let i = 0; i < _res.length; i++) {
          if (JSON.stringify(_res[i].msg).indexOf(_searchTerm) > -1) {
            _searchRes.push(_res[i]);
          }
        }

        if (_searchRes.length) {
          const retObj = {
            msg: 'success',
            result: _searchRes,
          };

          res.end(JSON.stringify(retObj));
        } else {
          const retObj = {
            msg: 'success',
            result: 'can\'t find any matching for ' + _searchTerm,
          };

          res.end(JSON.stringify(retObj));
        }
      } else {
        const retObj = {
          msg: 'success',
          result: _res,
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

  api.get('/log/runtime/dump', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      if (req.query.stringify) {
        const retObj = {
          msg: 'success',
          result: JSON.stringify(api.appRuntimeLog),
        };
        res.end(JSON.stringify(retObj));
      } else {
        const _log = JSON.parse(JSON.stringify(api.appRuntimeLog));
        const _time = secondsToString(Date.now() / 1000).replace(/\s+/g, '-');

        const err = fs.writeFileSync(
          `${api.safewalletDir}/shepherd/log/log-${_time}.json`,
          JSON.stringify(_log),
          'utf8'
        );

        if (err) {
          const retObj = {
            msg: 'error',
            result: 'can\'t create a file',
          };
          res.end(JSON.stringify(retObj));
        } else {
          const retObj = {
            msg: 'success',
            result: `${api.safewalletDir}/shepherd/log/log-${_time}.json`,
          };
          res.end(JSON.stringify(retObj));
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

  api.getAppRuntimeLog = () => {
    return new Promise((resolve, reject) => {
      resolve(api.appRuntimeLog);
    });
  };

  /*  needs a fix
   *  type: POST
   *  params: payload
   */
  api.post('/guilog', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const logLocation = `${api.safewalletDir}/shepherd`;
      const timestamp = req.body.timestamp;

      if (!api.guiLog[api.appSessionHash]) {
        api.guiLog[api.appSessionHash] = {};
      }

      if (api.guiLog[api.appSessionHash][timestamp]) {
        api.guiLog[api.appSessionHash][timestamp].status = req.body.status;
        api.guiLog[api.appSessionHash][timestamp].response = req.body.response;
      } else {
        api.guiLog[api.appSessionHash][timestamp] = {
          function: req.body.function,
          type: req.body.type,
          url: req.body.url,
          payload: req.body.payload,
          status: req.body.status,
        };
      }

      fs.writeFile(`${logLocation}/safewalletlog.json`, JSON.stringify(api.guiLog), (err) => {
        if (err) {
          api.writeLog('error writing gui log file');
        }

        const retObj = {
          msg: 'success',
          result: 'gui log entry is added',
        };

        res.end(JSON.stringify(retObj));
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *  params: type
   */
  api.get('/getlog', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const logExt = req.query.type === 'txt' ? 'txt' : 'json';

      if (fs.existsSync(`${api.safewalletDir}/shepherd/safewalletlog.${logExt}`)) {
        fs.readFile(`${api.safewalletDir}/shepherd/safewalletlog.${logExt}`, 'utf8', (err, data) => {
          if (err) {
            const retObj = {
              msg: 'error',
              result: err,
            };

            res.end(JSON.stringify(retObj));
          } else {
            const retObj = {
              msg: 'success',
              result: data ? JSON.parse(data) : '',
            };

            res.end(JSON.stringify(retObj));
          }
        });
      } else {
        const retObj = {
          msg: 'error',
          result: `safewallet.${logExt} doesnt exist`,
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

  api.printDirs = () => {
    api.log(`safewallet dir: ${api.safewalletDir}`, 'env');
    api.log('--------------------------', 'env')
    api.log(`safecoin dir: ${api.safecoindBin}`, 'env');
    api.log(`safecoin bin: ${api.safecoinDir}`, 'env');
    api.writeLog(`safewallet dir: ${api.safewalletDir}`);
    api.writeLog(`safecoin dir: ${api.safecoindBin}`);
    api.writeLog(`safecoin bin: ${api.safecoinDir}`);
  }

  return api;
};