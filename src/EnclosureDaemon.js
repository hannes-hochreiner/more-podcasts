import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';

export default class EnclosureDaemon {
  constructor() {
    this.currentlyRunning = false;
    setInterval(this.tick.bind(this), 60 * 1000);
  }

  tick() {
    if (this.currentlyRunning) {
      return;
    }

    let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionTypeCheck = connection.type && !(connection.type === 'ethernet' || connection.type === 'wifi');
    let connectionSaveDataCheck = connection.saveData;
    
    if (connection && (connectionTypeCheck || connectionSaveDataCheck) {
      return;
    }

    this.currentlyRunning = true;

    pps('system.getAllEnclosureDocs').then(res => {
      let docs = res.enclosureDocs.filter(encDoc => {
        return !encDoc._attachments;
      });

      if (docs.length === 0) {
        return;
      }

      return pps('system.getApiItemBlobByChannelIdId', {
        channelId: docs[0].channelId,
        id: docs[0].itemId
      }).then(res => {
        return pps('system.addOrUpdateEnclosureBinary', {
          channelId: docs[0].channelId,
          itemId: docs[0].itemId,
          enclosure: res.blob
        });
      });
    }).then(() => {
      this.currentlyRunning = false;
    }).catch(err => {
      this.currentlyRunning = false;
    });
  }
}
