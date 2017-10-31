import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class PlayerPresenter {
  constructor(view) {
    this._view = view;
    this._audio = new Audio();

    this._updatePlayList();
    // pps('system.getApiItemBlobByChannelIdId', {channelId: this._view.channelId, id: itemId}).then(res => {
    //   let audio = new Audio();
    //
    //   audio.src = URL.createObjectURL(res);
    //   audio.play();
    // });
  }

  _updatePlayList() {
    return pps('system.getAllEnclosureDocs').then(res => {
      return Promise.all(res.enclosureDocs.filter(enc => {
        return typeof enc._attachments !== 'undefined';
      }).map(enc => {
        return pps('system.getItemByChannelIdId', {channelId: enc.channelId, id: enc.itemId});
      }));
    }).then(res => {
      this._view.items = res.map(itm => { return itm.item; }).sort((itm1, itm2) => {
        return itm1.date.localeCompare(itm2.date);
      });
    });
  }

  goToChannelListPage() {
    PubSub.publish('system.goToChannelListPage.request');
  }

  selectedItemChanged(item) {
    this.stop();
    this._view.selectedItem = item;
    pps('system.getEnclosureBinaryByChannelIdItemId', {channelId: item.channelId, itemId: item.id}).then(res => {
      this._audio.src = URL.createObjectURL(res.enclosure);
      this.start();
    });
  }

  start() {
    this._audio.play();
    this._view.playing = true;
  }

  stop() {
    this._audio.pause();
    this._view.playing = false;
  }

  finalize() {

  }
}
