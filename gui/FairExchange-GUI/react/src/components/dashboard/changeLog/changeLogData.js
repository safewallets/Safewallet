const changeLogData = [{
  version: '0.3.5',
  changes: [
    'Removed MNZ asset chain',
    'Added KSB, OUR, ILN, RICK, MORTY, ZEX, VOTE2019, MTST3 asset chains',
    'Removed ERC20 tokens: AION, BTM, CMT, EOS, ICX, NAS, NET, NULS, TUSD, VEN',
    'Added ERC20 tokens: JST, DEC8, TRET, TILE, OVAL, KEA, CLF',
    'ERC20 contract ID changed: SUB, QBUIT, MLN',
    'Native notifications settings option (thanks to sawlysawly)',
    'Jumbler section removed (deprecated)',
  ],
}, {
  version: '0.3.4',
  changes: [
    'Source code optimization',
    'Minor improvements and fixes',
  ],
}, {
  version: '0.3.3',
  changes: [
    'Latest Komodo binary 0.3.3b from beta branch',
    'Display dPoW Confirmations in Lite Mode',
    'Display rawconfirmations when hovering on confirmations numbers for Native and Lite mode',
    'Display dPoW Confirmation badge for Native and Lite mode',
    'Lite mode tx confirmation display now faster than earlier version',
    'Import Sapling privkey fix using Import Key button, earlier version had error while importing sapling key',
    'Shortcut start button fix for Pirate (ARRR)',
    'PGT icon, badge color fix',
    'Fix for tx history post lock/logout bug',
    'Minor improvements in tools offline tx sign',
    'Tools multisig address generation, tx create/co-sign',
    'Added new coin LUMBER',
  ],
}, {
  version: '0.3.2',
  changes: [
    'Latest Komodo binary with z_mergetoaddress fix',
    'Other minor Agama improvements',
  ],
}, {
  version: '0.3.1',
  changes: [
    'Latest Komodo binary 0.3.1',
    'Offline Signing improvements',
    'Various bug fixes and imporovements',
    'ZILLA parameters updated to not to activate Sapling',
  ],
}, {
  version: '0.3.0',
  changes: [
    'Latest Komodo binary',
    'Sapling ready',
    'Offline Signing',
    'CLI display bug fixed',
    'Coin pricing update',
    'ETH & ERC20 token support',
    'Added SUQA, Bitzec',
    'Removed BCBC and ARG',
  ],
}, {
  version: '0.2.43',
  changes: [
    'Updated komodo binary',
    'Various fixes (SPV mode, KMD rewards)',
    'Added KMDice asset chain',
    'Added Dionpay asset chain',
  ],
}, {
  version: '0.2.42',
  changes: [
    'Updated komodo binary',
    'Various fixes',
    'Added PIRATE asset chain',
  ],
}, {
  version: '0.2.41d',
  changes: [
    'Updated komodo binary',
    'Updated Electron version',
    'Security related updates',
  ],
}, {
  version: '0.2.41',
  changes: [
    'Updated electrum servers list',
    'New asset chain ZILLA',
    'Save settings fix',
    'SPV remove coin fix',
  ],
}, {
  version: '0.2.40',
  changes: [
    'Custom Electrum servers config option',
    'Extended dev mode argv',
    'Load coins list from file on app init',
    'Native send result table css overflow fix',
    'Send native max balance shortcut, per address basis',
    'KV Electrum servers list',
    'KV empty history display fix',
    'KV history refresh fix',
    'SPV watchonly hide KMD claim button',
    'Updated support page',
    'SPV balance subtract unconfirmed balance, display info icon',
    'Transaction history CSV export',
    'SPV send no valid UTXO message handling',
    'SPV send confirm with PIN',
  ],
}, {
  version: '0.2.39',
  changes: [
    'New SPV coins GAME and Fujicoin (fjc)',
    'New asset chain PRLPAY',
    'SPV socket timeout settings option',
    'Sensitive data blur toggle',
    'Tools split/merge UTXO WIF support',
    'KV lite implementation',
  ],
}, {
  version: '0.2.38',
  changes: [
    'SPV maximum inputs per transaction parse count settings option',
    'Login quick menu click outside fix, remove SPV coins option',
    'Update GLXT seed node IP',
    'Partial responsive layout support',
    'Added KV explorer link',
    'Rename all placeholders interest to rewards, new interest rules past height > 1 million',
    'SPV clock out of sync detection',
    'SPV local cache',
    'SPV proxy',
    'AGT-186, Tools multi balance proper fallback/error handling',
  ],
}, {
  version: '0.2.37',
  changes: [
    'Electrum port argument fix',
    'Custom asset chains genproclimit parameter dropdown',
  ],
}, {
  version: '0.2.36',
  changes: [
    'SPV KV asset chain',
    'Native mode -gen parameter support',
    'SPV watchonly address mode UI flag',
    'Interest calc edge case fix',
    'Improved seed encrypt, thanks to luke',
    'Tools get multiple kmd balances option',
    'experimental support for custom asset chains, staking and mining',
  ],
}, {
  version: '0.2.35',
  changes: [
    'Updated Electrum servers',
    'SPV zero conf timestamp fix',
    'New SPV coin BCBC',
    'New asset chain GLXT',
    'SPV shielded transactions decoding fix',
    'Seed storage PIN rename/delete',
    'Disable Notary Node voting UI',
  ],
}, {
  version: '0.2.34',
  changes: [
    'Load UI content from file instead of a remote url',
    'More secure seed generation (bip39)',
    'Updated BTC, DGB, ZEC Electrum servers',
  ],
}, {
  version: '0.2.33',
  changes: [
    'Seed storage related bug fixes',
    'Komodod update',
  ],
}, {
  version: '0.2.32',
  changes: [
    'Add BNTN, EQL asset chains',
    'Custom seed entropy check',
    'Send form multisig address validation bug fix',
    'Encrypted seed storage',
  ],
}, {
  version: '0.2.31',
  changes: [
    'Enabled MESH asset chain back',
    'Login form native shortcut 32 bit check',
    'Z-key import fix',
    'Multi WIF import',
    'Send form multisig address validation fix',
    'SPV listtransactions bug fix causing app to freeze',
    'SPV updated SNG electrum servers',
    'OOT asset chain native fix',
  ],
}, {
  version: '0.2.30c',
  changes: [
    'SPV add SNG coin',
    'SPV BTC fees local fallback, atomicexplorer.com url fixes',
    'Security fixes: RCE, session token fixes',
    'Added OOT asset chain',
  ],
}, {
  version: '0.2.30b',
  changes: [
    'Elections SPV sendmany fix',
  ],
}, {
  version: '0.2.30a',
  changes: [
    'Minor elections modal fixes',
    'Fixed VOTE2018 and NINJA asset chain',
    'New SPV coin DNR',
    'A few minor bug fixes related to login and SPV connections',
  ],
}, {
  version: '0.2.29c',
  changes: [
    'Removed fiat asset chains',
    'Interest claim modal KMD fee info',
    'SPV empty login fix',
  ],
}, {
  version: '0.2.29b',
  changes: [
    'Seed trim login fix',
    'SPV send form will feature fees/totals for all coins and KMD interest to be claimed if applicable',
  ],
}, {
  version: '0.2.29a',
  changes: [
    'SPV caching',
    'LTC transaction fee bump to 0.001 (100000 sats)',
  ],
}, {
  version: '0.2.28c',
  changes: [
    'Better SPV transaction history categorization',
    'Terminate rogue electrum connections',
  ],
}, {
  version: '0.2.28b',
  changes: [
    'Add BTC in SPV mode',
    'Extended explorers list',
  ],
}, {
  version: '0.2.28a',
  changes: [
    'App menu Debug reset settings item',
    'WIF 2 WIF fix',
    'Pub address validation',
    'SPV BEER, PIZZA, VOTE, QTUM, BTX, BTCZ, HODLC',
  ],
}, {
  version: '0.2.27d',
  changes: [
    'Notary voting',
    'Better decode error wording',
    'Watchonly SPV',
  ],
}, {
  version: '0.2.27c',
  changes: [
    'Tools merge/split UTXO',
    'Audo\'s create seed verification method',
    'Fiat balance',
  ],
}, {
  version: '0.2.27b',
  changes: [
    'BTCH icon change',
    'PIZZA, BEER test coins',
  ],
}, {
  version: '0.2.27a',
  changes: [
    'Login/create seed QR code scan/gen',
    'Native send subtract fee fix',
    'SPV send \"all balance\", \"send to self\" shortcut buttons',
    'New section \"tools\", a bunch of handy functions to do WIF to WIF / seed to WIF conversion, get UTXO list etc',
  ],
}, {
  version: '0.2.26c-d',
  changes: [
    'New SPV KMD assets BTCH, MGW',
    'Better tooltips',
    'SPV broadcast error info',
    'Send value fix',
    'Coin tile SPV update fix',
    'Util explorer link fix',
    'SuperNET related coins switch SPV fees to static',
    'SPV export keys eror fix',
    'Start screen changed',
  ],
}, {
  version: '0.2.26b',
  changes: [
    'KMD logo update',
    'Coin tile badge pos change',
    'Coin tile stop action render fix',
    'Zcash parameters download modal broken styling fix',
    'All references to BarterDEX are removed from about section',
    'Online/offline detection',
    '3 new asset chains AXO, BTCH, ETOMIC, native only',
    '2 more SPV coins XMY and ZCL',
    'SPV send now should include the exact error message if \"unable to broadcast\"',
  ],
}, {
  version: '0.2.26a',
  changes: [
    'Coin tile actions refactored as a dropdown menu',
    'Receive coin validate address option in address menu',
    'RPC to CLI passphru',
  ],
}, {
  version: '0.2.25f-j',
  changes: [
    '17 new SPV coins experimental',
    'SPV export keys fix',
    'Language selector experimental',
    'WIF login update',
    'Send form false positive validation error fix',
    'Top right menu icon style change',
    'Settings support tab moved to a separate section',
  ],
}, {
  version: '0.2.25d-e',
  changes: [
    'Settings app info daemon ports list',
    'Native wallet info network data',
    'Add coin modal SPV mode desciption',
    'Add coin modal new coins dropdown',
    'Close modals on esc or overlay click',
    'SPV uncompressed WIF key support',
  ],
}, {
  version: '0.2.25a-c',
  changes: [
    'Settings bip39 key search, target audience ledger wallet users',
    '32 bit os detect, fallback to SPV mode only',
    'SPV is enabled by default',
    'KMD passive is hidden under experimental option',
    'Connection error icon is suppressed during wallet rescan',
    'Native subtract fee error toaster fix',
    'Enable SUPERENT, DEX, BOTS, CRYPTO, HODL, PANGEA, BET, MSHARK are unlocked',
    'Iguana core menu fixes, renamed lock/logout to soft logout/complete logout',
    'SPV auto reconnect if server is unreachable, sockets connect timeout is set to 10s',
    'Claim interest spinner',
    'Windows sync workaround threshold is changed from 0-80% range to 0-30% range',
    'Settings debug.log reader asset chain support',
    'Send native hide ismine:false addresses',
    'Claim interest added native change description',
    'KMD asset SHARK to MSHARK change',
    'Dump z address key fix',
    'Hide address export in SPV',
  ],
}, {
  version: '0.2.24g',
  changes: [
    'Claim interest button address check',
  ],
}, {
  version: '0.2.24f',
  changes: [
    'Native claim interest success toaster address fix',
    'SPV claim interest auto close on success',
    'SPV claim interest fee subtract fix',
    'Native import key modal WIF visibility toggle',
    'SPV logout / remove coin cache cleanup fix',
  ],
}, {
  version: '0.2.24e',
  changes: [
    'Jumblr pause/resume',
    'Send form TXID copy btn, link to explorer',
    'Claim interest modal native/SPV address dropdown',
    'Transactions history / balance refresh spinner',
    'Claim interest not fully synced native coin warning sign',
  ],
}, {
  version: '0.2.24d',
  changes: [
    'Agama modes explained on startup window',
    'Receive ismine:false toggle',
    'Send / claim interest balance calc fix, discard any ismine:false utxo',
    'Display max available balance on send validation err',
    'Clean gen* files',
    'Settings clear komodo/chain data folder',
    'Catch komodod exit/crash',
  ],
}, {
  version: '0.2.24c',
  changes: [
    'SPV random server select on add coin',
    'SPV listtransactions zero conf timestamp fix',
    'Improved komodod down modal, less intrusive',
    'Komodod prints piped out into log files',
    'Settings native wallet.dat fetch keys',
    'Receive coin WIF key copy button',
    'Disable missing Zcash parameters check for SPV coins',
  ],
}, {
  version: '0.2.24a/b',
  changes: [
    'MNZ, KMD SPV mode related fixes',
    'SPV WIF login fix',
    'SPV seed login fix, affected seeds containing non-latin chars',
    'SPV lock',
    'SPV logout',
    'Remove coin',
    'Komodod detached mode',
    'Komodod down modal configurable threshold, workaround for false positives',
  ],
}, {
  version: '0.2.0.22-23a',
  changes: [
    'Fixed activating best chain progress update',
    'Prevent running several Agama instances',
    'CLI passphru fix',
    'Fixed logout bug',
    'Minor placeholders fixes',
    'Hide address dropdown if wallet has only one address',
    'Komodod crash report modal',
    'Values clipping',
    'Add coin multi UI reflow fix',
    'Reset app setting to default',
    'Manual balance / transactions list refresh',
    'Quick access dropdown on login to open settings / about / sync only modals',
    'QR code generator / scan',
    'Invoice generator',
    'Basilisk send form reset fix',
    'Added native wallet info button',
    'Added coqui assetchain',
    'Jumblr',
    'Zcash parameters folder check',
    'Claim interest modal',
    'Claim interest button on dashboard',
    'Renewed transactions history look',
    'Prevent app from closing while komodod is still loading/processing data',
    'Send form validation',
    'Coin daemon port check on add coin',
    'Updated application settings',
    'Komodo datadir',
    'Windows bins path fix',
    'Slow windows sync workaround',
    'Transactions details sorting fix',
    'Configurable komodod graceful quit timeout parameter',
    'Zcash parameters fetch modal',
    'MNZ asset chain',
    'Deprecated full and basilisk modes',
    'Updated transaction details modal',
    'New SPV mode',
    'Mainstream add coin shortcuts dropdown',
    'Import seed / WIF key modal',
    'Reduced resourse usage',
  ],
}, {
  version: '0.2.0.21a-beta',
  changes: [
    'Fixed transaction info modal bug',
    'Full mode is disabled on windows',
    'Fixed BTC add coin bug',
    'Updated login form',
  ],
}, {
  version: '0.2.0.2a',
  changes: [
    'Fixed native T to T bug that led to interest loss',
    'Added pending request(s) spinner',
    'Added missing native z_balance API call for Z-addresses',
    'Aixed native t to z address send bug',
    'Added cli settings section',
    'Disabled initial basilisk connection process',
    'Minor UI reorder change',
    'Limit http stack history to 150 calls of each type',
    'Sort http stack history desc',
    'Swapped gettotalbalance interest with getinfo interest',
    'Extended settings / export keys UI',
    'Added error message if coin is already running in another mode',
    'Added explicit \"new address generated\" message',
    'Added CLI / RPC passphru',
    'Seed type check',
    'Seed extra space(s) check',
    'Custom seed option',
    'Copy seed button',
    'Native only mode',
    'App update',
    'Added CLI route',
    'RPC passphru',
  ],
}];

export default changeLogData;