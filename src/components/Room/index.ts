export interface Peer {
  id: string;
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

export interface FileAddedEventPayload {
  name: string;
  type: string;
  size: number;
  lastModifiedDate: string;
}

export interface DownloadableFile extends FileAddedEventPayload {
  channel: RTCDataChannel;
}

export { default } from './Room';