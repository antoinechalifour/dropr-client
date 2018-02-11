export interface Peer {
  id: string;
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

export interface SharedFile extends File {
}

export interface DownloadableFile {
  name: string;
  type: string;
  size: number;
  lastModifiedDate: string;
  channel: RTCDataChannel;
}

export interface Download {
  file: DownloadableFile;
  buffer: ArrayBuffer[];
  bytes: number;
}

export interface State {
  socket: SocketIOClient.Socket;
  peers: Peer[];
  ownedFiles: SharedFile[];
  downloadableFiles: DownloadableFile[];
  currentDownload?: Download;
}

type PartialState = Partial<State>;

type Listener = (state: State) => void;

export class StateContainer {
  private state: State;

  private listeners: Listener[] = [];

  constructor(initialState: State) {
    this.state = initialState;
  }

  setState(nextState: PartialState) {
    Object.keys(nextState).forEach(key => {
      this.state[key] = nextState[key];
    });

    this.listeners.forEach(x => x(this.state));
  }

  getState() {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);

    // Return the unsubscribe function.
    return () => this.listeners = this.listeners.filter(x => x !== listener);
  }
}