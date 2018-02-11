import * as React from 'react';
import styled from 'styled-components';
import {
  MdImage,
  MdInsertDriveFile,
  MdOndemandVideo,
  MdPictureAsPdf,
  MdAudiotrack,
  MdFolder,
  MdCode
} from 'react-icons/lib/md';
import { connect } from '../StateProvider';
import { DownloadableFile, StateContainer } from '../../core/State';
import { channels } from '../../core/actions';

export interface DownloadableFilesProps {
  files: DownloadableFile[];
  onDownload: (file: DownloadableFile) => void;
}

const Files = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 24px;
  align-items: flex-start;
`;

const File = styled.li`
  flex: 25% 0 0;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
`;

const FileName = styled.h3`
  padding: 8px;
  background: rgba(255, 255, 255, .2);
  border-radius: 4px;
  color: #fff;
  display: inline-block;
  word-break: break-word;
`;

const Empty = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: .75;
`;

const IconContainer = styled.div`
  padding: 48px 24px;
  background: #fff;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .24);

  svg {
    font-size: 48px;
    opacity: .33;
  }
`;

export function DownloadableFiles({ files, onDownload }: DownloadableFilesProps) {
  if (!files.length) {
    return (
      <Empty>
        No files available for download :'(
      </Empty>
    );
  }

  return (
    <div>
      <Files>
        {files.map(file => {
          const icon = (function (type: string) {
            switch (type) {
              case 'image/jpeg':
              case 'image/png':
                return <MdImage />;
              case 'text/markdown':
              case 'text/javascript':
              case 'application/json':
                return <MdCode />;
              case 'audio/mp3':
                return <MdAudiotrack />;
              case 'video/mp4':
                return <MdOndemandVideo />;
              case 'application/pdf':
                return <MdPictureAsPdf />;
              case 'application/zip':
              case 'application/x-gzip':
                return <MdFolder />;
              default:
                return <MdInsertDriveFile />;
            }
          })(file.type);

          return (
            <File key={`${file.lastModifiedDate}-${file.name}`} onClick={() => onDownload(file)}>
              <header>
                <IconContainer>
                  {icon}
                </IconContainer>
                <FileName>{file.name} ({(file.size / 1000000).toFixed(1)}mo)</FileName>
              </header>
            </File>
          );
        })}
      </Files>
    </div>
  );
}

const mapStateToProps = (state: StateContainer): DownloadableFilesProps => ({
  files: state.getState().downloadableFiles,
  onDownload: (file: DownloadableFile) => channels.downloadFile(state, file)
});

export const DownloadableFilesContainer = connect<DownloadableFilesProps, {}>(mapStateToProps)(DownloadableFiles);