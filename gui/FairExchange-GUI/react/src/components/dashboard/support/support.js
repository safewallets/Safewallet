import React from 'react';
import translate from '../../../translate/translate';

const { shell } = window.require('electron');

class Support extends React.Component {
  constructor() {
    super();
  }

  openExternalWindow(url) {
    return shell.openExternal(url);
  }

  render() {
    return (
      <div className="page margin-left-0">
        <div className="page-content">
          <h2>{ translate('SETTINGS.SUPPORT') }</h2>
          <div className="row">
            <div className="col-sm-12 no-padding-left">
              <div className="support-box-wrapper">
                <div
                  className="support-box"
                  onClick={ () => this.openExternalWindow('http://support.supernet.org') }>
                  <img
                    src="assets/images/cryptologo/supernet.png"
                    alt={ translate('SETTINGS.SUPPORT_TICKETS') } />
                  <div className="support-box-title">{ translate('SETTINGS.SUPPORT_TICKETS') }</div>
                  <div className="support-box-link">support.komodoplatform.com</div>
                </div>
              </div>
              <div className="support-box-wrapper">
                <div
                  className="support-box"
                  onClick={ () => this.openExternalWindow('https://discordapp.com/channels/412898016371015680/453204571393622027') }>
                  <img
                    src="assets/images/support/discord-icon.png"
                    alt="Discord" />
                  <div className="support-box-title">Discord</div>
                  <div className="support-box-link">discordapp.com</div>
                </div>
              </div>
              <div className="support-box-wrapper">
                <div
                  className="support-box"
                  onClick={ () => this.openExternalWindow('https://komodoplatform.com/discord') }>
                  <img
                    src="assets/images/support/discord-invite-icon.png"
                    alt={ translate('SETTINGS.GET_DISCORD_INVITE') } />
                  <div className="support-box-title">{ translate('SETTINGS.GET_DISCORD_INVITE') }</div>
                  <div className="support-box-link">komodoplatform.com/discord</div>
                </div>
              </div>
              <div className="support-box-wrapper">
                <div
                  className="support-box"
                  onClick={ () => this.openExternalWindow('https://github.com/KomodoPlatform/Agama') }>
                  <img
                    src="assets/images/support/github-icon.png"
                    alt="Github" />
                  <div className="support-box-title">Github</div>
                  <div className="support-box-link">github.com/KomodoPlatform/Agama</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row margin-top-30">
            <div className="col-sm-12">
              <p>
                { translate('SUPPORT.FOR_GUIDES') } <a className="pointer" onClick={ () => this.openExternalWindow('https://support.komodoplatform.com/support/home') }>https://support.komodoplatform.com/support/home</a>
              </p>
              <p>
              { translate('SUPPORT.TO_SEND_FEEDBACK_P1') } <a className="pointer" onClick={ () => this.openExternalWindow('https://support.komodoplatform.com/support/tickets/new') }>https://support.komodoplatform.com/support/tickets/new</a> { translate('SUPPORT.TO_SEND_FEEDBACK_P2') }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Support;