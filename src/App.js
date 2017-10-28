import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import AuthenticationDialog from './AuthenticationDialog';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {lightGreen800, deepOrangeA400} from 'material-ui/styles/colors';

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
          <button onClick={this._signIn}>sign in</button>
          <AuthenticationDialog/>
          {this.props.children}
        </div>
      </MuiThemeProvider>
    );
  }

  _signIn() {
    var authenticationData = {
        Username : '',
        Password : '',
    };
    var authenticationDetails = new AuthenticationDetails(authenticationData);
    var poolData = {
        UserPoolId : 'eu-central-1_jUeKzeHCz', // Your user pool id here
        ClientId : '2l07nc0987v932rhiaqrl2c294' // Your client id here
    };
    var userPool = new CognitoUserPool(poolData);
    var userData = {
        Username : '',
        Pool : userPool
    };
    var cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            // User authentication was successful
            console.dir(result);
            console.dir(cognitoUser);
        },
        onFailure: function(err) {
            // User authentication was not successful
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
            // User was signed up by an admin and must provide new
            // password and required attributes, if any, to complete
            // authentication.
            console.dir(userAttributes);
            // the api doesn't accept this field back
            delete userAttributes.email_verified;

            // Get these details and call
            cognitoUser.completeNewPasswordChallenge('', userAttributes, this);
        }
    });
  }
}

export default App;
