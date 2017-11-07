import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import ChannelListView from './ChannelListView';
import ChannelView from './ChannelView';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import {default as pouchdb} from 'pouchdb';
import PubSub from 'pubsub-js';
import uuid from 'uuid';

import AuthenticationService from './AuthenticationService';
import ConsoleLogger from './ConsoleLogger';
import ChannelService from './ChannelService';
import ChannelRepository from './ChannelRepository';
import ChannelSyncService from './ChannelSyncService';
import NavigationService from './NavigationService';
import EnclosureRepository from './EnclosureRepository';
import UpdateDaemon from './UpdateDaemon';
import PlayerView from './PlayerView';
import PlayerService from './PlayerService';
import ps from './PubSub';
import np from './NotificationPresenter';
import ip from './InfoPresenter';
import InfoView from './InfoView';

let pouchChannels = new pouchdb('more-podcasts_channelRepository');
let pouchEnclosures = new pouchdb('more-podcasts_enclosureRepository');

ps.ps = PubSub;
ps.uuid = uuid;

np.ps = ps;
ip.ps = ps;

new ChannelRepository(pouchChannels, PubSub);
new EnclosureRepository(pouchEnclosures, PubSub);
new AuthenticationService();
new ConsoleLogger();
new ChannelService();
new ChannelSyncService();
new NavigationService();
new UpdateDaemon(ps);
new PlayerService(ps);

injectTapEventPlugin();

ReactDOM.render(
  <Router>
    <App>
      <Switch>
        <Route exact path="/" component={PlayerView}/>
        <Route exact path="/channels" component={ChannelListView}/>
        <Route exact path="/channels/:channelId" component={ChannelView}/>
        <Route exact path="/player" component={PlayerView}/>
        <Route exact path="/info" component={InfoView}/>
      </Switch>
    </App>
  </Router>, document.getElementById('root'));
registerServiceWorker();
