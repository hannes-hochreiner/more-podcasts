import React, { Component } from 'react';
import './App.css';
import AuthenticationDialog from './AuthenticationDialog';
import NotificationView from './NotificationView';

import { ThemeProvider } from '@material-ui/styles';
import lightGreen from '@material-ui/core/colors/lightGreen';
import deepOrange from '@material-ui/core/colors/deepOrange';

const theme = {
  palette: {
    primary1Color: lightGreen['800'],
    accent1Color: deepOrange['A400'],
  }
};

export default class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <div>
          <AuthenticationDialog/>
          {this.props.children}
          <NotificationView/>
        </div>
      </ThemeProvider>
    );
  }
}
