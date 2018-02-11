import * as React from 'react';
import Room from '../Room';
import { connect } from './StateProvider';
import { StateContainer } from '../../core/State';

export interface AppProps {
  socket: SocketIOClient.Socket;
}

interface AppState {
  isConnected: boolean;
}

class App extends React.Component<AppProps, AppState> {
  state = { isConnected: false };

  componentDidMount() {
    this.props.socket.on('connect', () => this.setState({ isConnected: true }));
  }

  render() {
    if (this.state.isConnected) {
      return <Room socket={this.props.socket} />;
    }

    return <div>Loading...</div>;
  }
}

interface InjectedProps {
  socket: SocketIOClient.Socket;
}

const mapStateToProps = (state: StateContainer, ownProps: AppProps): InjectedProps => ({
  socket: state.getState().socket
});

export default connect<InjectedProps, {}>(mapStateToProps)(App);
