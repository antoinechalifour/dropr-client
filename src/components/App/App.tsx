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
      return <Room />;
    }

    return <div>Loading...</div>;
  }
}

const mapStateToProps = (state: StateContainer, ownProps: AppProps): AppProps => ({
  socket: state.getState().socket
});

export default connect<AppProps, {}>(mapStateToProps)(App);
