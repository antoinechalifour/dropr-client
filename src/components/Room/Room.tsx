import * as React from 'react';
import styled from 'styled-components';
import { SocketHandlerContainer } from '../SocketHandler';
import { DebugPanelContainer } from '../DebugPanel';
import { FileInputContainer } from '../FileInput';
import { DownloadableFilesContainer } from '../DownloadableFiles';
import { DownloadProgressContainer } from '../DownloadProgress';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: linear-gradient(-149deg, #8ACFF2 0%, #7E84D8 56%, #5C8AC3 100%);

  > :first-child {
    flex: 1;
    overflow-y: auto;
  }
`;

export function Room() {
  return (
    <Wrapper>
      <DownloadableFilesContainer />
      <FileInputContainer />
      <DebugPanelContainer />
      <DownloadProgressContainer />
      <SocketHandlerContainer />
    </Wrapper>
  );
}
