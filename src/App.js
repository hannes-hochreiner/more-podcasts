import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import AuthenticationDialog from './AuthenticationDialog';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {lightGreen800, deepOrangeA400} from 'material-ui/styles/colors';

import PubSub from 'pubsub-js';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: lightGreen800,
    accent1Color: deepOrangeA400,
  }
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <button onClick={this._getApiChannels}>get api channels</button>
          <button onClick={this._postNewApiChannel}>post new api channel</button>
          <button onClick={this._logout}>logout</button>
          <AuthenticationDialog/>
          {this.props.children}
        </div>
      </MuiThemeProvider>
    );
  }

  _logout() {
    PubSub.publish('system.logout.request.1');
  }

  _getApiChannels() {
    PubSub.publish('system.getApiChannels.request.1');
  }

  _postNewApiChannel() {
    PubSub.publish('system.postNewApiChannel.request.1', {url: 'http://sixgun.org/feed/gnr'});
  }
}

export default App;
