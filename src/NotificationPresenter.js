export default class NotificationPresenter {
  constructor(view) {
    this._view = view;
    this._notifications = [];
    this._regToken = NotificationPresenter.ps.sub('user.notification.showError', this.showError.bind(this));
    this.showNextMessage();
  }

  showError(topic, data) {
    let message = 'an error occured';

    if (data && data.error && data.error.message) {
      message = data.error.message;
    }

    this._notifications.push(message);
    this.showNextMessage();
  }

  showNextMessage() {
    if (!this._view) {
      return;
    }

    if (this._showingMessage) {
      return;
    }

    if (this._notifications.length === 0) {
      return;
    }

    this._showingMessage = true;
    this._view.message = this._notifications.shift();
    this._view.show = true;

    setTimeout(this.timeoutCallback.bind(this), 2000);
  }

  timeoutCallback() {
    this._view.show = false;
    this._showingMessage = false;
    this.showNextMessage();
  }

  finalize() {
    let token = this._regToken;
    delete this._regToken;

    if (token) {
      NotificationPresenter.ps.unsub(token);
    }
  }
}
