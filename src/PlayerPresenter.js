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
    return this.stop().then(() => {
      return pps('system.getItemByChannelIdId', {id: item.id, channelId: item.channelId});
    }).then(res => {
      return pps('system.setPlayerItem', {item: res.item}).then(() => {
        let item = res.item;
        this._view.selectedItem = item;

        return pps('system.getPlayerDuration').then((res) => {
          this._view.duration = res.duration;

          let currentTime = 0;

          if (item.currentTime) {
            currentTime = item.currentTime;
          }

          this._view.currentTime = currentTime;

          return pps('system.setPlayerCurrentTime', {currentTime: currentTime});
        });
      });
    });
  }

  volumeChanged(volume) {
    pps('system.setPlayerVolume', {volume: volume});
  }

  speedChanged(speed) {
    pps('system.setPlayerSpeed', {speed: speed});
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

    return Promise.all([
      pps('system.getPlayerItem'),
      pps('system.setPlayerPlaying', {playing: false})
    ]).then(res => {
      this._view.playing = false;
      let item = res[0].item;

      if (!item) {
        return;
      }

      return Promise.all([
        pps('system.getItemByChannelIdId', {id: item.id, channelId: item.channelId}),
        pps('system.getPlayerCurrentTime')
      ]).then(res => {
        let item = res[0].item;
        item.currentTime = res[1].currentTime;

        return pps('system.addOrUpdateItem', {item: item});
      });
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
      return pps('system.getItemByChannelIdId', {id: res.item.id, channelId: res.item.channelId});
    }).then(res => {
      let item = res.item;

      delete item.currentTime;

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
      return this.selectedItemChanged(res[0]);
    }).then(() => {
      return this.start();
    });
  }

  finalize() {

  }
}
