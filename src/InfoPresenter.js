export default class InfoPresenter {
  constructor(view) {
    this._view = view;
    this._view.networkSaveData = InfoPresenter.NetworkTest.saveData;
    this._view.networkType = InfoPresenter.NetworkTest.type;
    this._view.networkAccess = InfoPresenter.NetworkTest.shouldAccessNetwork;
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
