import * as React from 'react';
import * as SocketIo from 'socket.io-client';
import Room from '../Room';

interface AppState {
  isConnected: boolean;
}

class App extends React.Component<object, AppState> {
  socket = SocketIo(process.env.REACT_APP_API_URI);

  state = { isConnected: false };

  componentDidMount() {
    this.socket.on('connect', () => this.setState({ isConnected: true }));
  }

  render() {
    if (this.state.isConnected) {
      return <Room socket={this.socket} />;
    }

    return <div>Loading...</div>;
  }
}

export default App;
