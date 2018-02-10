import * as React from 'react';
import DebugPannel from './DebugPannel';

interface Log {
  timestamp: Date;
  message: string;
}

export interface Peer {
  id: string;
  pc: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

interface RoomProps {
  socket: SocketIOClient.Socket;
}

interface RoomState {
  logs: Log[];
  peers: Map<string, Peer>;
}

interface OnJoinEvent {
  id: string;
}

interface OnOfferEvent {
  id: string;
  offer: RTCSessionDescription;
}

interface OnAnswerEvent {
  id: string;
  offer: RTCSessionDescription;
}

interface OnIceCandidateEvent {
  id: string;
  candidate: RTCIceCandidate;
}

export default class Room extends React.Component<RoomProps, RoomState> {
  state: RoomState = {
    logs: [],
    peers: new Map<string, Peer>()
  };

  componentDidMount() {
    this.log('Joining room...');
    this.props.socket.emit('room/join');

    this.props.socket.on('room/join', this.onRoomJoin);
    this.props.socket.on('room/offer', this.onRoomOffer);
    this.props.socket.on('room/accept', this.onRoomAnswer);
    this.props.socket.on('room/icecandidate', this.onRoomIceCandidate);
  }

  render() {
    return (
      <div>
        <h1>Room</h1>
        <ul>
          {this.state.logs.map(log => (
            <li key={Math.random()}><strong>{log.timestamp.toISOString()}</strong> - {log.message}</li>
          ))}
        </ul>
        <DebugPannel
          peers={Array.from(this.state.peers.values())}
        />
      </div>
    );
  }

  private log(message: string) {
    this.setState({
      logs: [...this.state.logs, {
        timestamp: new Date(),
        message
      }]
    });
  }

  private onRoomJoin = async (event: OnJoinEvent) => {
    this.log(`=> ${event.id} - Joined the room.`);
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun01.sipphone.com' },
        { urls: 'stun:stun.ekiga.net' },
        { urls: 'stun:stun.fwdnet.net' },
        { urls: 'stun:stun.ideasip.com' },
        { urls: 'stun:stun.iptel.org' },
        { urls: 'stun:stun.rixtelecom.se' },
      ]
    });

    // As this client is the initiator of the connection,
    // it needs to create the data channel
    this.log(`=> ${event.id} - Creating data channel`);
    const channel = pc.createDataChannel('label');

    const peer = {
      id: event.id,
      pc,
      dataChannel: channel
    };

    const peers = new Map(this.state.peers);
    peers.set(peer.id, peer);

    this.setState({ peers });

    this.configureChannel(channel);

    pc.onicecandidate = e => {
      if (!e.candidate) {
        this.log(`=> ${event.id} - No ice candidate found.`);
        return;
      }

      this.log(`=> ${event.id} - Got an ice candidate.`);
      this.props.socket.emit('room/icecandidate', {
        receiverId: event.id,
        candidate: e.candidate
      });
    };

    // Create an RTC offer to send to the newly added client
    this.log(`=> ${event.id} - Creating offer.`);
    const offer = await pc.createOffer();

    // Set the local description
    this.log(`=> ${event.id} - Setting local description.`);
    await pc.setLocalDescription(offer);

    // Emit the local description to the new client
    this.log(`=> ${event.id} - Emitting offer.`);
    this.props.socket.emit('room/offer', {
      receiverId: event.id,
      offer
    });
  }

  private onRoomOffer = async (event: OnOfferEvent) => {
    this.log(`=> ${event.id} - Sent an offer.`);
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun01.sipphone.com' },
        { urls: 'stun:stun.ekiga.net' },
        { urls: 'stun:stun.fwdnet.net' },
        { urls: 'stun:stun.ideasip.com' },
        { urls: 'stun:stun.iptel.org' },
        { urls: 'stun:stun.rixtelecom.se' },
      ]
    });

    pc.onicecandidate = e => {
      if (!e.candidate) {
        this.log(`=> ${event.id} - No ice candidate found.`);
        return;
      }

      this.log(`=> ${event.id} - Got an ice candidate.`);
      this.props.socket.emit('room/icecandidate', {
        receiverId: event.id,
        candidate: e.candidate
      });
    };

    const peer = {
      id: event.id,
      pc
    };
    const peers = new Map(this.state.peers);
    peers.set(peer.id, peer);

    this.setState({ peers });

    // As this client is not the initiator of the connections,
    // it needs to add an datachannel listener.
    pc.ondatachannel = e => {
      const partialPeer = this.state.peers.get(event.id);

      if (!partialPeer) {
        return;
      }

      partialPeer.dataChannel = e.channel;
      const nextPeers = new Map(this.state.peers);

      this.log(`=> ${event.id} - Added a data channel.`);
      this.setState({ peers: nextPeers });
      this.configureChannel(e.channel);
    };

    // Set the remote description
    this.log(`=> ${event.id} - Setting remote description.`);
    await pc.setRemoteDescription(event.offer);

    // Create an answer offer
    this.log(`=> ${event.id} - Creating an answer.`);
    const offer = await pc.createAnswer();

    // Set the local description
    this.log(`=> ${event.id} - Setting the local description.`);
    pc.setLocalDescription(offer);

    // Emit the description
    this.log(`=> ${event.id} - Emitting answer.`);
    this.props.socket.emit('room/accept', {
      receiverId: event.id,
      offer
    });
  }

  private onRoomAnswer = (event: OnAnswerEvent) => {
    this.log(`=> ${event.id} - Sent an answer.`);
    const peer = this.state.peers.get(event.id);

    if (!peer) {
      return;
    }

    this.log(`=> ${event.id} - Setting the remote description`);
    peer.pc.setRemoteDescription(event.offer);
  }

  private onRoomIceCandidate = (event: OnIceCandidateEvent) => {
    this.log(`=> ${event.id} - Sent an ice candidate`);
    const peer = this.state.peers.get(event.id);

    if (!peer) {
      return;
    }

    this.log(`=> ${event.id} - Adding ice candidate.`);
    peer.pc.addIceCandidate(event.candidate);
  }

  private configureChannel = (channel: RTCDataChannel) => {
    this.log('Configuring data channel');

    channel.onopen = () => console.log('Channel is now open');
    channel.onclose = () => console.log('Channel is now closed');
    channel.onmessage = e => console.log(e.data);
  }
}