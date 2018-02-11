import { StateContainer } from '../State';
import { DownloadableFile } from '../State';

interface DataChannelEvent {
  type: string;
}

interface FileAddedEvent extends DataChannelEvent {
  payload: DownloadableFile;
}

interface FileDownloadPayload {
  name: string;
}

interface FileDownloadEvent extends DataChannelEvent {
  payload: FileDownloadPayload;
}

function isBinaryData(e: MessageEvent) {
  return e.data && e.data.byteLength;
}

export default {
  configureDataChannel(state: StateContainer, channel: RTCDataChannel): void {
    interface Listener {
      type: string;
      callback: (e: DataChannelEvent) => void;
    }

    const combineListeners = (
      listeners: Listener[]
    ) => (message: MessageEvent) => {
      if (isBinaryData(message)) {
        this.onBinaryData(state, message);
      } else {
        try {
          // Is the event a json object ?
          const event = JSON.parse(message.data) as DataChannelEvent;

          listeners.forEach(x => {
            if (x.type === event.type) {
              x.callback(event);
            }
          });
        } catch (err) {
          console.log('DataChannelError:', err);
          // Is it binary data ?
        }
      }
    };

    channel.onopen = () => this.onOpenChannel(state, channel);
    channel.onclose = () => this.onCloseChannel(state, channel);
    channel.onmessage = combineListeners([{
      type: 'file/new',
      callback: this.onFileNew(state, channel)
    }, {
      type: 'file/download',
      callback: this.onFileDownload(state, channel)
    }]);
  },

  onBinaryData(state: StateContainer, e: MessageEvent) {
    const { currentDownload } = state.getState();

    if (!currentDownload) {
      console.log('Already downloading...');
      return;
    }

    currentDownload.buffer.push(e.data);
    currentDownload.bytes += e.data.byteLength;

    if (currentDownload.bytes >= currentDownload.file.size) {
      const blob = new window.Blob(currentDownload.buffer);
      const anchor = document.createElement('a');

      anchor.href = URL.createObjectURL(blob);
      anchor.download = currentDownload.file.name;

      anchor.click();

      // Download is complete
      state.setState({
        currentDownload: undefined
      });
    } else {
      state.setState({ currentDownload });
    }
  },

  onOpenChannel(state: StateContainer, channel: RTCDataChannel) {
    return () => {
      console.log('Channel is now open');
    };
  },

  onCloseChannel(state: StateContainer, channel: RTCDataChannel) {
    return () => {
      console.log('Closing data channel');
      state.setState({
        peers: state.getState().peers.filter(x => x.dataChannel !== channel)
      });
    };
  },

  onFileNew: (state: StateContainer, channel: RTCDataChannel) => (e: DataChannelEvent) => {
    const event = e as FileAddedEvent;
    const existingFiles = state.getState().downloadableFiles;
    const newFile = event.payload;

    newFile.channel = channel;

    state.setState({
      downloadableFiles: [...existingFiles, newFile]
    });
  },

  onFileDownload: (state: StateContainer, channel: RTCDataChannel) => (e: DataChannelEvent) => {
    const event = e as FileDownloadEvent;
    const { ownedFiles } = state.getState();
    const file = ownedFiles.find(x => x.name === event.payload.name);

    if (!file) {
      return;
    }

    const BYTES_PER_CHUNK = 16000;
    const reader = new FileReader();
    let currentChunk = 0;

    const readNextChunk = () => {
      const start = BYTES_PER_CHUNK * currentChunk;
      const end = Math.min(file.size, start + BYTES_PER_CHUNK);
      reader.readAsArrayBuffer(file.slice(start, end));
    };

    reader.onload = () => {
      channel.send(reader.result);
      currentChunk += 1;

      if (BYTES_PER_CHUNK * currentChunk < file.size) {
        readNextChunk();
      }
    };

    readNextChunk();
  },

  notifyFileAvailable(state: StateContainer, file: File) {
    const { peers } = state.getState();

    peers.forEach(peer => {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        console.log('Sending data...');
        peer.dataChannel.send(JSON.stringify({
          type: 'file/new',
          payload: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModifiedDate: file.lastModifiedDate.toString()
          }
        }));
      }
    });
  },

  downloadFile(state: StateContainer, file: DownloadableFile) {
    const currentDownload = state.getState().currentDownload;

    if (currentDownload) {
      console.log('Already downloading!');
      return;
    }

    state.setState({
      currentDownload: {
        buffer: [],
        file,
        bytes: 0
      }
    });

    file.channel.send(JSON.stringify({
      type: 'file/download',
      payload: { name: file.name }
    }));
  }
};