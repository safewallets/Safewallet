const disableCoins = require('./electrumServersConfig');
const _electrumServers = require('safewallet-wallet-lib/src/electrum-servers');

const _electrumServersExtend = {
  vpn: {
    txfee: 10000,
  },
  nrg: {
    txfee: 10000,
  },
  pot: {
    txfee: 10000,
  },
  wc: {
    txfee: 10000,
  },
  zen: {
    txfee: 10000,
  },
  iop: {
    txfee: 1000,
  },
  sys: {
    txfee: 10000,
  },
  bta: {
    txfee: 100000,
  },
  erc: {
    txfee: 100000,
  },
  lbc: {
    txfee: 1000,
  },
  bsd: {
    txfee: 100000,
  },
  efl: {
    txfee: 100000,
  },
  xwc: {
    txfee: 10000,
  },
  vivo: {
    txfee: 10000,
  },
  xvg: {
    txfee: 10000,
  },
  xvc: {
    txfee: 10000,
  },
  uno: {
    txfee: 10000,
  },
  rdd: {
    txfee: 10000,
  },
  pivx: {
    txfee: 10000,
  },
  omni: {
    txfee: 10000,
  },
  ok: {
    txfee: 10000,
  },
  neos: {
    txfee: 10000,
  },
  nav: {
    txfee: 10000,
  },
  mnx: {
    txfee: 10000,
  },
  nlg: {
    txfee: 1000000,
  },
  flash: {
    txfee: 100,
  },
  excl: {
    txfee: 10000,
  },
  dmd: {
    txfee: 10000,
  },
  crave: {
    txfee: 10000,
  },
  club: {
    txfee: 10000,
  },
  clam: {
    txfee: 10000,
  },
  bca: {
    txfee: 10000,
  },
  aur: {
    txfee: 100000,
  },
  acc: {
    txfee: 100000,
  },
  usc: {
    txfee: 10000,
  },
  toa: {
    txfee: 10000,
  },
  strat: {
    txfee: 10000,
  },
  smly: {
    txfee: 10000,
  },
  slr: {
    txfee: 10000,
  },
  rby: {
    txfee: 10000,
  },
  vox: {
    txfee: 500000,
  },
  put: {
    txfee: 10000,
  },
  posw: {
    txfee: 10000,
  },
  pink: {
    txfee: 10000,
  },
  psb: {
    txfee: 10000,
  },
  nsr: {
    txfee: 10000,
  },
  nvc: {
    txfee: 10000,
  },
  nyc: {
    txfee: 10000,
  },
  nro: {
    txfee: 10000,
  },
  lynx: {
    txfee: 10000,
  },
  linx: {
    txfee: 10000,
  },
  ldcn: {
    txfee: 10000,
  },
  kobo: {
    txfee: 10000,
  },
  ixc: {
    txfee: 100000,
  },
  insn: {
    txfee: 10000,
  },
  thc: {
    txfee: 10000,
  },
  hnc: {
    txfee: 10000,
  },
  grc: {
    txfee: 10000,
  },
  gcr: {
    txfee: 10000,
  },
  frst: {
    txfee: 10000,
  },
  erc: {
    txfee: 10000,
  },
  edrc: {
    txfee: 10000,
  },
  ecn: {
    txfee: 10000,
  },
  dgc: {
    txfee: 5000000,
  },
  defc: {
    txfee: 10000,
  },
  cmp: {
    txfee: 10000,
  },
  ccn: {
    txfee: 10000,
  },
  cdn: {
    txfee: 100000,
  },
  brit: {
    txfee: 10000,
  },
  bela: {
    txfee: 10000,
  },
  ac: {
    txfee: 10000,
  },
  usnbt: {
    txfee: 10000,
  },
  onx: {
    txfee: 10000,
  },
  zet: {
    txfee: 10000,
  },
  jbs: {
    txfee: 10000,
  },
  slm: {
    txfee: 10000,
  },
  ppc: {
    txfee: 10000,
  },
  mzc: {
    txfee: 10000,
  },
  sdc: {
    txfee: 10000,
  },
  // insight
  aby: {
    address: 'http://explorer.artbyte.me/api/',
    proto: 'insight',
    insightRawApi: false,
    txfee: 100000,
    serverList: 'none',
  },
  mac: { // cloudfare captcha :(
    address: 'https://explorer.machinecoin.org/api/',
    proto: 'insight',
    insightRawApi: false,
    txfee: 100000,
    serverList: 'none',
  },
  vot: {
    address: 'http://explorer.votecoin.site/insight-api-zcash/',
    proto: 'insight',
    insightRawApi: false,
    txfee: 10000,
    serverList: 'none',
  },
  bdl: {
    address: 'https://explorer.bitdeal.co.in/api/',
    proto: 'insight',
    insightRawApi: false,
    txfee: 10000,
    serverList: 'none',
  },
};

let electrumServers = Object.assign({}, _electrumServers, _electrumServersExtend);
let electrumServersFlag = Object.assign({}, _electrumServers, _electrumServersExtend);

for (let i = 0; i < disableCoins.length; i++) {
  if (electrumServers[disableCoins[i]]) {
    delete electrumServers[disableCoins[i]];
    delete electrumServersFlag[disableCoins[i]];
    // console.log(`disable spv coin ${disableCoins[i]}`);
  }
}

for (key in electrumServersFlag) {
  electrumServersFlag[key] = true;
}

module.exports = {
  electrumServers,
  electrumServersFlag,
};