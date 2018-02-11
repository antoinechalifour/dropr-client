import * as React from 'react';
import { connect } from '../StateProvider';
import {
  StateContainer,
  Peer
} from '../../core/State';
import { peers } from '../../core/actions';

export interface SocketHandlerProps {
  socket: SocketIOClient.Socket;
  peers: Peer[];
  createInitiator: (id: string) => Promise<void>;
  createAnswerer: (id: string, offer: RTCSessionDescription) => Promise<void>;
  acceptAnswer: (id: string, answer: RTCSessionDescription) => void;
  addIceCandidate: (id: string, candidate: RTCIceCandidate) => void;
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

export class SocketHandler extends React.Component<SocketHandlerProps> {
  componentDidMount() {
    this.props.socket.emit('room/join');

    this.props.socket.on(
      'room/join',
      (e: OnJoinEvent) => this.props.createInitiator(e.id)
    );
    this.props.socket.on(
      'room/offer',
      (e: OnOfferEvent) => this.props.createAnswerer(e.id, e.offer)
    );
    this.props.socket.on(
      'room/accept',
      (e: OnAnswerEvent) => this.props.acceptAnswer(e.id, e.offer)
    );
    this.props.socket.on(
      'room/icecandidate',
      (e: OnIceCandidateEvent) => this.props.addIceCandidate(e.id, e.candidate)
    );
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state: StateContainer): SocketHandlerProps => ({
  socket: state.getState().socket,
  peers: state.getState().peers,
  createInitiator: (id: string) => peers.createInitiator(state, id),
  createAnswerer: (id: string, offer: RTCSessionDescription) => peers.createAnswerer(state, id, offer),
  acceptAnswer: (id: string, answer: RTCSessionDescription) => peers.acceptAnswer(state, id, answer),
  addIceCandidate: (id: string, candidate: RTCIceCandidate) => peers.addIceCandidate(state, id, candidate)
});

export const SocketHandlerContainer = connect<SocketHandlerProps, {}>(mapStateToProps)(SocketHandler);