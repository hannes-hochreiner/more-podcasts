import PubSub from 'pubsub-js';

export default class ConsoleLogger {
  constructor() {
    PubSub.subscribe('ui', this._logMessage.bind(this));
    PubSub.subscribe('system', this._logMessage.bind(this));
    PubSub.subscribe('event', this._logMessage.bind(this));
  }

  _logMessage(topic, data) {
    console.log({topic: topic, data: data});
  }
}
