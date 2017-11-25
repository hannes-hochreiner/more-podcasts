import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class ChannelPresenter {
  constructor(view) {
    this._view = view;
    this._updateState();
  }

  goToChannelListPage() {
    PubSub.publish('system.goToChannelListPage.request');
  }

  removeDownload(channelId, itemId) {
    return pps('system.removeEnclosureDocAndBinaryByChannelItemId', {channelId: channelId, itemId: itemId}).then(() => {
      return this._updateState();
    });
  }

  refreshDownload(channelId, itemId) {
    return pps('system.removeEnclosureBinaryByChannelIdItemId', {channelId: channelId, itemId: itemId}).then(() => {
      return pps('system.getEnclosureDocByChannelIdItemId', {channelId: channelId, itemId: itemId});
    }).then(encDoc => {
      if (encDoc.enclosureDoc.failed) {
        delete encDoc.enclosureDoc.failed;

        return pps('system.addOrUpdateEnclosureDoc', encDoc);
      }

      return Promise.resolve();
    }).then(() => {
      return this._updateState();
    });
  }

  requestDownload(channelId, itemId) {
    pps('system.addOrUpdateEnclosureDoc', {
      enclosureDoc: {channelId: channelId, itemId: itemId}
    }).then(() => {
      return pps('system.getItemByChannelIdId', {channelId: channelId, id: itemId});
    }).then(res => {
      res.item.triaged = true;
      return pps('system.addOrUpdateItem', {item: res.item});
    }).then(() => {
      return this._updateState();
    });
  }

  play(channelId, itemId) {
    return pps('system.getItemByChannelIdId', {channelId: channelId, id: itemId}).then(res => {
      return pps('system.playerService.setItem', {item: res.item});
    }).then(() => {
      return pps('system.playerService.setPlaying', {playing: true});
    }).then(() => {
      return this._updateState();
    });
  }

  toggleTriaged(channelId, itemId) {
    return pps('system.getItemByChannelIdId', {channelId: channelId, id: itemId}).then(res => {
      if (res.item.triaged) {
        delete res.item.triaged;
      } else {
        res.item.triaged = true;
      }

      return pps('system.addOrUpdateItem', {item: res.item});
    }).then(() => {
      return this._updateState();
    });
  }

  _updateState() {
    return Promise.all([
      pps('system.getItemsByChannelId', {channelId: this._view.channelId}),
      pps('system.getEnclosureDocsByChannelId', {channelId: this._view.channelId})
    ]).then(res => {
      return Promise.all(res[1].enclosureDocs.map(doc => {
        return pps('system.checkEnclosureBinaryExistsByChannelItemId', doc);
      })).then(binExists => {
        this._view.items = res[0].items.sort((i1, i2) => {
          return -i1.date.localeCompare(i2.date);
        });
        this._view.enclosureDocs = res[1].enclosureDocs;
        this._view.binExists = binExists;
      });
    });
  }

  finalize() {
    delete this._view;
  }
}
