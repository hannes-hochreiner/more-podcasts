import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class PlayerService {
  constructor(ps) {
    this.ps = ps;
    this.audio = new Audio();
    this.audio.onended = this._handleEnded.bind(this);
    this.ps.reg('system.playerService.getStatus', this.getStatus.bind(this));
    this.ps.reg('system.playerService.setItem', this.setItem.bind(this));
    this.ps.reg('system.playerService.getItem', this.getItem.bind(this));
    this.ps.reg('system.playerService.setSpeed', this.setSpeed.bind(this));
    this.ps.reg('system.playerService.getSpeed', this.getSpeed.bind(this));
    this.ps.reg('system.playerService.setVolume', this.setVolume.bind(this));
    this.ps.reg('system.playerService.getVolume', this.getVolume.bind(this));
    this.ps.reg('system.playerService.setPlaying', this.setPlaying.bind(this));
    this.ps.reg('system.playerService.getPlaying', this.getPlaying.bind(this));
    this.ps.reg('system.playerService.setCurrentTime', this.setCurrentTime.bind(this));
    this.ps.reg('system.playerService.getCurrentTime', this.getCurrentTime.bind(this));
    this.ps.reg('system.playerService.getDuration', this.getDuration.bind(this));
    this.ps.reg('system.playerService.getPlaylist', this.getPlaylist.bind(this));
  }

  _handleEnded() {
    let statusObj = {};

    this.audio.pause();

    this.ps.prom('system.getItemByChannelIdId', {id: this.item.id, channelId: this.item.channelId}).then(res => {
      let item = res.item;

      delete item.currentTime;

      if (item.playCount) {
        item.playCount += 1;
      } else {
        item.playCount = 1;
      }

      return this.ps.prom('system.addOrUpdateItem', {item: item});
    }).then(() => {
      return this.getPlaylist();
    }).then(res => {
      statusObj.playlist = res.playlist;
      statusObj.item = res.playlist[0];
      return this.setItem(null, null, null, null, {item:res.playlist[0]});
    }).then(() => {
      return this.setPlaying(null, null, null, null, {playing: true});
    }).then(() => {
      statusObj.playing = !this.audio.paused;
      statusObj.speed = this.audio.playbackRate;
      statusObj.volume = this.audio.volume;
      statusObj.currentTime = this.audio.currentTime;
      statusObj.duration = this.audio.duration;
      this.ps.pub('system.playerService.statusChanged', {status: statusObj});
    });
  }

  getStatus(realm, component, topic, id, data) {
    return this.getPlaylist().then(res => {
      return {
        status: {
          item: this.item,
          speed: this.audio.playbackRate,
          volume: this.audio.volume,
          playing: !this.audio.paused,
          currentTime: this.audio.currentTime,
          duration: this.audio.duration,
          playlist: res.playlist
        }
      };
    });
  }

  getPlaylist(realm, component, topic, id, data) {
    return this.ps.prom('system.getAllEnclosureDocs').then(res => {
      return Promise.all(res.enclosureDocs.filter(enc => {
        return typeof enc._attachments !== 'undefined';
      }).map(enc => {
        return this.ps.prom('system.getItemByChannelIdId', {channelId: enc.channelId, id: enc.itemId});
      }));
    }).then(res => {
      return {
        playlist: res.map(itm => {
          return itm.item;
        }).filter(itm => {
          return typeof itm.playCount === 'undefined';
        }).sort((itm1, itm2) => {
          return itm1.date.localeCompare(itm2.date);
        })
      };
    });
  }

  _setSource(enclosure) {
    return new Promise((resolve, reject) => {
      this.audio.onloadeddata = () => {
        delete this.audio.onloadeddata;
        resolve();
      };
      this.audio.onerror = (e) => {
        delete this.audio.onerror;
        reject(e);
      };

      if (this.audio.src) {
        URL.revokeObjectURL(this.audio.src);
      }

      this.audio.src = URL.createObjectURL(enclosure);
    });
  }

  setItem(realm, component, topic, id, data) {
    this.item = data.item;

    return Promise.all([
      this.ps.prom('system.getItemByChannelIdId', {id: this.item.id, channelId: this.item.channelId}),
      this.ps.prom('system.getEnclosureBinaryByChannelIdItemId', {channelId: this.item.channelId, itemId: this.item.id})
    ]).then(res => {
      this.item = res[0].item;

      return this._setSource(res[1].enclosure).then(() => {
        let currentTime = 0;

        if (this.item.currentTime) {
          currentTime = this.item.currentTime;
        }

        this.audio.currentTime = currentTime;
      });
    });
  }

  getItem(realm, component, topic, id, data) {
    return {item: this.item};
  }

  setSpeed(realm, component, topic, id, data) {
    this.audio.playbackRate = data.speed;
  }

  getSpeed(realm, component, topic, id, data) {
    return {speed: this.audio.playbackRate};
  }

  setVolume(realm, component, topic, id, data) {
    this.audio.volume = data.volume;
  }

  getVolume(realm, component, topic, id, data) {
    return {volume: this.audio.volume};
  }

  setPlaying(realm, component, topic, id, data) {
    if (!this.item) {
      return new Promise((resolve, reject) => { reject(new Error("No item set for playing.")); })
    }

    if (data.playing) {
      this.audio.play();
      return new Promise((resolve, reject) => { resolve(); })
    }

    this.audio.pause();
    return this.ps.prom('system.getItemByChannelIdId', {id: this.item.id, channelId: this.item.channelId}).then(res => {
      let item = res.item;

      item.currentTime = this.audio.currentTime;

      return this.ps.prom('system.addOrUpdateItem', {item: item});
    });
  }

  getPlaying(realm, component, topic, id, data) {
    return {playing: !this.audio.paued};
  }

  setCurrentTime(realm, component, topic, id, data) {
    this.audio.currentTime = data.currentTime;
  }

  getCurrentTime(realm, component, topic, id, data) {
    return {currentTime: this.audio.currentTime};
  }

  getDuration(realm, component, topic, id, data) {
    return {duration: this.audio.duration};
  }
}
