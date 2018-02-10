import * as React from 'react';

interface Log {
  timestamp: Date;
  message: string;
}

interface RoomProps {
  socket: SocketIOClient.Socket;
}

interface RoomState {
  logs: Log[];
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
  state: RoomState = { logs: [] };

  private connections = new Map<string, RTCPeerConnection>();

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

    this.connections.set(event.id, pc);

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

    this.connections.set(event.id, pc);

    // As this client is not the initiator of the connections,
    // it needs to add an datachannel listener.
    pc.ondatachannel = e => {
      this.log(`=> ${event.id} - Added a data channel.`);
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
    const pc = this.connections.get(event.id);

    if (!pc) {
      return;
    }

    this.log(`=> ${event.id} - Setting the remote description`);
    pc.setRemoteDescription(event.offer);
  }

  private onRoomIceCandidate = (event: OnIceCandidateEvent) => {
    this.log(`=> ${event.id} - Sent an ice candidate`);
    const pc = this.connections.get(event.id);

    if (!pc) {
      return;
    }

    this.log(`=> ${event.id} - Adding ice candidate.`);
    pc.addIceCandidate(event.candidate);
  }

  private configureChannel = (channel: RTCDataChannel) => {
    this.log('Configuring data channel');
    console.log(channel);
    channel.onopen = () => console.log('Channel is now open');
    channel.onclose = () => console.log('Channel is now closed');
    channel.onmessage = e => console.log(e.data);
  }
}