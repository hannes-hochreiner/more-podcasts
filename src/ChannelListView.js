import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import ChannelListPresenter from './ChannelListPresenter';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';
import Dialog from '@material-ui/core/Dialog';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';

export default class ChannelListView extends Component {
  state = {
    selectedChannels: [],
    allChannels: [],
    newChannelUrl: '',
    showAddChannelDialog: false
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

    this.setState({
      showAddChannelDialog: false,
      newChannelUrl: ''
    });
  }

  _handleChannelSelectChange(event, isChecked) {
    this._pres.updateChannelSelection(event.target.value, isChecked);
  }

  _handleListItemClick(id) {
    this._pres.showChannel(id);
  }

  render() {
    const menuNav = <div>
      <IconButton><MenuIcon color={'#FFF'}/></IconButton>
      <Menu
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
      >
        <MenuItem primaryText="player" onClick={() => {this._pres.goToPlayerPage();}}/>
        <MenuItem primaryText="info" onClick={() => {this._pres.goToInfoPage();}}/>
      </Menu>
    </div>;

    const menuActions = <div>
      <IconButton><MoreIcon color={'#FFF'}/></IconButton>
      <Menu
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="add channel" onClick={() => {
          this.setState({
            newChannelUrl: '',
            showAddChannelDialog: true
          });
        }}/>
      </Menu>
    </div>;

    const addChannelDialogAction = [
      <Button
        label="Cancel"
        primary={true}
        onClick={() => {
          this.setState({showAddChannelDialog: false});
        }}
      />,
      <Button
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this._addNewChannel.bind(this)}
      />,
    ];

    return (
      <div>
        <AppBar title="channels" iconElementLeft={menuNav} iconElementRight={menuActions}/>
        <Dialog
          actions={addChannelDialogAction}
          modal={false}
          open={this.state.showAddChannelDialog}
          onRequestClose={() => {
            this.setState({showAddChannelDialog: false});
          }}
        >
          <TextField
            value={this.state.newChannelUrl}
            floatingLabelText="new channel URL"
            onChange={this._handleNewChannelUrl.bind(this)}
          />
        </Dialog>
        <Tabs>
          <Tab label="selected">
            <List>
              {this.state.selectedChannels.map(channel => {
                let av = '';

                if (channel.image) {
                  av = <ListItemAvatar>
                    <Avatar alt={channel.image.title} src={channel.image.url} />
                  </ListItemAvatar>;
                }

                return <ListItem
                  key={channel.id}
                  value={channel.id}
                  onClick={this._handleListItemClick.bind(this, channel.id)}
                >
                  {av}  
                  <ListItemText
                    primaryText={channel.title}
                    secondaryText={channel.description}
                  />
                </ListItem>;
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
