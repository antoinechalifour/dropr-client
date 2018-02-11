import * as React from 'react';
import {
  Peer,
  SharedFile,
  DownloadableFile,
  StateContainer,
} from '../../core/State';
import { connect } from '../App/StateProvider';
import SocketHandler from './SocketHandler';
import DebugPannel from './DebugPannel';
import FileInput from './FileInput';
import DownloadableFiles from './DownloadableFiles';

interface RoomProps {
  peers: Peer[];
  ownedFiles: SharedFile[];
  downloadableFiles: DownloadableFile[];
}

class Room extends React.Component<RoomProps> {
  render() {
    return (
      <div>
        <h1>Room</h1>
        <SocketHandler />
        <DownloadableFiles />
        <FileInput />
        <DebugPannel />
      </div>
    );
  }

  // private onDownload = (file: DownloadableFile) => {
  // const event = {
  //   type: 'file/download',
  //   payload: {
  //     name: file.name
  //   }
  // };

  // file.channel.send(JSON.stringify(event));
  // }
}

const mapStateToProps = (state: StateContainer): RoomProps => ({
  peers: state.getState().peers,
  ownedFiles: state.getState().ownedFiles,
  downloadableFiles: state.getState().downloadableFiles
});

export default connect<RoomProps, {}>(mapStateToProps)(Room);