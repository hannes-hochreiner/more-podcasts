import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class PlayerPresenter {
  constructor(view) {
    this._view = view;

    this._statusToken = PubSub.subscribe('system.playerService.statusChanged', this._handleStatusChange.bind(this));
    this._updateCurrentState();
  }

  _updateCurrentState() {
    return pps('system.playerService.getStatus').then(res => {
      this._handleStatusChange(null, res);
    });
  }

  refreshEnclosure(item) {
    return pps('system.removeEnclosureBinaryByChannelIdItemId', {
      channelId: item.channelId,
      itemId: item.id
    }).then(() => {
      return pps('system.playerService.getStatus');
    }).then(res => {
      this._handleStatusChange(null, res);
    });
  }

  deleteEnclosure(item) {
    return pps('system.removeEnclosureDocAndBinaryByChannelItemId', {
      channelId: item.channelId,
      itemId: item.id
    }).then(() => {
      return pps('system.playerService.getStatus');
    }).then(res => {
      this._handleStatusChange(null, res);
    });
  }

  goToChannelListPage() {
    PubSub.publish('system.goToChannelListPage.request');
  }

  selectedItemChanged(item) {
    return pps('system.playerService.setItem', {item: item}).then(() => {
      return this._updateCurrentState();
    }).catch(error => {
      let message = 'error loading item';

      if (error.message) {
        message = error.message;
      }

      PubSub.publish('user.notification.showError', {error: {message: message}});
    });
  }

  volumeChanged(volume) {
    pps('system.playerService.setVolume', {volume: volume});
  }

  speedChanged(speed) {
    pps('system.playerService.setSpeed', {speed: speed});
  }

  currentTimeChanged(currentTime) {
    pps('system.playerService.setCurrentTime', {currentTime: currentTime});
  }

  start() {
    return pps('system.playerService.setPlaying', {playing: true}).then(() => {
      this._view.playing = true;

      if (!this._intervalCancelToken) {
        this._intervalCancelToken = setInterval(this._updateCurrentTime.bind(this), 1000);
      }
    });
  }

  stop() {
    let token = this._intervalCancelToken;
    delete this._intervalCancelToken;
    clearInterval(token);

    return pps('system.playerService.setPlaying', {playing: false}).then(res => {
      this._view.playing = false;
    });
  }

  _updateCurrentTime() {
    pps('system.playerService.getCurrentTime').then(res => {
      this._view.currentTime = res.currentTime;
    });
  }

  _handleStatusChange(topic, res) {
    this._view.playing = res.status.playing;
    this._view.selectedItem = res.status.item;
    this._view.currentTime = res.status.currentTime;
    this._view.volume = res.status.volume;
    this._view.speed = res.status.speed;
    this._view.items = res.status.playlist;
    this._view.duration = res.status.duration;

    if (this._intervalCancelToken && !res.status.playing) {
      let token = this._intervalCancelToken;
      delete this._intervalCancelToken;
      clearInterval(token);
    }

    if (!this._intervalCancelToken && res.status.playing) {
      this._intervalCancelToken = setInterval(this._updateCurrentTime.bind(this), 1000);
    }
  }

  finalize() {
    PubSub.unsubscribe(this._statusToken);

    if (this._intervalCancelToken) {
      clearInterval(this._intervalCancelToken);
    }
  }
}
