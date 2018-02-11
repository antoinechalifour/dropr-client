import * as React from 'react';
import styled from 'styled-components';
import { MdClear } from 'react-icons/lib/md';
import { connect } from '../StateProvider';
import { StateContainer, SharedFile } from '../../core/State';
import { files } from '../../core/actions';

const Wrapper = styled.div`
  box-sizing: border-box;
  background: rgba(255, 255, 255, .9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .55);
`;

const Inner = styled.div`
  padding: 12px;
`;

const Hint = styled.div`
  text-align: center;
  opacity: .5;
  padding: 32px 0;
`;

const Files = styled.ul`
  display: flex;
  overflow-x: auto;
`;

const File = styled.li`
  padding: 4px 8px;
  border: 1px solid #8ACFF2;
  color: #5C8AC3;
  margin: 6px;
  border-radius: 4px;
  flex: 15% 0 0;
  word-break: break-word;
  display: flex;
  align-items: center;

  button {
    border: none;
    outline: none;
    background: none;
    font-size: 24px;
    color: inherit;
    cursor: pointer;
  }
`;

export interface FileInputProps {
  files: SharedFile[];
  onFile: (file: File) => void;
}

export class FileInput extends React.Component<FileInputProps, {}> {
  render() {
    return (
      <Wrapper onDrop={this.onDrop} onDragOver={e => e.preventDefault()}>
        <Inner>
          {this.props.files.length ? (
            <Files>
              {this.props.files.map(file => (
                <File key={file.name}>
                  <span>{file.name}</span>
                  <button>
                    <MdClear />
                  </button>
                </File>
              ))}
            </Files>
          ) : (
              <Hint>Drop files to share them</Hint>
            )}
        </Inner>
      </Wrapper>
    );
  }

  private onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;

    const newFiles = Array.from(dt.files);

    newFiles.forEach(this.props.onFile);
  }
}

const mapStateToProps = (state: StateContainer): FileInputProps => ({
  files: state.getState().ownedFiles,
  onFile: (file: File) => files.addFile(state, file)
});

export const FileInputContainer = connect<FileInputProps, {}>(mapStateToProps)(FileInput);