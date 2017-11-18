export default class InfoPresenter {
  constructor(view) {
    this._view = view;
    this._view.networkSaveData = InfoPresenter.NetworkTest.saveData;
    this._view.networkType = InfoPresenter.NetworkTest.type;
    this._view.networkAccess = InfoPresenter.NetworkTest.shouldAccessNetwork;
    InfoPresenter.fssTemp.queryUsageAndQuota().then(res => {
      this._view.tempUsage = res.usage;
      this._view.tempQuota = res.quota;
    });
    InfoPresenter.fssPers.queryUsageAndQuota().then(res => {
      this._view.persUsage = res.usage;
      this._view.persQuota = res.quota;
    });
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
