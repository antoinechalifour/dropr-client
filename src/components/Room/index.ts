export interface Peer {
  id: string;
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

export { default } from './Room';