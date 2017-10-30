export default class ChannelRepository {
  constructor(pouch, pubSub) {
    this._pouch = pouch;
    this._ps = pubSub;

    this._ps.subscribe('system.getAllChannels.request', this.getAllChannels.bind(this));
    this._ps.subscribe('system.getChannelById.request', this.getChannelById.bind(this));
    this._ps.subscribe('system.addOrUpdateChannel.request', this.addOrUpdateChannel.bind(this));
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
}
