const path = require('path');
const _fs = require('graceful-fs');
const os = require('os');
const fs = require('fs');

module.exports = (api) => {
  /*
   *  type: POST
   *  params: herd, lastLines
   */
  api.post('/debuglog', (req, res) => {
    if (api.checkToken(req.body.token)) {
      const _platform = os.platform();
      let _herd = req.body.herdname;
      let _ac = req.body.ac;
      let _lastNLines = req.body.lastLines;
      let _location;

      switch (_platform) {
        case 'darwin':
          api.safecoinDir = api.appConfig.native.dataDir.length ? api.appConfig.native.dataDir : `${process.env.HOME}/Library/Application Support/Safecoin`;
          break;
        case 'linux':
          api.safecoinDir = api.appConfig.native.dataDir.length ? api.appConfig.native.dataDir : `${process.env.HOME}/.safecoin`;
          break;
        case 'win32':
          api.safecoinDir = api.appConfig.native.dataDir.length ? api.appConfig.native.dataDir : `${process.env.APPDATA}/Safecoin`;
          api.safecoinDir = path.normalize(api.safecoinDir);
          break;
      }

      if (_herd === 'safecoin') {
        _location = api.safecoinDir;
      }

      if (_ac) {
        _location = `${api.safecoinDir}/${_ac}${api.native.startParams && api.native.startParams[_ac] && api.native.startParams[_ac].indexOf('-regtest') > 0 ? '/regtest' : ''}`;

        if (_ac === 'CHIPS') {
          _location = api.chipsDir;
        }
      } else {
        _location = `${api.safecoinDir}${api.native.startParams && api.native.startParams.SAFE && api.native.startParams.SAFE.indexOf('-regtest') > 0 ? '/regtest' : ''}`;
      }

      api.readDebugLog(`${_location}/debug.log`, _lastNLines)
      .then((result) => {
        const retObj = {
          msg: 'success',
          result: result,
        };

        res.end(JSON.stringify(retObj));
      }, (result) => {
        const retObj = {
          msg: 'error',
          result: result,
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

  api.get('/coind/stdout', (req, res) => {
    if (api.checkToken(req.query.token)) {
      const _daemonName = req.query.chain !== 'safecoind' && req.query.chain.toLowerCase() !== 'safe' ? req.query.chain : 'safecoind';
      const _daemonLogName = `${api.safewalletDir}/${_daemonName}.log`;

      api.readDebugLog(_daemonLogName, 'all')
      .then((result) => {
        const retObj = {
          msg: 'success',
          result: result,
        };

        res.end(JSON.stringify(retObj));
      }, (result) => {
        const retObj = {
          msg: 'error',
          result: result,
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

  api.readDebugLog = (fileLocation, lastNLines) => {
    return new Promise((resolve, reject) => {
      if (lastNLines) {
        try {
          _fs.access(fileLocation, fs.constants.R_OK, (err) => {
            if (err) {
              api.log(`error reading ${fileLocation}`, 'native.debug');
              api.writeLog(`error reading ${fileLocation}`);
              reject(`readDebugLog error: ${err}`);
            } else {
              api.log(`reading ${fileLocation}`, 'native.debug');
              _fs.readFile(fileLocation, 'utf-8', (err, data) => {
                if (err) {
                  api.writeLog(`readDebugLog err: ${err}`, 'native.debug');
                  api.log(`readDebugLog err: ${err}`);
                }

                const lines = data.trim().split('\n');
                let lastLine;

                if (lastNLines === 'all') {
                  lastLine = data.trim();
                } else {
                  lastLine = lines.slice(lines.length - lastNLines, lines.length).join('\n');
                }

                resolve(lastLine);
              });
            }
          });
        } catch (e) {
          reject(`readDebugLog error: ${e}`);
        }
      } else {
        reject('readDebugLog error: lastNLines param is not provided!');
      }
    });
  };

  return api;
};