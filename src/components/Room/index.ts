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

export { default } from './Room';