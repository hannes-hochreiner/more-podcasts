import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class ChannelPresenter {
  constructor(view) {
    this._view = view;
    this._updateItems();
  }

  _updateItems() {
    pps('system.getItemsByChannelId', {channelId: this._view.channelId}).then(res => {
      console.log(res.items);
      this._view.items = res.items;
    });
  }
}
