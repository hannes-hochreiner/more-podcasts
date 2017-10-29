import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import AuthenticationPresenter from './AuthenticationPresenter';

export default class AuthenticationDialog extends React.Component {
  state = {
    open: false,
    user: '',
    pass: ''
  };

  set open(value) {
    this.setState({open: value});
  }

  get username() {
    return this.state.user;
  }

  get password() {
    return this.state.pass;
  }

  handleClose = () => {
    this._pres.credentialsObtained();
  };

  handleChange(prop, event) {
    let newState = {};

    newState[prop] = event.target.value;

    this.setState(newState);
  }

  componentDidMount() {
    this._pres = new AuthenticationPresenter(this);
  }

  componentWillUnmount() {
    this._pres.finalize();
  }

  render() {
    const actions = [
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleClose}
      />,
    ];

    return (
      <div>
        <Dialog
          actions={actions}
          modal={true}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
          <TextField
            id='usernameField'
            hintText="username"
            floatingLabelText="username"
            fullWidth={true}
            value={this.state.user}
            onChange={this.handleChange.bind(this, 'user')}
          /><br/>
          <TextField
            id='passwordField'
            hintText="password"
            floatingLabelText="password"
            type="password"
            fullWidth={true}
            value={this.state.pass}
            onChange={this.handleChange.bind(this, 'pass')}
          />
        </Dialog>
      </div>
    );
  }
}
