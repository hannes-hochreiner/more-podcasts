import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import ChannelPresenter from './ChannelPresenter';
import {Tabs, Tab} from 'material-ui/Tabs';
import Chip from 'material-ui/Chip';
import New from 'material-ui/svg-icons/av/new-releases';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';

export default class ChannelView extends Component {
  state = {
    items: []
  };

  set items(value) {
    this.setState({
      items: value
    });
  }

  get channelId() {
    return this.props.match.params.channelId;
  }

  componentDidMount() {
    this._pres = new ChannelPresenter(this);
  }

  componentWillUnmount() {
    this._pres.finalize();
  }

  _requestDownload(channelId, itemId) {
    this._pres.requestDownload(channelId, itemId);
  }

  _handleListItemClick(id) {
    this._pres.showItem(id);
  }

  render() {
    const iconButtonElement = (
      <IconButton touch={true}>
        <MoreVertIcon/>
      </IconButton>
    );

    const backNavigation = (
      <IconButton touch={true} onClick={() => {this._pres.goToChannelListPage();}}>
        <BackIcon/>
      </IconButton>
    );

    return (
      <div>
        <AppBar title="channel" showMenuIconButton="false" iconElementLeft={backNavigation}/>
        <List>
          {this.state.items.map(item => {
            const rightIconMenu = (
              <IconMenu iconButtonElement={iconButtonElement}>
                <MenuItem onClick={this._requestDownload.bind(this, item.channelId, item.id)}>download</MenuItem>
                <MenuItem>toggle new</MenuItem>
                <MenuItem>play</MenuItem>
              </IconMenu>
            );

            return <ListItem
              key={item.id}
              rightIconButton={rightIconMenu}
              leftIcon={<New/>}
              primaryText={item.title}
              onClick={this._handleListItemClick.bind(this, item.id)}
            />;
          })}
        </List>
      </div>
    );
  }
}
