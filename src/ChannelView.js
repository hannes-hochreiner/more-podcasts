import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import ChannelPresenter from './ChannelPresenter';
import {Tabs, Tab} from 'material-ui/Tabs';

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
    return (
      <div>
        <List>
          {this.state.items.map(item => {
            return <ListItem
              key={item.id}
              primaryText={item.title}
            />;
          })}
        </List>
      </div>
    );
  }
}
