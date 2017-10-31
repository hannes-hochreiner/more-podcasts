export default class ChannelRepository {
  constructor(pouch, pubSub) {
    this._pouch = pouch;
    this._ps = pubSub;

    this._ps.subscribe('system.getAllChannels.request', this.getAllChannels.bind(this));
    this._ps.subscribe('system.getChannelById.request', this.getChannelById.bind(this));
    this._ps.subscribe('system.getItemsByChannelId.request', this.getItemsByChannelId.bind(this));
    this._ps.subscribe('system.getItemByChannelIdId.request', this.getItemByChannelIdId.bind(this));
    this._ps.subscribe('system.addOrUpdateChannel.request', this.addOrUpdateChannel.bind(this));
    this._ps.subscribe('system.addOrUpdateItem.request', this.addOrUpdateItem.bind(this));
  }

  getAllChannels(topic, data) {
    let respId = `system.getAllChannels.response.${topic.split('.')[3]}`;

    this._pouch.allDocs({
      include_docs: true,
      startkey: 'channels/',
      endkey: 'channels/\ufff0'
    }).then(data => {
      this._ps.publish(respId, {
        channels: data.rows.map(row => {
          return row.doc;
        })
      });
    }).catch(err => {
      this._ps.publish(respId, { error: err });
    });
  }

  getItemsByChannelId(topic, data) {
    let respId = `system.getItemsByChannelId.response.${topic.split('.')[3]}`;

    this._pouch.allDocs({
      include_docs: true,
      startkey: `items/${data.channelId}/`,
      endkey: `items/${data.channelId}/\ufff0`
    }).then(data => {
      this._ps.publish(respId, {
        items: data.rows.map(row => {
          return row.doc;
        })
      });
    }).catch(err => {
      this._ps.publish(respId, { error: err });
    });
  }

  getItemByChannelIdId(topic, data) {
    let respId = `system.getItemByChannelIdId.response.${topic.split('.')[3]}`;

    this._pouch.get(`items/${data.channelId}/${data.id}`).then(item => {
      this._ps.publish(respId, {item: item});
    }).catch(err => {
      this._ps.publish(respId, { error: err });
    });
  }

  getChannelById(topic, data) {
    let respId = `system.getChannelById.response.${topic.split('.')[3]}`;

    this._pouch.get(`channels/${data.id}`).then(channel => {
      this._ps.publish(respId, {channel: channel});
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }

  addOrUpdateChannel(topic, data) {
    let respId = `system.addOrUpdateChannel.response.${topic.split('.')[3]}`;
    let channel = data.channel;

    channel._id = `channels/${channel.id}`;

    this._pouch.put(channel).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }

  addOrUpdateItem(topic, data) {
    let respId = `system.addOrUpdateItem.response.${topic.split('.')[3]}`;
    let item = data.item;

    if (!item.channelId) {
      this._ps.publish(respId, {error: new Error('Item has no channel id.')});
      return;
    }

    item._id = `items/${item.channelId}/${item.id}`;

    this._pouch.put(item).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }
}
