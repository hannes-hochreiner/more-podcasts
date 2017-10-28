import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class AuthenticationDialog extends React.Component {
  state = {
    open: true,
  };

  handleClose = () => {
    this.setState({open: false});
  };

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
          title="Authentication"
          actions={actions}
          modal={true}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
          <TextField
            hintText="username"
            floatingLabelText="username"
            fullWidth={true}
          /><br/>
          <TextField
            hintText="password"
            floatingLabelText="password"
            type="password"
            fullWidth={true}
          />
        </Dialog>
      </div>
    );
  }
}
