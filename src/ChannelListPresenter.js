import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class ChannelListPresenter {
  constructor(view) {
    this._view = view;
    this._updateChannels();
  }

  _updateChannels() {
    return pps('system.getAllChannels').then(res => {
      res.channels.sort((ch1, ch2) => {
        return ch1.title.localeCompare(ch2.title);
      });
      this._view.allChannels = res.channels;
      this._view.selectedChannels = res.channels.filter(channel => {
        return channel.selected;
      });
    });
  }

  goToPlayerPage() {
    PubSub.publish('system.goToPlayerPage.request');
  }

  goToInfoPage() {
    PubSub.publish('system.goToInfoPage.request');
  }

  addNewChannel(channelUrl) {
    pps('system.postNewApiChannel', {url: channelUrl}).then(id => {
      this._view.newChannelUrl = '';

      return pps('system.getApiChannelById', id);
    }).then(res => {
      res.channel.selected = true;

      return pps('system.addOrUpdateChannel', {channel: res.channel});
    }).then(() => {
      this._updateChannels();
    });
  }

  updateChannelSelection(channelId, selected) {
    pps('system.getChannelById', {id:channelId}).then(data => {
      data.channel.selected = selected;

      return pps('system.addOrUpdateChannel', data);
    }).then(() => {
      return this._updateChannels();
    });
  }

  showChannel(id) {
    PubSub.publish('system.goToChannelPage.request', {id:id});
  }

  finalize() {
    delete this._view;
  }
}
