import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class PlayerService {
  constructor() {
    this.audio = new Audio();
    PubSub.subscribe('system.setPlayerItem.request', this.setPlayerItem.bind(this));
    PubSub.subscribe('system.getPlayerItem.request', this.getPlayerItem.bind(this));
    PubSub.subscribe('system.setPlayerSpeed.request', this.setPlayerSpeed.bind(this));
    PubSub.subscribe('system.getPlayerSpeed.request', this.getPlayerSpeed.bind(this));
    PubSub.subscribe('system.setPlayerVolume.request', this.setPlayerVolume.bind(this));
    PubSub.subscribe('system.getPlayerVolume.request', this.getPlayerVolume.bind(this));
    PubSub.subscribe('system.setPlayerPlaying.request', this.setPlayerPlaying.bind(this));
    PubSub.subscribe('system.getPlayerPlaying.request', this.getPlayerPlaying.bind(this));
  }

  setPlayerItem(topic, data) {
    let respTopic = `system.setPlayerItem.response.${topic.split('.')[3]}`;
    this.item = data.item;

    pps('system.getEnclosureBinaryByChannelIdItemId', {channelId: this.item.channelId, itemId: this.item.id}).then(res => {
      if (this.audio.src) {
        URL.revokeObjectURL(this.audio.src);
      }

      this.audio.src = URL.createObjectURL(res.enclosure);
      PubSub.publish(respTopic);
    }).catch(err => {
      PubSub.publish(respTopic, {error: err});
    });
  }

  getPlayerItem(topic, data) {
    PubSub.publish(`system.getPlayerItem.response.${topic.split('.')[3]}`, {item: this.item});
  }

  setPlayerSpeed(topic, data) {
    this.audio.playbackRate = data.speed;
    PubSub.publish(`system.setPlayerSpeed.response.${topic.split('.')[3]}`);
  }

  getPlayerSpeed(topic, data) {
    PubSub.publish(`system.getPlayerSpeed.response.${topic.split('.')[3]}`, {speed: this.audio.playbackRate});
  }

  setPlayerVolume(topic, data) {
    this.audio.volume = data.volume;
    PubSub.publish(`system.setPlayerVolume.response.${topic.split('.')[3]}`);
  }

  getPlayerVolume(topic, data) {
    PubSub.publish(`system.getPlayerVolume.response.${topic.split('.')[3]}`, {volume: this.audio.volume});
  }

  setPlayerPlaying(topic, data) {
    if (data.playing) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
    PubSub.publish(`system.setPlayerPlaying.response.${topic.split('.')[3]}`);
  }

  getPlayerPlaying(topic, data) {
    PubSub.publish(`system.getPlayerPlaying.response.${topic.split('.')[3]}`, {playing: !this.audio.paued});
  }
}
