import * as React from 'react';

export interface FileInputProps {
  onFile: (file: File) => void;
}

export default class FileInput extends React.Component<FileInputProps, {}> {
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

    const files = Array.from(input.files);

    files.forEach(this.props.onFile);
  }
}