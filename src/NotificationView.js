import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import NotificationPresenter from './NotificationPresenter';

export default class NotificationView extends Component {
  state = {
    message: '',
    show: false
  };

  componentDidMount() {
    this._pres = new NotificationPresenter(this);
  }

  componentWillUnmount() {
    this._pres.finalize();
  }

  set show(value) {
    this.setState({show: value});
  }

  set message(value) {
    this.setState({message: value});
  }

  render() {
    return (
      <Snackbar
        open={this.state.show}
        message={this.state.message}
      />
    );
  }
}
