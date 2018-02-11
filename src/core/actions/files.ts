import { StateContainer, SharedFile } from '../State';
import channels from './channels';

export default {
  addFile(state: StateContainer, file: File) {
    const { ownedFiles } = state.getState();

    state.setState({
      ownedFiles: [...ownedFiles, file]
    });

    channels.notifyFileAvailable(state, file);
  },

  removeFile(state: StateContainer, file: SharedFile) {
    const { ownedFiles } = state.getState();

    state.setState({
      ownedFiles: ownedFiles.filter(x => x !== file)
    });

    channels.notifyFileRemoved(state, file);
  }
};
