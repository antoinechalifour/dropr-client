import * as React from 'react';
import styled from 'styled-components';
import { MdClear } from 'react-icons/lib/md';
import { connect } from '../StateProvider';
import { StateContainer, SharedFile } from '../../core/State';
import { files } from '../../core/actions';

interface WrapperProps {
  hover: boolean;
}

const Wrapper = styled<WrapperProps, 'div'>('div') `
  box-sizing: border-box;
  background: rgba(255, 255, 255, .9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .55);
  transition: padding .2s ease;

  padding: ${({ hover }) => hover ? 256 : 0}px 0px;
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
  overflow-x: auto;
  white-space: nowrap;
`;

const File = styled.li`
  padding: 4px 8px;
  border: 1px solid #8ACFF2;
  color: #5C8AC3;
  margin: 6px;
  border-radius: 4px;
  word-break: break-word;
  display: inline-flex;
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
  onRemoveFile: (file: SharedFile) => void;
}

interface FileInputState {
  isHovering: boolean;
}

export class FileInput extends React.Component<FileInputProps, FileInputState> {
  state: FileInputState = {
    isHovering: false
  };

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  render() {
    return (
      <Wrapper onDrop={this.onDrop} onDragOver={this.onDragHover} hover={this.state.isHovering}>
        <Inner>
          {this.props.files.length ? (
            <Files>
              {this.props.files.map(file => (
                <File key={file.name}>
                  <span>{file.name}</span>
                  <button onClick={() => this.props.onRemoveFile(file)}>
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
    this.setState({ isHovering: false });
    const dt = e.dataTransfer;

    const newFiles = Array.from(dt.files);

    newFiles.forEach(this.props.onFile);
  }

  private onDragHover = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    this.setState({ isHovering: true });
  }

  private onMouseUp = () => {
    if (this.state.isHovering) {
      this.setState({ isHovering: false });
    }
  }
}

const mapStateToProps = (state: StateContainer): FileInputProps => ({
  files: state.getState().ownedFiles,
  onFile: (file: File) => files.addFile(state, file),
  onRemoveFile: (file: SharedFile) => files.removeFile(state, file)
});

export const FileInputContainer = connect<FileInputProps, {}>(mapStateToProps)(FileInput);