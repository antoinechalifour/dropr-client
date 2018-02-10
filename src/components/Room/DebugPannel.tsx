import * as React from 'react';
import styled from 'styled-components';
import { Peer } from '.';

export interface DebugPanelProps {
  peers: Peer[];
}

interface DebugPanelState {
  show: boolean;
}

const Wrapper = styled.ul`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  background: #373d3F;
  padding: 12px;
  color: #fff;
  max-width: 350px;
  line-height: 1.6;
  overflow-y: auto;
`;

const Peer = styled.li`
  padding-left: 18px;
  border-left: 2px solid rgba(255, 255, 255, .3);

  + li {
    margin-top: 16px;
  }
`;

const PeerName = styled.div`
  font-size: 24px;
  margin-left: -12px;
`;

const SectionName = styled.div`
  font-size: 20px;
`;

const Label = styled.div`

`;

const Pre = styled.pre`
  overflow-x: auto;
  background: rgba(0, 0, 0, .4);
  padding: 6px;
`;

export default class DebugPanel extends React.Component<DebugPanelProps, DebugPanelState> {
  state: DebugPanelState = { show: false };

  private interval: number;

  componentDidMount() {
    this.interval = window.setInterval(() => this.forceUpdate(), 1000);

    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }

  render() {
    if (!this.state.show) {
      return null;
    }

    return (
      <Wrapper>
        {this.props.peers.map(peer => {
          const localDescription = peer.pc.localDescription
            ? JSON.stringify(peer.pc.localDescription.toJSON(), null, 2)
            : 'none';
          const remoteDescription = peer.pc.remoteDescription
            ? JSON.stringify(peer.pc.remoteDescription.toJSON(), null, 2)
            : 'none';

          return (
            <Peer key={peer.id}>
              <PeerName>{peer.id}</PeerName>

              <SectionName>PeerConnection</SectionName>
              <Label>Local description</Label>
              <Pre>{localDescription}</Pre>
              <Label>Remote description</Label>
              <Pre>{remoteDescription}</Pre>
              <Label>Signaling state</Label>
              <Pre>{peer.pc.signalingState}</Pre>
              <Label>Ice connection state</Label>
              <Pre>{peer.pc.iceConnectionState}</Pre>
              <Label>Ice gathering state</Label>
              <Pre>{peer.pc.iceGatheringState}</Pre>

              <SectionName>Data channel</SectionName>
              <Label>State</Label>
              <Pre>{peer.dataChannel ? peer.dataChannel.readyState : null}</Pre>
            </Peer>
          );
        })}
      </Wrapper>
    );
  }

  private onKeyUp = (event: KeyboardEvent) => {
    const DEBUG_KEY_CODE = 222;

    if (event.getModifierState('Shift') && event.keyCode === DEBUG_KEY_CODE) {
      this.setState({
        show: !this.state.show
      });
    }
  }
}