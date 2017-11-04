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
import SpeedHighIcon from 'material-ui/svg-icons/av/fast-forward';
import SpeedLowIcon from 'material-ui/svg-icons/av/play-arrow';
import VolumeHighIcon from 'material-ui/svg-icons/av/volume-up';
import VolumeLowIcon from 'material-ui/svg-icons/av/volume-down';
import Slider from 'material-ui/Slider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import './PlayerView.css';

export default class PlayerView extends Component {
  state = {
    items: [],
    selectedItem: null,
    playing: false,
    volume: 0.5,
    speed: 1.0,
    currentTime: 0,
    duration: 0
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

  get currentTime() {
    return this.state.currentTime;
  }

  set currentTime(value) {
    this.setState({ currentTime: value });
  }

  set duration(value) {
    this.setState({ duration: value });
  }

  _handleListItemClick(item) {
    this._pres.selectedItemChanged(item);
  }

  _handleVolumeChange(event, value) {
    this.setState({ volume: value });
    this._pres.volumeChanged(value);
  }

  _handleSpeedChange(event, value) {
    this.setState({ speed: value });
    this._pres.speedChanged(value);
  }

  _handleCurrentTimeChange(event, value) {
    this.setState({ currentTime: value });
    this._pres.currentTimeChanged(value);
  }

  _handleEnclosureRefresh(item, event) {
    this._pres.refreshEnclosure(item);
  }

  _handleEnclosureDelete(item, event) {
    this._pres.deleteEnclosure(item);
  }

  _formatTime(value) {
    let sec = `${Math.round(value % 60)}`;
    let min = `${Math.floor(value / 60)}`;

    if (sec.length == 1) {
      sec = '0' + sec;
    }

    if (min.length == 1) {
      min = '0' + min;
    }

    return `${min}:${sec}`;
  }

  render() {
    const menu = <IconMenu
      iconButtonElement={<IconButton><MenuIcon color={'#FFF'}/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'left', vertical: 'top'}}
    >
      <MenuItem primaryText="channels" onClick={() => {this._pres.goToChannelListPage();}}/>
      <MenuItem primaryText="info" onClick={() => {this._pres.goToInfoPage();}}/>
    </IconMenu>;

    let itemMenu = (item) => {
      return (<IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="refresh" onClick={this._handleEnclosureRefresh.bind(this, item)}/>
        <MenuItem primaryText="delete" onClick={this._handleEnclosureDelete.bind(this, item)} />
      </IconMenu>);
    }

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
        <div className="sliderGroup">
          <table>
            <tbody>
              <tr>
                <td>{this._formatTime(this.state.currentTime)}</td>
                <td className="sliderColumn"><Slider min={0} max={this.state.duration} step={1} value={this.state.currentTime} onChange={this._handleCurrentTimeChange.bind(this)}/></td>
                <td>{this._formatTime(this.state.duration)}</td>
              </tr>
              <tr>
                <td><VolumeLowIcon/></td>
                <td className="sliderColumn"><Slider min={0} max={1} step={0.01} value={this.state.volume} onChange={this._handleVolumeChange.bind(this)}/></td>
                <td><VolumeHighIcon/></td>
              </tr>
              <tr>
                <td><SpeedLowIcon/></td>
                <td className="sliderColumn"><Slider min={0.5} max={2} step={0.05} value={this.state.speed} onChange={this._handleSpeedChange.bind(this)}/></td>
                <td><SpeedHighIcon/></td>
              </tr>
            </tbody>
          </table>
        </div>
        <List>
          {this.state.items.map(item => {
            return <ListItem
              key={item.id}
              primaryText={item.title}
              onClick={this._handleListItemClick.bind(this, item)}
              rightIconButton={itemMenu(item)}
            />;
          })}
        </List>
      </div>
    );
  }
}
