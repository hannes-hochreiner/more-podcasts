import PubSub from 'pubsub-js';

export default class AuthenticationPresenter {
  constructor(authenticationView) {
    this._av = authenticationView;
    this._cancelToken = PubSub.subscribe('ui.getCredentials.request', this._authRequest.bind(this));
  }

  finalize() {
    PubSub.unsubscribe(this._cancelToken);
    delete this._cancelToken;
    delete this._av;
  }

  _authRequest(topic, data) {
    this._currentRequest = { topic: topic, data: data};
    this._av.open = true;
  }

  credentialsObtained() {
    this._av.open = false;
    PubSub.publish(`ui.getCredentials.response.${this._currentRequest.topic.split('.')[3]}`, {
      username: this._av.username,
      password: this._av.password
    });
    delete this._currentRequest;
  }
}
