import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';
import axios from 'axios';

export default class ChannelService {
  constructor() {
    PubSub.subscribe('system.getApiChannels.request', this._getApiChannels.bind(this));
  }

  _getApiChannels(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.get('https://internal.hochreiner.net/rss-json-service/channels', {
        headers: {'Authentication': `Baerer ${idToken}`}
      });
    }).then(res => {
      console.dir(res);
    });
  }
}
