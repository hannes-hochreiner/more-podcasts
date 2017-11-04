export default class InfoPresenter {
  constructor(view) {
    this._view = view;
    this._connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    this._connection.onchange = this._handleChange.bind(this);
    this._view.info = this._printStatus(this._connection);
  }

  _printStatus(conn) {
    return `type: ${conn.type}; effType: ${conn.effectiveType}; downlinkMax: ${conn.downlinkMax}; downlink: ${conn.downlink}; rtt: ${conn.rtt}; saveData: ${conn.saveData}`;
  }

  _handleChange() {
    this._view.info = this._printStatus(this._connection);
  }

  goToPlayerPage() {
    InfoPresenter.ps.pub('system.goToPlayerPage.request');
  }

  goToChannelListPage() {
    InfoPresenter.ps.pub('system.goToChannelListPage.request');
  }

  finalize() {
    delete this._connection.onchange;
    delete this._view;
  }
}
