import * as React from 'react';
import { connect } from '../App/StateProvider';
import { StateContainer } from '../../core/State';
import { files } from '../../core/actions';

interface FileInputProps {
  onFile: (file: File) => void;
}

class FileInput extends React.Component<FileInputProps, {}> {
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

export default connect<FileInputProps, {}>(mapStateToProps)(FileInput);