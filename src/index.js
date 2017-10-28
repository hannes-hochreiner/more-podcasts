import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

injectTapEventPlugin();

ReactDOM.render(
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={App}/>
      </Switch>
    </div>
  </Router>, document.getElementById('root'));
registerServiceWorker();
