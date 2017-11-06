import React, { Component } from 'react';
import InfoPresenter from './InfoPresenter';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

export default class PlayerView extends Component {
  state = {
    info: ''
  };

  set info(value) {
    this.setState({info: value});
  }

  componentDidMount() {
    this._pres = new InfoPresenter(this);
  }

  componentWillUnmount() {
    this._pres.finalize();
    delete this._pres;
  }

  _handleLogout() {
    this._pres.logout();
  }

  render() {
    const menu = <IconMenu
      iconButtonElement={<IconButton><MenuIcon color={'#FFF'}/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'left', vertical: 'top'}}
    >
      <MenuItem primaryText="player" onClick={() => {this._pres.goToPlayerPage();}}/>
      <MenuItem primaryText="channels" onClick={() => {this._pres.goToChannelListPage();}}/>
    </IconMenu>;

    return (
      <div>
        <AppBar title="info" iconElementLeft={menu}/>
        <p>{this.state.info}</p>
        <button onClick={this._handleLogout.bind(this)}>logout</button>
      </div>
    );
  }
}
