import { StateContainer } from '../State';
import channels from './channels';

const actions = {
  iceServers: [
    { urls: 'stun:stun01.sipphone.com' },
    { urls: 'stun:stun.ekiga.net' },
    { urls: 'stun:stun.fwdnet.net' },
    { urls: 'stun:stun.ideasip.com' },
    { urls: 'stun:stun.iptel.org' },
    { urls: 'stun:stun.rixtelecom.se' },
  ],

  async createInitiator(state: StateContainer, id: string): Promise<void> {
    console.log('Creating initiator');
    const socket = state.getState().socket;

    // Create the RTC related stuff: peer connection, data channels, ...
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });

    // Configure the peer connection
    const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (!event.candidate) {
        return;
      }

      console.log('Emitting ice candiate');
      socket.emit('room/icecandidate', {
        receiverId: id,
        candidate: event.candidate
      });
    };

    const dataChannel = pc.createDataChannel('some-channel');
    channels.configureDataChannel(state, dataChannel);

    pc.onicecandidate = onIceCandidate;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Done for the RTC related stuff. Emit
    // the offer.
    console.log('Emitting offer');
    socket.emit('room/offer', {
      receiverId: id,
      offer
    });

    // Update the state to add the created peer.
    const peers = state.getState().peers;
    const peer = {
      id,
      pc,
      dataChannel
    };

    state.setState({ peers: [...peers, peer] });
  },

  async createAnswerer(state: StateContainer, id: string, offer: RTCSessionDescription): Promise<void> {
    console.log('Creating answerer');
    const socket = state.getState().socket;

    // Create the RTC related stuff
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });

    const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (!event.candidate) {
        return;
      }

      console.log('Emitting ice candidate');
      socket.emit('room/icecandidate', {
        receiverId: id,
        candidate: event.candidate
      });
    };

    const peers = state.getState().peers;
    const peer = {
      id,
      pc
    };

    state.setState({ peers: [...peers, peer] });

    const onDataChannel = (event: RTCDataChannelEvent) => {
      console.log('Got data channel');
      channels.configureDataChannel(state, event.channel);

      state.setState({
        peers: state.getState().peers.map(x => {
          if (x.id === id) {
            return { ...x, dataChannel: event.channel };
          } else {
            return x;
          }
        })
      });
    };

    pc.onicecandidate = onIceCandidate;
    pc.ondatachannel = onDataChannel;

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);

    console.log('Emitting answer');
    socket.emit('room/accept', {
      receiverId: id,
      offer: answer
    });
  },

  acceptAnswer(state: StateContainer, id: string, answer: RTCSessionDescription): void {
    const peers = state.getState().peers;
    const peer = peers.find(x => x.id === id);

    if (!peer) {
      throw new Error(`Peer ${id} was not found`);
    }

    console.log('Received answer');
    peer.pc.setRemoteDescription(answer);
  },

  addIceCandidate(state: StateContainer, id: string, candidate: RTCIceCandidate): void {
    const peers = state.getState().peers;
    const peer = peers.find(x => x.id === id);

    if (!peer) {
      throw new Error(`Peer ${id} was not found`);
    }

    console.log('Received ice candidate');
    peer.pc.addIceCandidate(candidate);
  }
};

export default actions;
