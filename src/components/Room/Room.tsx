import * as React from 'react';
import { SocketHandlerContainer } from '../SocketHandler';
import { DebugPanelContainer } from '../DebugPanel';
import { FileInputContainer } from '../FileInput';
import { DownloadableFilesContainer } from '../DownloadableFiles';
import { DownloadProgressContainer } from '../DownloadProgress';

export function Room() {
  return (
    <React.Fragment>
      <SocketHandlerContainer />
      <DownloadableFilesContainer />
      <FileInputContainer />
      <DebugPanelContainer />
      <DownloadProgressContainer />
    </React.Fragment>
  );
}
