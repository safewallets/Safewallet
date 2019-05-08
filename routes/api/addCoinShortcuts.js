const electrumServers = require('../electrumjs/electrumServers');
const request = require('request');
const chainParams = require('../chainParams');

module.exports = (api) => {
  api.startSPV = (coin) => {
    if (coin === 'SAFE+REVS+JUMBLR') {
      api.addElectrumCoin('SAFE');
      api.addElectrumCoin('REVS');
      api.addElectrumCoin('JUMBLR');
    } else {
      if (process.argv.indexOf('spvcoins=all/add-all') > -1) {
        for (let key in electrumServers) {
          api.addElectrumCoin(key.toUpperCase());
        }
      } else {
        api.addElectrumCoin(coin);
      }
    }
  }

  api.startSAFENative = (selection, isManual) => {
    let herdData;

    const prepAcOptions = (srcObj, acName) => {
      for (let key in chainParams[acName]) {
        if (key === 'addnode' &&
            typeof chainParams[acName][key] === 'object') {
          for (let i = 0; i < chainParams[acName][key].length; i++) {
            herdData.ac_options.push(`-addnode=${chainParams[acName][key][i]}`);
          }
        } else {
          herdData.ac_options.push(`-${key}=${chainParams[acName][key]}`);
        }
      }
    
      if (!chainParams[acName].addnode) {
        srcObj.ac_options.push('-addnode=78.47.196.146');
      }

      return srcObj;
    };

    const httpRequest = () => {
      const options = {
        url: `http://127.0.0.1:${api.appConfig.safewalletPort}/api/herd`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          herd: 'safecoind',
          options: herdData,
          token: api.appSessionHash,
        }),
      };

      request(options, (error, response, body) => {
        // resolve(body);
      });
    };

    if (isManual) {
      api.safeMainPassiveMode = true;
    }

    if (selection === 'SAFE') {
      herdData = {
        ac_name: 'safecoind',
        ac_options: [
          '-daemon=0',
          '-addnode=78.47.196.146',
        ],
      };

      httpRequest();
    } else if (
      selection !== 'SAFE' &&
      chainParams[selection]
    ) {
      herdData = {
        ac_name: selection,
        ac_options: [
          '-daemon=0',
          '-server',
        ],
      };
      herdData = prepAcOptions(herdData, selection);

      httpRequest();
    } else {
      const herdData = [{
        ac_name: 'safecoind',
        ac_options: [
          '-daemon=0',
          '-addnode=78.47.196.146',
        ],
      }, {
        ac_name: 'REVS',
        ac_options: [
          '-daemon=0',
          '-server',
        ],
      }, {
        ac_name: 'JUMBLR',
        ac_options: [
          '-daemon=0',
          '-server',
        ],
      }];

      herdData[1] = prepAcOptions(herdData[1], 'REVS');
      herdData[2] = prepAcOptions(herdData[1], 'JUMBLR');
      
      for (let i = 0; i < herdData.length; i++) {
        setTimeout(() => {
          const options = {
            url: `http://127.0.0.1:${api.appConfig.safewalletPort}/api/herd`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              herd: 'safecoind',
              options: herdData[i],
              token: api.appSessionHash,
            }),
          };

          request(options, (error, response, body) => {
            // resolve(body);
          });
        }, 100);
      }
    }
  };

  return api;
};