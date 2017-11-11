import React, { Component } from 'react';
import InfoPresenter from './InfoPresenter';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import {List, ListItem} from 'material-ui/List';
import NetworkAccess from 'material-ui/svg-icons/device/network-wifi';
import NetworkLocked from 'material-ui/svg-icons/notification/network-locked';

export default class PlayerView extends Component {
  state = {
    networkAccess: false,
    networkType: '',
    networkSaveData: '',
    storageInfo: '',
    fileSystemSize: ''
  };

  set fileSystemSize(value) {
    this.setState({fileSystemSize: value});
  }

  set storageInfo(value) {
    this.setState({storageInfo: value});
  }

  set networkType(value) {
    this.setState({networkType: value});
  }

  set networkSaveData(value) {
    this.setState({networkSaveData: value});
  }

  set networkAccess(value) {
    this.setState({networkAccess: value});
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

    let networkIcon = this.state.networkAccess ? (<NetworkAccess/>) : (<NetworkLocked/>);
    let networkType = `Type: ${this.state.networkType}`;
    let networkSaveData = `Save data: ${this.state.networkSaveData}`;
    let networkPolicy = `Network access policy: ${this.state.networkAccess ? 'access' : 'do not access'}`;

    return (
      <div>
        <AppBar title="info" iconElementLeft={menu}/>
        <p>{this.state.info}</p>
        <List>
          <ListItem primaryText="Network access policy" leftIcon={networkIcon}
            nestedItems={[
              <ListItem key={1} primaryText={networkType}/>,
              <ListItem key={2} primaryText={networkSaveData}/>,
              <ListItem key={3} primaryText={networkPolicy}/>
            ]}
          />
          <ListItem primaryText={this.state.storageInfo}/>
          <ListItem primaryText={this.state.fileSystemSize}/>
        </List>
        <button onClick={this._handleLogout.bind(this)}>logout</button>
      </div>
    );
  }
}
