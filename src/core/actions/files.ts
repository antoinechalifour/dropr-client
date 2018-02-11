import { StateContainer } from '../State';
import channels from './channels';

export default {
  addFile(state: StateContainer, file: File) {
    const { ownedFiles } = state.getState();

    state.setState({
      ownedFiles: [...ownedFiles, file]
    });

    channels.notifyFileAvailable(state, file);
  }
};
