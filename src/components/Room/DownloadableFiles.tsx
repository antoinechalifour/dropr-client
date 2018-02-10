import * as React from 'react';
import styled from 'styled-components';
import { DownloadableFile } from '.';

interface DownloadableFilesProps {
  files: DownloadableFile[];
}

const File = styled.li`
  cursor: pointer;
`;

export default function DownloadableFiles({ files }: DownloadableFilesProps) {
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

            <button>Download</button>
          </header>
        </File>
      ))}
    </ul>
  );
}
