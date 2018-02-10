import * as React from 'react';
import styled from 'styled-components';
import { DownloadableFile } from '.';

interface DownloadableFilesProps {
  files: DownloadableFile[];
  onDownload: (file: DownloadableFile) => void;
}

const File = styled.li`
  cursor: pointer;
`;

export default function DownloadableFiles({ files, onDownload }: DownloadableFilesProps) {
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
