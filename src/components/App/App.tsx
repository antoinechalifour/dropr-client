import * as React from 'react';
import { connect } from '../StateProvider';
import { StateContainer } from '../../core/State';
import { Room } from '../Room';

export interface AppProps {
  socket: SocketIOClient.Socket;
}

interface AppState {
  isConnected: boolean;
}

export class App extends React.Component<AppProps, AppState> {
  state = { isConnected: false };

  componentDidMount() {
    this.props.socket.on('connect', () => this.setState({ isConnected: true }));
    this.props.socket.on('disconnect', () => this.setState({ isConnected: false }));
  }

  render() {
    if (this.state.isConnected) {
      return <Room />;
    }

    return <div>Loading...</div>;
  }
}

const mapStateToProps = (state: StateContainer, ownProps: AppProps): AppProps => ({
  socket: state.getState().socket
});

export const AppContainer = connect<AppProps, {}>(mapStateToProps)(App);
