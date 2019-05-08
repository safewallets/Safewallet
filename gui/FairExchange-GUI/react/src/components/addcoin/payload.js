// TODO: merge check functions
//			 move to nodejs
//			 cleanup
import { isSafecoinCoin } from 'safewallet-wallet-lib/src/coin-helpers';
import { staticVar } from '../../util/mainWindow';

export const checkAC = (coinVal) => {
	return isSafecoinCoin(coinVal, true);
}

export const startCurrencyAssetChain = (confpath, coin, mode) => {
	const assetChainPorts = staticVar.assetChainPorts;

	return assetChainPorts[coin];
}

export const startAssetChain = (confpath, coin, mode, getSuppyOnly) => {
	const assetChainPorts = staticVar.assetChainPorts;

	if (mode === '-1') {
		if (getSuppyOnly) {
			return staticVar.chainParams[coin].supply;
		} else {
			return assetChainPorts[coin];
		}
	}
}

export const startCrypto = (confpath, coin, mode) => {
	const assetChainPorts = staticVar.assetChainPorts;

	coin = coin === 'SAFE' ? 'safecoind' : coin;
	return assetChainPorts[coin];
}