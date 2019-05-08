const mainWindow = window.require('electron').remote.getGlobal('app');
let Config = mainWindow.appConfig;
Config.token = mainWindow.appSessionHash;

export const agamaPort = Config.agamaPort;
export const token = Config.token;
export const rpc2cli = Config.native.rpc2cli;

export default Config;