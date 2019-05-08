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
                  onClick={ () => this.openExternalWindow('https://safecoin.org/community/') }>
                  <img
                    src="assets/images/cryptologo/supernet.png"
                    alt={ translate('SETTINGS.SUPPORT_TICKETS') } />
                  <div className="support-box-title">{ translate('SETTINGS.SUPPORT_TICKETS') }</div>
                  <div className="support-box-link">support.safewallets.com</div>
                </div>
              </div>
              <div className="support-box-wrapper">
                <div
                  className="support-box"
                  onClick={ () => this.openExternalWindow('https://discord.gg/vQgYGJz') }>
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
                  onClick={ () => this.openExternalWindow('https://discord.gg/vQgYGJz') }>
                  <img
                    src="assets/images/support/discord-invite-icon.png"
                    alt={ translate('SETTINGS.GET_DISCORD_INVITE') } />
                  <div className="support-box-title">{ translate('SETTINGS.GET_DISCORD_INVITE') }</div>
                  <div className="support-box-link">safewallets.com/discord</div>
                </div>
              </div>
              <div className="support-box-wrapper">
                <div
                  className="support-box"
                  onClick={ () => this.openExternalWindow('https://github.com/FairExchange/Safewallet') }>
                  <img
                    src="assets/images/support/github-icon.png"
                    alt="Github" />
                  <div className="support-box-title">Github</div>
                  <div className="support-box-link">github.com/FairExchange/Safewallet</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row margin-top-30">
            <div className="col-sm-12">
              <p>
                { translate('SUPPORT.FOR_GUIDES') } <a className="pointer" onClick={ () => this.openExternalWindow('https://safecoin.org') }>https://safecoin.org</a>
              </p>
              <p>
              { translate('SUPPORT.TO_SEND_FEEDBACK_P1') } <a className="pointer" onClick={ () => this.openExternalWindow('https://safecoin.org') }>https://safecoin.org</a> { translate('SUPPORT.TO_SEND_FEEDBACK_P2') }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Support;