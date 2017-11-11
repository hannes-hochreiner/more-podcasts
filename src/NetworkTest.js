export default class NetworkTest {
  static get shouldAccessNetwork() {
    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionTypeCheckFailed = typeof connection.type !== 'undefined' && !(connection.type === 'ethernet' || connection.type === 'wifi');
    let connectionSaveDataCheckFailed = typeof connection.saveData !== 'undefined' && connection.saveData;

    return !(connection && (connectionTypeCheckFailed || connectionSaveDataCheckFailed));
  }

  static get type() {
    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection && connection.type) {
      return connection.type;
    }

    return '';
  }

  static get saveData() {
    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection && connection.saveData) {
      return connection.saveData;
    }

    return false;
  }
}
