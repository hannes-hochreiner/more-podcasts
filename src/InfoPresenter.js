export default class InfoPresenter {
  constructor(view) {
    this._view = view;
    this._connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    this._connection.onchange = this._handleChange.bind(this);
    this._view.info = this._printStatus(this._connection);
  }

  _printStatus(conn) {
    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionTypeCheckFailed = typeof connection.type !== 'undefined' && !(connection.type === 'ethernet' || connection.type === 'wifi');
    let connectionSaveDataCheckFailed = typeof connection.saveData !== 'undefined' && connection.saveData;
    let connTest = connection && (connectionTypeCheckFailed || connectionSaveDataCheckFailed);

    return `type: ${conn.type}; effType: ${conn.effectiveType}; downlinkMax: ${conn.downlinkMax}; downlink: ${conn.downlink}; rtt: ${conn.rtt}; saveData: ${conn.saveData}; test: ${connTest}`;
  }

  _handleChange() {
    this._view.info = this._printStatus(this._connection);
  }

  logout() {
    InfoPresenter.ps.pub('system.logout.request');
  }

  goToPlayerPage() {
    InfoPresenter.ps.pub('system.goToPlayerPage.request');
  }

  goToChannelListPage() {
    InfoPresenter.ps.pub('system.goToChannelListPage.request');
  }

  finalize() {
    delete this._connection.onchange;
  }
}
