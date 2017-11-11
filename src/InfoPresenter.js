export default class InfoPresenter {
  constructor(view) {
    this._view = view;
    this._view.networkSaveData = InfoPresenter.NetworkTest.saveData;
    this._view.networkType = InfoPresenter.NetworkTest.type;
    this._view.networkAccess = InfoPresenter.NetworkTest.shouldAccessNetwork;
    console.dir(navigator);
    console.dir(window);
    navigator.storage.estimate().then(res => {
      this._view.storageInfo = `${Math.round(res.usage / (1024 * 1024))} MB of ${Math.round(res.quota / (1024 * 1024))} MB used (${Math.round(res.usage / res.quota * 100)}%)`;
    });
    navigator.webkitPersistentStorage.requestQuota (1024 * 1024 * 1024 * 10, grantedBytes => {
        // window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
          console.log(grantedBytes);
          this._view.fileSystemSize = `${grantedBytes}`;
        },
        function(e) { console.log('Error', e); });
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
    delete this._view;
  }
}
