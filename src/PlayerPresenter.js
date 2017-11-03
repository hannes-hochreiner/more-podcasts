import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class PlayerPresenter {
  constructor(view) {
    this._view = view;

    this._updateCurrentState();
    this._getPlayList().then(res => {
      this._view.items = res;
    });
  }

  _updateCurrentState() {
    Promise.all([
      pps('system.getPlayerPlaying'),
      pps('system.getPlayerItem'),
      pps('system.getPlayerVolume'),
      pps('system.getPlayerSpeed')
    ]).then(res => {
      this._view.playing = res[0].playing;
      this._view.selectedItem = res[1].item;
      this._view.volume = res[2].volume;
      this._view.speed = res[3].speed;
    });
  }

  _getPlayList() {
    return pps('system.getAllEnclosureDocs').then(res => {
      return Promise.all(res.enclosureDocs.filter(enc => {
        return typeof enc._attachments !== 'undefined';
      }).map(enc => {
        return pps('system.getItemByChannelIdId', {channelId: enc.channelId, id: enc.itemId});
      }));
    }).then(res => {
      return res.map(itm => {
        return itm.item;
      }).filter(itm => {
        return typeof itm.playCount === 'undefined';
      }).sort((itm1, itm2) => {
        return itm1.date.localeCompare(itm2.date);
      });
    });
  }

  goToChannelListPage() {
    PubSub.publish('system.goToChannelListPage.request');
  }

  selectedItemChanged(item) {
    this.stop().then(() => {
      return pps('system.setPlayerItem', {item: item});
    }).then(() => {
      this._view.selectedItem = item;
      return pps('system.getPlayerDuration');
    }).then((res) => {
      this._view.duration = res.duration;
      this._view.currentTime = 0;
      return this.start();
    });
  }

  volumeChanged(volume) {
    pps('system.setPlayerVolume', {volume: volume}).then(() => {
      this._view.volume = volume;
    });
  }

  speedChanged(speed) {
    pps('system.setPlayerSpeed', {speed: speed}).then(() => {
      this._view.speed = speed;
    });
  }

  currentTimeChanged(currentTime) {
    pps('system.setPlayerCurrentTime', {currentTime: currentTime});
  }

  start() {
    this._endedToken = PubSub.subscribe('event.playerEnded', this._handleEnded.bind(this));

    return pps('system.setPlayerPlaying', {playing: true}).then(() => {
      this._view.playing = true;
      this._intervalCancelToken = setInterval(this._updateCurrentTime.bind(this), 1000);
    });
  }

  stop() {
    clearInterval(this._intervalCancelToken);
    delete this._intervalCancelToken;
    PubSub.unsubscribe(this._endedToken);
    delete this._endedToken;

    return pps('system.setPlayerPlaying', {playing: false}).then(() => {
      this._view.playing = false;
    });
  }

  _updateCurrentTime() {
    pps('system.getPlayerCurrentTime').then(res => {
      this._view.currentTime = res.currentTime;
    });
  }

  _handleEnded() {
    this.stop().then(() => {
      return pps('system.getPlayerItem');
    }).then(res => {
      let item = res.item;

      if (item.playCount) {
        item.playCount += 1;
      } else {
        item.playCount = 1;
      }

      return pps('system.addOrUpdateItem', {item: item});
    }).then(() => {
      return this._getPlayList();
    }).then(res => {
      this._view.items = res;
      this.selectedItemChanged(res[0]);
    });
  }

  finalize() {

  }
}
