const ethers = require('ethers');
const request = require('request');
const erc20ContractId = require('safewallet-wallet-lib/src/eth-erc20-contract-id');
const decimals = require('safewallet-wallet-lib/src/eth-erc20-decimals');

module.exports = (api) => {  
  api.get('/eth/balance', (req, res, next) => {
    const address = req.query.address;
    const symbol = req.query.symbol;
    
    if (symbol) {
      if (symbol === 'all') {
        api.eth._balanceERC20All(address)
        .then((balance) => {
          const retObj = {
            msg: 'success',
            result: balance,
          };
      
          res.end(JSON.stringify(retObj));  
        });
      } else {
        api.eth._balanceERC20(address, symbol.toUpperCase())
        .then((balance) => {
          const retObj = {
            msg: 'success',
            result: balance,
          };
      
          res.end(JSON.stringify(retObj));  
        });
      }
    } else {
      if (address) {
        api.eth._balanceEtherscan(address, req.query.network)
        .then((balance) => {
          const retObj = {
            msg: 'success',
            result: balance,
          };
      
          res.end(JSON.stringify(retObj));  
        });
      } else {
        api.eth._balance()
        .then((balance) => {
          const retObj = {
            msg: 'success',
            result: balance,
          };
      
          res.end(JSON.stringify(retObj));  
        });
      }
    }
  });

  api.eth._balance = () => {
    let _balance = 0;
    let _txCount = 0;

    return new Promise((resolve, reject) => {
      api.eth.activeWallet.getBalance('pending')
      .then((balance) => {
        _balance = ethers.utils.formatEther(balance, { commify: true });

        resolve(_balance);
      }, (error) => {
        api.log('eth balance error', 'eth.balance');
        api.log(error, 'eth.balance');

        resolve(error);
      });
    });
  };

  api.eth._balanceEtherscan = (address, network = 'homestead') => {
    return new Promise((resolve, reject) => {
      const _url = [
        'module=account',
        'action=balance',
        `address=${address}`,
        'tag=latest',
        'apikey=YourApiKeyToken',
      ];
      const _etherscanEndPoint = network === 'homestead' ? 'https://api.etherscan.io/api?' : `https://api-${network}.etherscan.io/api?`;
      const options = {
        url: _etherscanEndPoint + _url.join('&'),
        method: 'GET',
      };

      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _json = JSON.parse(body);

            if (_json.message === 'OK' &&
                _json.result) {
              resolve({
                balance: ethers.utils.formatEther(_json.result),                
                balanceWei: _json.result,                
              });
            } else {
              resolve(_json);
            }
          } catch (e) {
            api.log('eth balance parse error', 'eth.balance');
            api.log(e, 'eth.balance');
          }
        } else {
          api.log(`eth balance error: unable to request ${network}`, 'eth.balance');
        }
      });
    });
  };

  api.eth._balanceERC20 = (address, symbol) => {
    const _url = [
      'module=account',
      'action=tokenbalance',
      `address=${address}`,
      `contractaddress=${erc20ContractId[symbol]}`,
      'tag=latest',
      'apikey=YourApiKeyToken',
    ];
    let _balance = {};

    return new Promise((resolve, reject) => {
      const options = {
        url: 'https://api.etherscan.io/api?' + _url.join('&'),
        method: 'GET',
      };

      api.log(`_balanceERC20 url ${options.url}`);
      
      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _json = JSON.parse(body);

            if (_json.message === 'OK' &&
                _json.result) {
              const _decimals = decimals[symbol.toUpperCase()];
              resolve({
                balance: ethers.utils.formatEther(ethers.utils.parseUnits(_json.result, _decimals < 18 && _decimals >= 0 ? 18 - _decimals : 0).toString()),
                balanceWei: _json.result,
              });
            } else {
              resolve(_json);
            }
          } catch (e) {
            api.log('etherscan erc20 balance parse error', 'eth.erc20-balance');
            api.log(e, 'eth.erc20-balance');
          }
        } else {
          api.log(`etherscan erc20 balance error: unable to request ${_url}`, 'eth.erc20-balance');
        }
      });
    });
  };
  
  api.eth._balanceERC20All = (address) => {
    const _url = `http://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`;
    let _balance = {};

    return new Promise((resolve, reject) => {
      const options = {
        url: _url,
        method: 'GET',
      };

      api.log(`_balanceERC20All url ${_url}`);

      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _json = JSON.parse(body);

            if (_json &&
                _json.address) {
              if (_json.tokens) {
                for (let i = 0; i < _json.tokens.length; i++) {
                  _balance[_json.tokens[i].tokenInfo.symbol] = {
                    balance: ethers.utils.formatEther(_json.tokens[i].balance.toString()),                    
                    balanceWei: _json.tokens[i].balance,
                  };
                }
                resolve(_balance);
              }
            } else {
              // TODO: loop active erc20 tokens and return 0 balance
              resolve(_json);
            }
          } catch (e) {
            api.log('ethplorer balance parse error', 'eth.erc20-balance');
            api.log(e, 'eth.erc20-balance');
          }
        } else {
          api.log(`ethplorer balance error: unable to request http://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`, 'eth.erc20-balance');
        }
      });
    });
  };

  api.eth._txcount = () => {
    let _txCount = 0;
    
    api.eth.activeWallet.getTransactionCount('pending')
    .then((transactionCount) => {
      _txCount = transactionCount;
      api.log('eth tx count', transactionCount);

      return transactionCount;
    }, (error) => {
      api.log('eth tx count error', 'eth.txcount');
      api.log(error, 'eth.txcount');
    });
  };

  return api;
};