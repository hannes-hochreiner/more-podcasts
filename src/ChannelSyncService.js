import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';
import {mergePropertiesFromObject} from './objectMerger';

export default class ChannelSyncService {
  constructor() {
    PubSub.subscribe('system.syncChannels.request', this.syncChannels.bind(this));
  }

  syncChannels(topic, data) {
    let respId = `system.syncChannels.response.${topic.split('.')[3]}`;

    Promise.all([
      pps('system.getApiChannels'),
      pps('system.getAllChannels')
    ]).then(res => {
      let completeList = {};
      let apiChannels = res[0].channels;
      let localChannels = res[1].channels;

      apiChannels.forEach(channel => {
        completeList[channel.id] = true;
      });
      localChannels.forEach(channel => {
        completeList[channel.id] = true;
      });

      return Promise.all(Object.keys(completeList).map(channelId => {
        let apiChannel = apiChannels.find(channel => { return channel.id === channelId});
        let localChannel = localChannels.find(channel => { return channel.id === channelId});

        if (apiChannel && localChannel) {
          if (mergePropertiesFromObject(localChannel, ['title', 'description', 'url'], apiChannel)) {
            return pps('system.addOrUpdateChannel', {
              channel: localChannel
            }).catch(err => {
              PubSub.publish('system.log.error', {error: err});
            });
          }
        } else if (apiChannel) {
          return pps('system.addOrUpdateChannel', {
            channel: apiChannel
          }).catch(err => {
            PubSub.publish('system.log.error', {error: err});
          });
        } else if (localChannel) {
          return pps('system.postNewApiChannel', {url: localChannel.url}).then(() => {
            return pps('system.getApiChannelById', {id: localChannel.id});
          }).then(res => {
            if (mergePropertiesFromObject(localChannel, ['title', 'description', 'url'], res.channel)) {
              return pps('system.addOrUpdateChannel', {
                channel: localChannel
              });
            }
          }).catch(err => {
            PubSub.publish('system.log.error', {error: err});
          });
        }
      }).filter(channel => { return typeof channel !== 'undefined'; }));
    }).then(() => {
      return pps('system.getAllChannels');
    }).then(res => {
      return Promise.all(res.channels.filter(channel => {
        return channel.selected;
      }).map(channel => {
        return Promise.all([
          pps('system.getApiItemsByChannelId', {channelId: channel.id}),
          pps('system.getItemsByChannelId', {channelId: channel.id}),
        ]).then(itemRes => {
          let newProms = [];
          let apiItems = itemRes[0].items;
          let localItems = itemRes[1].items;

          apiItems.forEach(apiItem => {
            let localItem = localItems.find(itm => { return itm.id === apiItem.id; });

            if (!localItem) {
              apiItem.channelId = channel.id;
              newProms.push(pps('system.addOrUpdateItem', {item:apiItem}));
            } else {
              if (mergePropertiesFromObject(localItem, ['title', 'date', 'enclosure'], apiItem)) {
                newProms.push(pps('system.addOrUpdateItem', {item:localItem}));
              }
            }
          });

          return Promise.all(newProms);
        });
      }));
    }).then(() => {
      PubSub.publish(respId, {});
    }).catch(err => {
      PubSub.publish(respId, {error: err});
    });
  }
}
