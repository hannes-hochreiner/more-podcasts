import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import NewIcon from 'material-ui/svg-icons/av/new-releases';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';

export default class ItemList extends Component {
  state = {
    openItemId: null,
    itemTree: null
  };

  _onNestedListToggle(item) {
    this.setState({openItemId: item.props.id});
  }

  componentWillReceiveProps(nextProps) {
    let itemTree = nextProps.items.reduce((prev, item) => {
      let date = new Date(item.date);
      let month = `${date.getMonth()+1}`;

      if (month.length === 1) {
        month = `0${month}`;
      }

      let cat = `${date.getFullYear()}-${month}`;

      if (!prev[cat]) {
        prev[cat] = [];
      }

      prev[cat].push(item);

      return prev;
    }, {});

    let openItemId = Object.keys(itemTree)[0];

    if (itemTree[this.state.openItemId]) {
      openItemId = this.state.openItemId;
    }

    this.setState(
      {
        itemTree: itemTree,
        openItemId: openItemId
      });
  }

  render() {
    const iconButtonElement = (
      <IconButton touch={true}>
        <MoreVertIcon/>
      </IconButton>
    );

    let listItems = [];

    if (this.state.itemTree) {
      listItems = Object.keys(this.state.itemTree).map(key => {
        return <ListItem
            key={key}
            id={key}
            secondaryText={key}
            primaryTogglesNestedList={true}
            onNestedListToggle={this._onNestedListToggle.bind(this)}
            open={this.state.openItemId === key}
            nestedItems={this.state.itemTree[key].map(item => {
              let menuEntries = [{label: 'toggle new', onClick: () => {this.props.onToggleNew(item.channelId, item.id)}}];

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

                if (this.props.enclosureDocs) {
                  let enclosureDoc = this.props.enclosureDocs.find(encDoc => {
                    return encDoc.itemId === item.id && encDoc.channelId === item.channelId;
                  });

                  if (enclosureDoc) {
                    let downloadStatus = 'requested';
                    let binExistsEntry = this.props.binExists.find(be => {
                      return be.channelId === enclosureDoc.channelId && be.itemId === enclosureDoc.itemId;
                    });
                    let binExists = typeof binExistsEntry !== 'undefined' && binExistsEntry.enclosureBinaryExists;

                    if (enclosureDoc.failed) {
                      downloadStatus = 'failed';
                      menuEntries.push({label: 'refresh download', onClick: () => { this.props.onRefreshDownload(item.channelId, item.id) }});
                    } else if (binExists) {
                      downloadStatus = 'available';
                      menuEntries.push({label: 'refresh download', onClick: () => { this.props.onRefreshDownload(item.channelId, item.id) }});
                      menuEntries.push({label: 'play', onClick: () => { this.props.onPlay(item.channelId, item.id) }});
                    }

                    menuEntries.push({label: 'remove download', onClick: () => { this.props.onRemoveDownload(item.channelId, item.id) }});

                    downloadChip = (
                      <Chip style={chipStyle}>download {downloadStatus}</Chip>
                    );
                  } else {
                    menuEntries.push({label: 'request download', onClick: () => { this.props.onRequestDownload(item.channelId, item.id) }});
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
          />
      });
    }

    return (
      <List>
        {listItems}
      </List>
    );
  }
}
