// TODO: merge check functions
//			 move to nodejs
//			 cleanup
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import { staticVar } from '../../util/mainWindow';

export const checkAC = (coinVal) => {
	return isKomodoCoin(coinVal, true);
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

	coin = coin === 'KMD' ? 'komodod' : coin;
	return assetChainPorts[coin];
}