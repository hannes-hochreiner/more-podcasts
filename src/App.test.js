import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import np from './NotificationPresenter';
import ps from './PubSub';
import uuid from 'uuid';
import PubSub from 'pubsub-js';

ps.ps = PubSub;
ps.uuid = uuid;

np.ps = ps;

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
