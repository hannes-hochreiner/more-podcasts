import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import ChannelPresenter from './ChannelPresenter';
import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import NewIcon from 'material-ui/svg-icons/av/new-releases';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';

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

  _getItemStatusString(item) {
    let str = '';

    if (item.currentTime) {
      str += 'partially played; ';
    }

    if (item.playCount) {
      str += `${item.playCount} times played; `;
    }

    return str;
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
        <AppBar title="channel" iconElementLeft={backNavigation}/>
        <List>
          {this.state.items.map(item => {
            let menuEntries = [{label: 'toggle new', onClick: this._toggleNew.bind(this, item.channelId, item.id)}];

            const chipStyle = {margin: 4};

            let patiallyPlayedChip;

            if (item.currentTime) {
              patiallyPlayedChip = (
                <Chip style={chipStyle}>partially played</Chip>
              );
            }

            let playCountChip;

            if (item.playCount) {
              playCountChip = (
                <Chip style={chipStyle}><Avatar>{item.playCount}</Avatar>times played</Chip>
              );
            }

            let downloadChip;

            if (this.state.enclosureDocs) {
              let enclosureDoc = this.state.enclosureDocs.find(encDoc => {
                return encDoc.itemId === item.id && encDoc.channelId === item.channelId;
              });

              if (enclosureDoc) {
                let downloadStatus = 'requested';
                let binExistsEntry = this.state.binExists.find(be => {
                  return be.channelId === enclosureDoc.channelId && be.itemId === enclosureDoc.itemId;
                });
                let binExists = typeof binExistsEntry !== 'undefined' && binExistsEntry.enclosureBinaryExists;

                if (enclosureDoc.failed) {
                  downloadStatus = 'failed';
                  menuEntries.push({label: 'refresh download', onClick: this._refreshDownload.bind(this, item.channelId, item.id)});
                } else if (binExists) {
                  downloadStatus = 'available';
                  menuEntries.push({label: 'refresh download', onClick: this._refreshDownload.bind(this, item.channelId, item.id)});
                  menuEntries.push({label: 'play', onClick: this._play.bind(this, item.channelId, item.id)});
                }

                menuEntries.push({label: 'remove download', onClick: this._removeDownload.bind(this, item.channelId, item.id)});

                downloadChip = (
                  <Chip style={chipStyle}>download {downloadStatus}</Chip>
                );
              } else {
                menuEntries.push({label: 'request download', onClick: this._requestDownload.bind(this, item.channelId, item.id)});
              }
            }

            let newChip;

            if (!item.triaged) {
              newChip = (
                <Chip style={chipStyle}><Avatar><NewIcon/></Avatar>new</Chip>
              );
            }

            const rightIconMenu = (
              <IconMenu iconButtonElement={iconButtonElement}>
                {menuEntries.map(ent => {
                  return (<MenuItem key={ent.label} onClick={ent.onClick}>{ent.label}</MenuItem>);
                })}
              </IconMenu>
            );

            return <ListItem
              key={item.id}
              rightIconButton={rightIconMenu}
              primaryText={<div>{item.title}<div style={{display: 'flex', flexWrap: 'wrap',}}>{newChip}{patiallyPlayedChip}{playCountChip}{downloadChip}</div></div>}
            />;
          })}
        </List>
      </div>
    );
  }
}
