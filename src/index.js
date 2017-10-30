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

import AuthenticationService from './AuthenticationService';
import ConsoleLogger from './ConsoleLogger';
import ChannelService from './ChannelService';
import ChannelRepository from './ChannelRepository';
import ChannelSyncService from './ChannelSyncService';
import NavigationService from './NavigationService';

let pouch = new pouchdb('more-podcasts_channelRepository');
new ChannelRepository(pouch, PubSub);
new AuthenticationService();
new ConsoleLogger();
new ChannelService();
new ChannelSyncService();
new NavigationService();

injectTapEventPlugin();

ReactDOM.render(
  <Router>
    <App>
      <Switch>
        <Route exact path="/" component={ChannelListView}/>
        <Route exact path="/channels/:channelId" component={ChannelView}/>
      </Switch>
    </App>
  </Router>, document.getElementById('root'));
registerServiceWorker();
