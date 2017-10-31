import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import PlayerPresenter from './PlayerPresenter';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';

export default class PlayerView extends Component {
  state = {
    items: [],
    selectedItem: null,
    playing: false
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

  _handleListItemClick(item) {
    this._pres.selectedItemChanged(item);
  }

  render() {
    return (
      <div>
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
