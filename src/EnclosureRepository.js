export default class EnclosureRepository {
  constructor(pouch, pubSub, fss) {
    this._pouch = pouch;
    this._ps = pubSub;
    this._fss = fss;

    this._ps.subscribe('system.getAllEnclosureDocs.request', this.getAllEnclosureDocs.bind(this));
    this._ps.subscribe('system.getEnclosureDocsByChannelId.request', this.getEnclosureDocsByChannelId.bind(this));
    this._ps.subscribe('system.getEnclosureDocByChannelIdItemId.request', this.getEnclosureDocByChannelIdItemId.bind(this));
    this._ps.subscribe('system.removeEnclosureBinaryByChannelIdItemId.request', this.removeEnclosureBinaryByChannelIdItemId.bind(this));
    this._ps.subscribe('system.addOrUpdateEnclosureDoc.request', this.addOrUpdateEnclosureDoc.bind(this));
    this._ps.subscribe('system.addOrUpdateEnclosureBinary.request', this.addOrUpdateEnclosureBinary.bind(this));
    this._ps.subscribe('system.removeEnclosureDocAndBinaryByChannelItemId.request', this.removeEnclosureDocAndBinaryByChannelItemId.bind(this));
    this._ps.subscribe('system.checkEnclosureBinaryExistsByChannelItemId.request', this.checkEnclosureBinaryExistsByChannelItemId.bind(this));
  }

  checkEnclosureBinaryExistsByChannelItemId(topic, data) {
    let respId = `system.checkEnclosureBinaryExistsByChannelItemId.response.${topic.split('.')[3]}`;

    return this._fss.getFileSystem().then(res => {
      return res.root.getDirectory('enclosures');
    }).then(res => {
      return res.getDirectory(data.channelId);
    }).then(res => {
      return res.getFile(data.itemId);
    }).then(res => {
      this._ps.publish(respId, {
        channelId: data.channelId,
        itemId: data.itemId,
        enclosureBinaryExists: true
      });
    }).catch(err => {
      this._ps.publish(respId, {
        channelId: data.channelId,
        itemId: data.itemId,
        enclosureBinaryExists: false
      });
    });
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

  getEnclosureDocByChannelIdItemId(topic, data) {
    let respId = `system.getEnclosureDocByChannelIdItemId.response.${topic.split('.')[3]}`;

    this._pouch.get(`enclosures/${data.channelId}/${data.itemId}`).then(enclDoc => {
      this._ps.publish(respId, {enclosureDoc: enclDoc});
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

    this._fss.getFileSystem().then(res => {
      return res.root.createDirectory('enclosures');
    }).then(res => {
      return res.createDirectory(data.channelId);
    }).then(res => {
      return res.createFile(data.itemId);
    }).then(res => {
      return res.write(data.enclosure);
    }).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }

  _removeEnclosureBinaryByChannelIdItemId(channelId, itemId) {
    return this._fss.getFileSystem().then(res => {
      return res.root.getDirectory('enclosures');
    }).then(res => {
      return res.getDirectory(channelId);
    }).then(res => {
      return res.getFile(itemId);
    }).then(res => {
      return res.remove();
    });
  }

  removeEnclosureBinaryByChannelIdItemId(topic, data) {
    let respId = `system.removeEnclosureBinaryByChannelIdItemId.response.${topic.split('.')[3]}`;

    this._removeEnclosureBinaryByChannelIdItemId(data.channelId, data.itemId).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }

  removeEnclosureDocAndBinaryByChannelItemId(topic, data) {
    let respId = `system.removeEnclosureDocAndBinaryByChannelItemId.response.${topic.split('.')[3]}`;

    this._pouch.get(`enclosures/${data.channelId}/${data.itemId}`).then(enclDoc => {
      return this._pouch.remove(enclDoc);
    }).then(() => {
      return this._removeEnclosureBinaryByChannelIdItemId(data.channelId, data.itemId);
    }).then(() => {
      this._ps.publish(respId);
    }).catch(err => {
      this._ps.publish(respId, {error: err});
    });
  }
}
