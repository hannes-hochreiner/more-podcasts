import { HashRouter as Router } from 'react-router-dom';

export default class NavigationService {
  goToChannelPage() {
    (new Router()).history.push(`/channels`);
  }
}
