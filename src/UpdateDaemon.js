export default class UpdateDaemon {
  constructor(ps, nt) {
    this.ps = ps;
    this.nt = nt;
    this.currentlyRunning = false;
    setInterval(this.tick.bind(this), 30 * 1000);
  }

  tick() {
    if (this.currentlyRunning) {
      return;
    }

    if (!this.nt.shouldAccessNetwork) {
      return;
    }

    this.currentlyRunning = true;

    this.ps.prom('system.getAllEnclosureDocs').then(resEncDocs => {
      let docs = resEncDocs.enclosureDocs.filter(encDoc => {
        return !encDoc.failed;
      });

      return Promise.all(docs.map(doc => {
        return this.ps.prom('system.checkEnclosureBinaryExistsByChannelItemId', doc);
      })).then(filter => {
        docs = docs.filter((doc, idx) => {
          return !filter[idx].enclosureBinaryExists;
        });

        if (docs.length === 0) {
          return;
        }

        return this.ps.prom('system.getApiItemBlobByChannelIdId', {
          channelId: docs[0].channelId,
          id: docs[0].itemId
        }).then(res => {
          return this.ps.prom('system.addOrUpdateEnclosureBinary', {
            channelId: docs[0].channelId,
            itemId: docs[0].itemId,
            enclosure: res.blob
          });
        }).then(() => {
          return this.ps.prom('system.getEnclosureDocByChannelIdItemId', {
            channelId: docs[0].channelId,
            itemId: docs[0].itemId
          }).then(resDoc => {
            if (resDoc.enclosureDoc.failed) {
              delete resDoc.enclosureDoc.failed;
              return this.ps.prom('system.addOrUpdateEnclosureDoc', resDoc);
            }
          });
        }).catch(err => {
          return this.ps.prom('system.getEnclosureDocByChannelIdItemId', {
            channelId: docs[0].channelId,
            itemId: docs[0].itemId
          }).then(resDoc => {
            resDoc.enclosureDoc.failed = true;

            return this.ps.prom('system.addOrUpdateEnclosureDoc', resDoc);
          });
        });
      });
    }).then(() => {
      let oldLastSync = this.lastSync;
      this.lastSync = (new Date).toISOString().substr(0, 10);

      if (oldLastSync !== this.lastSync) {
        return this.ps.prom('system.syncChannels');
      }

      return Promise.resolve();
    }).then(() => {
      this.currentlyRunning = false;
    }).catch(err => {
      this.currentlyRunning = false;
    });
  }
}
