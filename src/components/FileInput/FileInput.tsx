import * as React from 'react';
import { connect } from '../StateProvider';
import { StateContainer } from '../../core/State';
import { files } from '../../core/actions';

export interface FileInputProps {
  onFile: (file: File) => void;
}

export class FileInput extends React.Component<FileInputProps, {}> {
  render() {
    return (
      <div>
        <input type="file" onChange={this.onChange} />
      </div>
    );
  }

  private onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    if (!input.files) {
      return;
    }

    const newFiles = Array.from(input.files);

    newFiles.forEach(this.props.onFile);
  }
}

const mapStateToProps = (state: StateContainer): FileInputProps => ({
  onFile: (file: File) => files.addFile(state, file)
});

export const FileInputContainer = connect<FileInputProps, {}>(mapStateToProps)(FileInput);