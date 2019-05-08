const devlog = (msg, data) => {
  const mainWindow = window.require('electron').remote.getGlobal('app');

  if (mainWindow.appConfig.dev ||
      mainWindow.argv.indexOf('devmode') > -1) {
    if (data) {
      console.warn(msg, data);
    } else {
      console.warn(msg);
    }
  }
}

export default devlog;