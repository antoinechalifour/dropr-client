import * as React from 'react';
import { Peer } from '.';
import DebugPannel from './DebugPannel';
import FileInput from './FileInput';

interface RoomProps {
  socket: SocketIOClient.Socket;
}

interface RoomState {
  peers: Map<string, Peer>;
  ownedFiles: File[];
  downloadableFiles: DownloadableFile[];
}

interface RoomEvent {
  type: string;
}

interface FileAddedEventPayload {
  name: string;
  type: string;
  size: number;
  lastModifiedDate: string;
}

interface DownloadableFile extends FileAddedEventPayload {
  channel: RTCDataChannel;
}

interface FileAddedEvent extends RoomEvent {
  payload: FileAddedEventPayload;
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
    peers: new Map<string, Peer>(),
    ownedFiles: [],
    downloadableFiles: []
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
        <FileInput onFile={this.onFile} />
        <DebugPannel
          peers={Array.from(this.state.peers.values())}
        />
      </div>
    );
  }

  private log(message: string) {
    console.log(message);
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
    channel.onmessage = (message: MessageEvent) => {
      const event = JSON.parse(message.data) as RoomEvent;

      switch (event.type) {
        case 'file/new': {
          const fileEvent = event as FileAddedEvent;

          this.setState({
            downloadableFiles: [...this.state.downloadableFiles, { ...fileEvent.payload, channel }]
          });
          break;
        }
        default: {
          console.log('Unknown event type');
        }
      }
    };
  }

  private onFile = (file: File) => {
    console.log('File added', file);

    this.setState({
      ownedFiles: [...this.state.ownedFiles, file]
    });

    const peers = Array.from(this.state.peers.values());
    const event = {
      type: 'file/new',
      payload: {
        lastModifiedDate: file.lastModifiedDate,
        size: file.size,
        name: file.name,
        type: file.type
      }
    };

    peers.forEach(peer => {
      if (!peer.dataChannel) {
        return;
      }

      peer.dataChannel.send(JSON.stringify(event));
    });
  }
}