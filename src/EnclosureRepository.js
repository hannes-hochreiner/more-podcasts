export default class EnclosureRepository {
  constructor(pouch, pubSub) {
    this._pouch = pouch;
    this._ps = pubSub;

    this._ps.subscribe('system.getAllEnclosureDocs.request', this.getAllEnclosureDocs.bind(this));
    this._ps.subscribe('system.getEnclosureDocsByChannelId.request', this.getEnclosureDocsByChannelId.bind(this));
    this._ps.subscribe('system.getEnclosureBinaryByChannelIdItemId.request', this.getEnclosureBinaryByChannelIdItemId.bind(this));
    this._ps.subscribe('system.addOrUpdateEnclosureDoc.request', this.addOrUpdateEnclosureDoc.bind(this));
    this._ps.subscribe('system.addOrUpdateEnclosureBinary.request', this.addOrUpdateEnclosureBinary.bind(this));
    this._ps.subscribe('system.removeEnclosureDocAndBinary.request', this.removeEnclosureDocAndBinary.bind(this));
  }

  getAllEnclosureDocs(topic, data) {
    let respId = `system.getAllEnclosureDocs.response.${topic.split('.')[3]}`;

    this._pouch.allDocs({
      include_docs: true
    }).then(data => {
      this._ps.publish(respId, {
        enclosureDocs: data.rows.map(row => {
          return row.doc;
        })
      });
    }).catch(err => {
      this._ps.publish(respId, { error: err });
    });
  }

  getEnclosureDocsByChannelId(topic, data) {
    let respId = `system.getEnclosureDocsByChannelId.response.${topic.split('.')[3]}`;

    this._pouch.allDocs({
      include_docs: true,
      startkey: `enclosures/${data.channelId}/`,
      endkey: `enclosures/${data.channelId}/\ufff0`
    }).then(data => {
      this._ps.publish(respId, {
        enclosureDocs: data.rows.map(row => {
          return row.doc;
        })
      });
    }).catch(err => {
      this._ps.publish(respId, { error: err });
    });
  }

  getEnclosureBinaryByChannelIdItemId(topic, data) {
    let respId = `system.getEnclosureBinaryByChannelIdItemId.response.${topic.split('.')[3]}`;

    this._pouch.get(`enclosures/${data.channelId}/${data.itemId}`).then(enclDoc => {
      return this._pouch.getAttachment(enclDoc._id, 'enclosure', {rev: enclDoc._rev});
    }).then(encl => {
      this._ps.publish(respId, {enclosure: encl});
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }

  addOrUpdateEnclosureDoc(topic, data) {
    let respId = `system.addOrUpdateEnclosureDoc.response.${topic.split('.')[3]}`;
    let enclDoc = data.enclosureDoc;

    enclDoc._id = `enclosures/${enclDoc.channelId}/${enclDoc.itemId}`;

    this._pouch.put(enclDoc).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      if (err.status === 409) {
        this._ps.publish(respId);
      } else {
        this._ps.publish(respId, {error: err});
      }
    });
  }

  addOrUpdateEnclosureBinary(topic, data) {
    let respId = `system.addOrUpdateEnclosureBinary.response.${topic.split('.')[3]}`;

    this._pouch.get(`enclosures/${data.channelId}/${data.itemId}`).then(enclDoc => {
      return this._pouch.putAttachment(enclDoc._id, 'enclosure', enclDoc._rev, data.enclosure, 'audio/mpeg');
    }).then(encl => {
      this._ps.publish(respId, {enclosure: encl});
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }

  removeEnclosureDocAndBinary(topic, data) {
    let respId = `system.removeEnclosureDocAndBinary.response.${topic.split('.')[3]}`;

    this._pouch.remove(data.enclosureDoc).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }
}
