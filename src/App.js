import React, { Component } from 'react';
import './App.css';
import AuthenticationDialog from './AuthenticationDialog';
import NotificationView from './NotificationView';

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

export default class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AuthenticationDialog/>
          {this.props.children}
          <NotificationView/>
        </div>
      </MuiThemeProvider>
    );
  }
}
