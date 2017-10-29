import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';
import axios from 'axios';

export default class ChannelService {
  constructor() {
    PubSub.subscribe('system.getApiChannels.request', this._getApiChannels.bind(this));
    PubSub.subscribe('system.postNewApiChannel.request', this._postNewApiChannel.bind(this));
  }

  _getApiChannels(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.get('https://internal.hochreiner.net/rss-json-service/channels', {
        headers: {'Authorization': `Bearer ${idToken.idToken}`}
      });
    }).then(res => {
      let pubObj = {};

      if (res.data.error) {
        pubObj.error = res.data.error;
      } else {
        pubObj.channels = res.data.channels;
      }
      PubSub.publish(`system.getApiChannels.response.${topic.split('.')[3]}`, pubObj);
    });
  }

  _postNewApiChannel(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.post('https://internal.hochreiner.net/rss-json-service/channels', {
        url: data.url
      }, {
        headers: {'Authorization': `Bearer ${idToken.idToken}`}
      });
    }).then(res => {
      let pubObj = {};

      if (res.data.error) {
        pubObj.error = res.data.error;
      } else {
        pubObj.id = res.data.id;
      }
      PubSub.publish(`system.postNewApiChannel.response.${topic.split('.')[3]}`, pubObj);
    });
  }
}
