import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import PlayerPresenter from './PlayerPresenter';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import Slider from 'material-ui/Slider';

export default class PlayerView extends Component {
  state = {
    items: [],
    selectedItem: null,
    playing: false,
    volume: 0.5,
    speed: 1.0
  };

  componentDidMount() {
    this._pres = new PlayerPresenter(this);
  }

  componentWillUnmount() {
    this._pres.finalize();
  }

  set items(value) {
    this.setState({
      items: value
    });
  }

  set selectedItem(value) {
    this.setState({
      selectedItem: value
    });
  }

  set playing(value) {
    this.setState({
      playing: value
    });
  }

  set volume(value) {
    this.setState({
      volume: value
    });
  }

  set speed(value) {
    this.setState({
      speed: value
    });
  }

  _handleListItemClick(item) {
    this._pres.selectedItemChanged(item);
  }

  _handleVolumeChange(event, value) {
    this._pres.volumeChanged(value);
  }

  _handleSpeedChange(event, value) {
    this._pres.speedChanged(value);
  }

  render() {
    const menu = <IconMenu
      iconButtonElement={<IconButton><MenuIcon color={'#FFF'}/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'left', vertical: 'top'}}
    >
      <MenuItem primaryText="channels" onClick={() => {this._pres.goToChannelListPage();}}/>
    </IconMenu>;

    return (
      <div>
        <AppBar title="player" iconElementLeft={menu}/>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <RaisedButton label="play" primary={true}
              disabled={!this.state.selectedItem || this.state.playing}
              onClick={() => {this._pres.start()}}
            />
            <RaisedButton label="stop" primary={true}
              disabled={!this.state.selectedItem || !this.state.playing}
              onClick={() => {this._pres.stop()}}
            />
            {this.state.selectedItem ? this.state.selectedItem.title : ''}
          </ToolbarGroup>
        </Toolbar>
        <Slider min={0} max={1} step={0.01} value={this.state.volume} onChange={this._handleVolumeChange.bind(this)}/>
        <Slider min={0.5} max={2} step={0.05} value={this.state.speed} onChange={this._handleSpeedChange.bind(this)}/>
        <List>
          {this.state.items.map(item => {
            return <ListItem
              key={item.id}
              primaryText={item.title}
              onClick={this._handleListItemClick.bind(this, item)}
            />;
          })}
        </List>
      </div>
    );
  }
}
