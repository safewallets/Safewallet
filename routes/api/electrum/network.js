const { isSafecoinCoin } = require('safewallet-wallet-lib/src/coin-helpers');
const _txDecoder = require('safewallet-wallet-lib/src/transaction-decoder');
const semverCmp = require('semver-compare');
const electrumMinVersionProtocolV1_4 = '1.9.0';

module.exports = (api) => {
  api.isZcash = (network) => {
    if (isSafecoinCoin(network)) {
      network = 'safe';
    }

    if (api.electrumJSNetworks[network.toLowerCase()] &&
        api.electrumJSNetworks[network.toLowerCase()].isZcash) {
      return true;
    }
  };

  api.isPos = (network) => {
    if (api.electrumJSNetworks[network.toLowerCase()] &&
        api.electrumJSNetworks[network.toLowerCase()].isPoS) {
      return true;
    }
  };

  api.electrumJSTxDecoder = (rawtx, networkName, network, insight) => {
    try { 
      return _txDecoder(rawtx, network);
    } catch (e) {};
  };

  api.getNetworkData = (network) => {
    if (api.electrumJSNetworks[network.toLowerCase()]) {
      return api.electrumJSNetworks[network.toLowerCase()];
    }
  
    let coin = api.findNetworkObj(network) || api.findNetworkObj(network.toUpperCase()) || api.findNetworkObj(network.toLowerCase());
    const coinUC = coin ? coin.toUpperCase() : null;

    if (!coin &&
        !coinUC) {
      coin = network.toUpperCase();
    }

    if (isSafecoinCoin(coin) ||
        isSafecoinCoin(coinUC)) {
      return api.electrumJSNetworks.safe;
    } else {
      return api.electrumJSNetworks[network];
    }
  }

  api.findNetworkObj = (coin) => {
    for (let key in api.electrumServers) {
      if (key.toLowerCase() === coin.toLowerCase()) {
        return key;
      }
    }
  }

  api.get('/electrum/servers', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      if (req.query.abbr) { // (?) change
        let _electrumServers = {};

        for (let key in api.electrumServers) {
          _electrumServers[key] = api.electrumServers[key];
        }

        const retObj = {
          msg: 'success',
          result: {
            servers: _electrumServers,
          },
        };

        res.end(JSON.stringify(retObj));
      } else {
        const retObj = {
          msg: 'success',
          result: {
            servers: api.electrumServers,
          },
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

  api.get('/electrum/coins/server/set', (req, res, next) => {
    const _coin = req.query.coin.toLowerCase();

    if (api.checkToken(req.query.token)) {
      api.electrumCoins[_coin].server = {
        ip: req.query.address,
        port: req.query.port,
        proto: req.query.proto,
      };

      for (let key in api.electrumServers) {
        if (key === _coin) {
          api.electrumServers[key].address = req.query.address;
          api.electrumServers[key].port = req.query.port;
          api.electrumServers[key].proto = req.query.proto;
          break;
        }
      }

      // api.log(JSON.stringify(api.electrumCoins[req.query.coin], null, '\t'), true);

      const retObj = {
        msg: 'success',
        result: true,
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

  api.getServerVersion = (port, ip, proto) => {
    const ecl = new api.electrumJSCore(
      port,
      ip,
      proto,
      api.appConfig.spv.socketTimeout
    );

    return new Promise((resolve, reject) => {
      if (api.electrumServersV1_4.hasOwnProperty(`${ip}:${port}:${proto}`)) {
        api.log(`getServerVersion cached ${`${ip}:${port}:${proto}`} isProtocolV1.4: ${api.electrumServersV1_4[`${ip}:${port}:${proto}`]}`, 'electrum.version.check');
        resolve(api.electrumServersV1_4[`${ip}:${port}:${proto}`]);
      } else {
        ecl.connect();
        ecl.serverVersion('', '1.0')
        .then((serverData) => {
          let serverVersion = 0;

          ecl.close();
          api.log('getServerVersion non-cached', 'electrum.version.check');

          if (serverData &&
              typeof serverData === 'string' &&
              serverData.indexOf('ElectrumX') > -1) {
            serverVersion = serverData.split('ElectrumX')[1].trim();
          } else if (
            serverData &&
            typeof serverData === 'object' &&
            serverData[0] &&
            serverData[0].indexOf('ElectrumX') > -1
          ) {
            serverVersion = serverData[0].split('ElectrumX')[1].trim();
          }
          
          if (serverVersion) {
            api.log(`${serverVersion} vs ${electrumMinVersionProtocolV1_4} ${(semverCmp(serverVersion, electrumMinVersionProtocolV1_4) >=0 ? '1.4' : '< 1.4')}`, 'electrum.version.check');
            
            if (semverCmp(serverVersion, electrumMinVersionProtocolV1_4) >= 0) {
              api.electrumServersV1_4[`${ip}:${port}:${proto}`] = true;
            } else {
              api.electrumServersV1_4[`${ip}:${port}:${proto}`] = false;
            }
          }

          api.log(`getServerVersion cached ${`${ip}:${port}:${proto}`} isProtocolV1.4: ${api.electrumServersV1_4[`${ip}:${port}:${proto}`]}`, 'electrum.version.check');
          resolve(api.electrumServersV1_4[`${ip}:${port}:${proto}`]);
        });
      }
    });
  };

  api.get('/electrum/servers/test', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      api.getServerVersion(
        req.query.port,
        req.query.ip,
        req.query.proto,
      );

      (async function () {
        const ecl = await api.ecl(null, {
          port: req.query.port,
          ip: req.query.address,
          proto: req.query.proto,
        });

        ecl.connect();
        ecl.serverVersion('', '1.0')
        .then((serverData) => {
          ecl.close();
          api.log('serverData', 'spv.server.test');
          api.log(serverData, 'spv.server.test');

          if ((serverData &&
              typeof serverData === 'string' &&
              serverData.indexOf('Electrum') > -1) ||
              (serverData && JSON.stringify(serverData).indexOf('unsupported protocol version: 1.0'))) {
            const retObj = {
              msg: 'success',
              result: true,
            };

            res.end(JSON.stringify(retObj));
          } else if (
            serverData &&
            typeof serverData === 'object'
          ) {
            for (let i = 0; i < serverData.length; i++) {
              if (serverData[i].indexOf('Electrum') > -1) {
                const retObj = {
                  msg: 'success',
                  result: true,
                };

                res.end(JSON.stringify(retObj));

                break;
                return true;
              }
            }

            const retObj = {
              msg: 'error',
              result: false,
            };

            res.end(JSON.stringify(retObj));
          } else {
            const retObj = {
              msg: 'error',
              result: false,
            };

            res.end(JSON.stringify(retObj));
          }
        });
      })();
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  // remote api switch wrapper
  api.ecl = async function(network, customElectrum) {
    if (!network) {
      const IsElectrumProtocolV1_4 = await api.getServerVersion(
        customElectrum.port,
        customElectrum.ip,
        customElectrum.proto
      );
      let _ecl = new api.electrumJSCore(
        customElectrum.port,
        customElectrum.ip,
        customElectrum.proto,
        api.appConfig.spv.socketTimeout
      );
      if (IsElectrumProtocolV1_4) _ecl.setProtocolVersion('1.4');
      return _ecl;
    } else {
      let _currentElectrumServer;
      network = network.toLowerCase();

      if (api.electrumCoins[network]) {
        _currentElectrumServer = api.electrumCoins[network];
      } else {
        const _server = api.electrumServers[network].serverList[0].split(':');
        _currentElectrumServer = {
          ip: _server[0],
          port: _server[1],
          proto: _server[2],
        };
      }

      if (api.electrumServers[network].proto === 'insight') {
        return api.insightJSCore(api.electrumServers[network]);
      } else {
        if (api.appConfig.spv.proxy) {
          // TODO: protocol version check
          return api.proxy(network, customElectrum);
        } else {
          const electrum = customElectrum ? {
            port: customElectrum.port,
            ip: customElectrum.ip,
            proto: customElectrum.proto,
          } : {
            port: api.electrumCoins[network] && api.electrumCoins[network].server.port || _currentElectrumServer.port,
            ip: api.electrumCoins[network] && api.electrumCoins[network].server.ip || _currentElectrumServer.ip,
            proto: api.electrumCoins[network] && api.electrumCoins[network].server.proto || _currentElectrumServer.proto,
          };

          const IsElectrumProtocolV1_4 = await api.getServerVersion(
            electrum.port,
            electrum.ip,
            electrum.proto
          );
          let _ecl = new api.electrumJSCore(
            electrum.port,
            electrum.ip,
            electrum.proto,
            api.appConfig.spv.socketTimeout
          );
          if (IsElectrumProtocolV1_4) _ecl.setProtocolVersion('1.4');
          return _ecl;
        }
      }
    }
  }

  return api;
};