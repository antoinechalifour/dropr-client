import * as React from 'react';
import styled from 'styled-components';
import { connect } from '../App/StateProvider';
import { DownloadableFile, StateContainer } from '../../core/State';
import { channels } from '../../core/actions';

interface DownloadableFilesProps {
  files: DownloadableFile[];
  onDownload: (file: DownloadableFile) => void;
}

const File = styled.li`
  cursor: pointer;
`;

function DownloadableFiles({ files, onDownload }: DownloadableFilesProps) {
  return (
    <ul>
      {files.map(file => (
        <File>
          <header>
            <h3>{file.name}</h3>

            <ul>
              <li>Size: {file.size}</li>
              <li>Type: {file.type}</li>
              <li>Date: {file.lastModifiedDate}</li>
            </ul>

            <button onClick={() => onDownload(file)}>Download</button>
          </header>
        </File>
      ))}
    </ul>
  );
}

const mapStateToProps = (state: StateContainer): DownloadableFilesProps => ({
  files: state.getState().downloadableFiles,
  onDownload: (file: DownloadableFile) => channels.downloadFile(state, file)
});

export default connect<DownloadableFilesProps, {}>(mapStateToProps)(DownloadableFiles);