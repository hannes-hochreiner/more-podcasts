import { HashRouter as Router } from 'react-router-dom';
import PubSub from 'pubsub-js';

export default class NavigationService {
  constructor() {
    PubSub.subscribe('system.goToPlayerPage.request', this.goToPlayerPage.bind(this));
    PubSub.subscribe('system.goToChannelListPage.request', this.goToChannelListPage.bind(this));
    PubSub.subscribe('system.goToChannelPage.request', this.goToChannelPage.bind(this));
  }

  goToChannelPage(topic, data) {
    (new Router()).history.push(`/channels/${data.id}`);
  }

  goToChannelListPage(topic, data) {
    (new Router()).history.push(`/channels`);
  }

  goToPlayerPage(topic, data) {
    (new Router()).history.push(`/player`);
  }
}
