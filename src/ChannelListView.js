import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import ChannelListPresenter from './ChannelListPresenter';
import {Tabs, Tab} from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';

export default class ChannelListView extends Component {
  state = {
    selectedChannels: [],
    allChannels: [],
    newChannelUrl: ''
  };

  set newChannelUrl(value) {
    this.setState({
      newChannelUrl: value
    });
  }

  set selectedChannels(value) {
    this.setState({
      selectedChannels: value
    });
  }

  set allChannels(value) {
    this.setState({
      allChannels: value
    });
  }

  componentDidMount() {
    this._pres = new ChannelListPresenter(this);
  }

  componentWillUnmount() {
    this._pres.finalize();
  }

  _handleNewChannelUrl(event) {
    this.setState({
      newChannelUrl: event.target.value
    });
  }

  _addNewChannel() {
    if (this.state.newChannelUrl) {
      this._pres.addNewChannel(this.state.newChannelUrl);
    }
  }

  _syncChannels() {
    this._pres.syncChannels();
  }

  _handleChannelSelectChange(event, isChecked) {
    this._pres.updateChannelSelection(event.target.value, isChecked);
  }

  _handleListItemClick(id) {
    this._pres.showChannel(id);
  }

  render() {
    const menu = <IconMenu
      iconButtonElement={<IconButton><MenuIcon color={'#FFF'}/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'left', vertical: 'top'}}
    >
      <MenuItem primaryText="player" onClick={() => {this._pres.goToPlayerPage();}}/>
    </IconMenu>;

    return (
      <div>
        <AppBar title="channels" showMenuIconButton={false} iconElementLeft={menu}/>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <TextField
              value={this.state.newChannelUrl}
              floatingLabelText="New channel URL"
              onChange={this._handleNewChannelUrl.bind(this)}
            />
            <RaisedButton
              label="Add"
              primary={true}
              onClick={this._addNewChannel.bind(this)}
            />
            <RaisedButton
              label="Sync"
              primary={true}
              onClick={this._syncChannels.bind(this)}
            />
          </ToolbarGroup>
        </Toolbar>
        <Tabs>
          <Tab label="selected">
            <List>
              {this.state.selectedChannels.map(channel => {
                return <ListItem
                  key={channel.id}
                  value={channel.id}
                  primaryText={channel.title}
                  secondaryText={channel.description}
                  onClick={this._handleListItemClick.bind(this, channel.id)}
                />;
              })}
            </List>
          </Tab>
          <Tab label="all">
            <List>
              {this.state.allChannels.map(channel => {
                return <ListItem
                  leftCheckbox={<Checkbox
                    checked={channel.selected}
                    onCheck={this._handleChannelSelectChange.bind(this)}
                    value={channel.id}
                  />}
                  key={channel.id}
                  primaryText={channel.title}
                  secondaryText={channel.description}
                />;
              })}
            </List>
          </Tab>
        </Tabs>
      </div>
    );
  }
}
