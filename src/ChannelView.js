import React, { Component } from 'react';
import ChannelPresenter from './ChannelPresenter';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import BackIcon from '@material-ui/icons/ArrowBack';
import ItemList from './ItemList';

export default class ChannelView extends Component {
  state = {
    items: [],
    enclosureDocs: [],
    binExists: []
  };

  set binExists(value) {
    this.setState({
      binExists: value
    });
  }

  set items(value) {
    this.setState({
      items: value
    });
  }

  set enclosureDocs(value) {
    this.setState({
      enclosureDocs: value
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

  _play(channelId, itemId) {
    this._pres.play(channelId, itemId);
  }

  _refreshDownload(channelId, itemId) {
    this._pres.refreshDownload(channelId, itemId);
  }

  _requestDownload(channelId, itemId) {
    this._pres.requestDownload(channelId, itemId);
  }

  _removeDownload(channelId, itemId) {
    this._pres.removeDownload(channelId, itemId);
  }

  _toggleNew(channelId, itemId) {
    this._pres.toggleTriaged(channelId, itemId);
  }

  render() {
    const backNavigation = (
      <IconButton touch={true} onClick={() => {this._pres.goToChannelListPage();}}>
        <BackIcon/>
      </IconButton>
    );

    return (
      <div>
        <AppBar title="channel" iconElementLeft={backNavigation}/>
        <ItemList
          items={this.state.items}
          enclosureDocs={this.state.enclosureDocs}
          binExists={this.state.binExists}
          onToggleNew={this._toggleNew.bind(this)}
          onPlay={this._play.bind(this)}
          onRefreshDownloads={this._refreshDownload.bind(this)}
          onRemoveDownload={this._removeDownload.bind(this)}
          onRequestDownload={this._requestDownload.bind(this)}
        />
      </div>
    );
  }
}
