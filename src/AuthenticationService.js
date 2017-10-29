import PubSub from 'pubsub-js';
import {promisedPubSub as pps} from './utils';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

export default class AuthenticationService {
  constructor() {
    this._userPoolId = 'eu-central-1_jUeKzeHCz';
    this._clientId = '2l07nc0987v932rhiaqrl2c294';
    PubSub.subscribe('system.getIdToken.request', this._getIdToken.bind(this));
    PubSub.subscribe('system.logout.request', this._logout.bind(this));
  }

  _logout(topic, data) {
    let userPool = new CognitoUserPool({
      UserPoolId : this._userPoolId,
      ClientId : this._clientId
    });

    if (userPool.getCurrentUser()) {
      userPool.getCurrentUser().signOut();
    }

    PubSub.publish(`system.logout.response.${topic.split('.')[3]}`);
  }

  _getCurrentIdToken() {
    return new Promise((resolve, reject) => {
      let userPool = new CognitoUserPool({
        UserPoolId : this._userPoolId,
        ClientId : this._clientId
      });

      userPool.getCurrentUser().getSession((error, session) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(session.getIdToken().jwtToken);
      });
    });
  }

  _authenticate() {
    pps('ui.getCredentials').then(creds => {
      return new Promise((resolve, reject) => {
        let authenticationDetails = new AuthenticationDetails({
            Username : creds.username,
            Password : creds.password,
        });
        let userPool = new CognitoUserPool({
          UserPoolId : this._userPoolId,
          ClientId : this._clientId
        });
        let userData = {
            Username : creds.username,
            Pool : userPool
        };
        let cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                // User authentication was successful
                resolve(result.getIdToken().jwtToken);
            },
            onFailure: function(err) {
                // User authentication was not successful
                reject(err);
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
      });
    });
  }

  _getIdToken(topic, data) {
    this._currentRequest = {topic: topic, data: data};

    this._getCurrentIdToken().catch(err => {
      return this._authenticate();
    }).then(idToken => {
      PubSub.publish(`system.getIdToken.response.${this._currentRequest.topic.split('.')[3]}`, {
        idToken: idToken
      });
    });
  }
}
