const mainWindow = window.require('electron').remote.getGlobal('app');
export const mainWindowNonCached = window.require('electron').remote.getCurrentWindow();

const { ipcRenderer } = window.require('electron');
export let staticVar;

ipcRenderer.on('staticVar', (event, arg) => {
  staticVar = arg;
});

if (!staticVar) { 
  ipcRenderer.send('staticVar');
}

export default mainWindow;