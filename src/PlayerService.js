import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class PlayerService {
  constructor(ps) {
    this.ps = ps;
    this.audio = new Audio();
    this.audio.addEventListener('play', this._handlePlay.bind(this));
    this.audio.addEventListener('pause', this._handlePause.bind(this));
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

    this.getPlaylist().then(res => {
      if (res.playlist.length === 0) {
        return;
      }

      return this.setItem(null, null, null, null, {item: res.playlist[0]}).then(() => {
        this.ps.pub('system.playerService.statusChanged', {status: {
          playlist: res.playlist,
          item: res.playlist[0],
          playing: !this.audio.paused,
          speed: this.audio.playbackRate,
          volume: this.audio.volume,
          currentTime: this.audio.currentTime,
          duration: this.audio.duration
        }});
      });
    });
  }

  _handleCurrentTimeUpdate() {
    return this._updateCurrentTimeForItem(this.audio.currentTime, this.item);
  }

  _handlePause() {
    if (this.currentTimeIntervalId) {
      clearInterval(this.currentTimeIntervalId);
    }

    return this._updateCurrentTimeForItem(this.audio.currentTime, this.item).then(() => {
      return this.getStatus();
    }).then(res => {
      this.ps.pub('system.playerService.statusChanged', res);
    });
  }

  _handlePlay() {
    return new Promise((resolve, reject) => {
      if (!this.currentTimeIntervalId) {
        this.currentTimeIntervalId = setInterval(this._handleCurrentTimeUpdate.bind(this), 3000);
      }

      resolve();
    });
  }

  _handleEnded() {
    let statusObj = {};

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
      let canplaythroughFun = () => {
        this.audio.removeEventListener('canplaythrough', canplaythroughFun);
        this.audio.removeEventListener('error', errorFun);
        resolve();
      };
      let errorFun = (e) => {
        this.audio.removeEventListener('canplaythrough', canplaythroughFun);
        this.audio.removeEventListener('error', errorFun);
        reject(e);
      };

      this.audio.addEventListener('canplaythrough', canplaythroughFun);
      this.audio.addEventListener('error', errorFun);

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
      this.ps.prom('system.getEnclosureBinaryByChannelIdItemId', {channelId: this.item.channelId, itemId: this.item.id}),
      this.ps.prom('system.getChannelById', {id: this.item.channelId})
    ]).then(res => {
      this.item = res[0].item;

      return this._setSource(res[1].enclosure).then(() => {
        let channel = res[2].channel;

        this.audio.currentTime = this.item.currentTime || 0;
        this.audio.volume = channel.volume || 0.5;
        this.audio.playbackRate = channel.speed || 1.0;
      });
    });
  }

  getItem(realm, component, topic, id, data) {
    return {item: this.item};
  }

  setSpeed(realm, component, topic, id, data) {
    this.audio.playbackRate = data.speed;

    let timeoutId = this.delayedSpeedTimeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    this.delayedSpeedTimeoutId = setTimeout(this._delayedSpeedUpdate.bind(this), 1500);
  }

  _delayedSpeedUpdate() {
    delete this.delayedSpeedTimeoutId;
    let speed = this.audio.playbackRate;
    let item = this.item;

    if (!item || !speed) {
      return;
    }

    return this.ps.prom('system.getChannelById', {id: item.channelId}).then(res => {
      let resChannel = res.channel;

      resChannel.speed = speed;

      return this.ps.prom('system.addOrUpdateChannel', {channel: resChannel});
    });
  }

  getSpeed(realm, component, topic, id, data) {
    return {speed: this.audio.playbackRate};
  }

  setVolume(realm, component, topic, id, data) {
    this.audio.volume = data.volume;

    let timeoutId = this.delayedVolumeTimeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    this.delayedVolumeTimeoutId = setTimeout(this._delayedVolumeUpdate.bind(this), 1500);
  }

  _delayedVolumeUpdate() {
    delete this.delayedVolumeTimeoutId;
    let volume = this.audio.volume;
    let item = this.item;

    if (!item || !volume) {
      return;
    }

    return this.ps.prom('system.getChannelById', {id: item.channelId}).then(res => {
      let resChannel = res.channel;

      resChannel.volume = volume;

      return this.ps.prom('system.addOrUpdateChannel', {channel: resChannel});
    });
  }

  getVolume(realm, component, topic, id, data) {
    return {volume: this.audio.volume};
  }

  setPlaying(realm, component, topic, id, data) {
    if (!this.item) {
      return new Promise((resolve, reject) => { reject(new Error("No item set for playing.")); })
    }

    if (data.playing) {
      this.audio.removeEventListener('play', this._handlePlay.bind(this));
      this.audio.play();

      return this._handlePlay().then(() => {
        this.audio.addEventListener('play', this._handlePlay.bind(this));
      });
    }

    this.audio.removeEventListener('pause', this._handlePause.bind(this));
    this.audio.pause();
    return this._handlePause().then(() => {
      this.audio.addEventListener('pause', this._handlePause.bind(this));
    });
  }

  _updateCurrentTimeForItem(currentTime, item) {
    return this.ps.prom('system.getItemByChannelIdId', {id: item.id, channelId: item.channelId}).then(res => {
      let resItem = res.item;

      resItem.currentTime = currentTime;

      return this.ps.prom('system.addOrUpdateItem', {item: resItem});
    });
  }

  getPlaying(realm, component, topic, id, data) {
    return {playing: !this.audio.paued};
  }

  setCurrentTime(realm, component, topic, id, data) {
    this.audio.currentTime = data.currentTime;

    let timeoutId = this.delayedCurrentTimeTimeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    this.delayedCurrentTimeTimeoutId = setTimeout(this._delayedCurrentTimeUpdate.bind(this), 1500);
  }

  _delayedCurrentTimeUpdate() {
    delete this.delayedCurrentTimeTimeoutId;
    let currentTime = this.audio.currentTime;
    let item = this.item;

    if (!item || !currentTime) {
      return;
    }

    this._updateCurrentTimeForItem(currentTime, item);
  }

  getCurrentTime(realm, component, topic, id, data) {
    return {currentTime: this.audio.currentTime};
  }

  getDuration(realm, component, topic, id, data) {
    return {duration: this.audio.duration};
  }
}
