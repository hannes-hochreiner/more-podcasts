import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';
import axios from 'axios';

export default class ChannelService {
  constructor() {
    PubSub.subscribe('system.getApiChannels.request', this._getApiChannels.bind(this));
    PubSub.subscribe('system.getApiChannelById.request', this._getApiChannelById.bind(this));
    PubSub.subscribe('system.postNewApiChannel.request', this._postNewApiChannel.bind(this));
    PubSub.subscribe('system.getApiItemsByChannelId.request', this._getApiItemsByChannelId.bind(this));
    PubSub.subscribe('system.getApiItemBlobByChannelIdId.request', this._getApiItemBlobByChannelIdId.bind(this));
  }

  _getApiItemBlobByChannelIdId(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.get(`https://internal.hochreiner.net/rss-json-service/channels/${data.channelId}/items/${data.id}`, {
        headers: {
          'Authorization': `Bearer ${idToken.idToken}`,
          'Accept': 'audio/mpeg'
        },
        responseType: 'blob'
      });
    }).then(res => {
      PubSub.publish(`system.getApiItemBlobByChannelIdId.response.${topic.split('.')[3]}`, res.data);
    });
  }

  _getApiItemsByChannelId(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.get(`https://internal.hochreiner.net/rss-json-service/channels/${data.channelId}/items`, {
        headers: {'Authorization': `Bearer ${idToken.idToken}`}
      });
    }).then(res => {
      PubSub.publish(`system.getApiItemsByChannelId.response.${topic.split('.')[3]}`, res.data);
    });
  }

  _getApiChannels(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.get('https://internal.hochreiner.net/rss-json-service/channels', {
        headers: {'Authorization': `Bearer ${idToken.idToken}`}
      });
    }).then(res => {
      PubSub.publish(`system.getApiChannels.response.${topic.split('.')[3]}`, res.data);
    });
  }

  _getApiChannelById(topic, data) {
    pps('system.getIdToken').then(idToken => {
      return axios.get(`https://internal.hochreiner.net/rss-json-service/channels/${data.id}`, {
        headers: {'Authorization': `Bearer ${idToken.idToken}`}
      });
    }).then(res => {
      PubSub.publish(`system.getApiChannelById.response.${topic.split('.')[3]}`, res.data);
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
      PubSub.publish(`system.postNewApiChannel.response.${topic.split('.')[3]}`, res.data);
    });
  }
}
