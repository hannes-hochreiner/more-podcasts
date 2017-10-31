import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class ChannelPresenter {
  constructor(view) {
    this._view = view;
    this._updateItems();
  }

  showItem(itemId) {

  }

  goToChannelListPage() {
    PubSub.publish('system.goToChannelListPage.request');
  }

  requestDownload(channelId, itemId) {
    pps('system.addOrUpdateEnclosureDoc', {
      enclosureDoc: {channelId: channelId, itemId: itemId}
    }).then(() => {
      return pps('system.getEnclosureDocsByChannelId', {channelId: channelId});
    }).then(res => {
      // TODO: update items
    });
  }

  _updateItems() {
    pps('system.getItemsByChannelId', {channelId: this._view.channelId}).then(res => {
      this._view.items = res.items.sort((i1, i2) => {
        return -i1.date.localeCompare(i2.date);
      });
    });
  }

  finalize() {

  }
}
