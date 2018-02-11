import 'reset.css/reset.css';
import './index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SocketIo from 'socket.io-client';
import { AppContainer } from './components/App';
import { StateProvider } from './components/StateProvider';
import { StateContainer } from './core/State';

const state = new StateContainer({
  peers: [],
  ownedFiles: [],
  downloadableFiles: [],
  socket: SocketIo(process.env.REACT_APP_API_URI),
  currentDownload: undefined
});

console.log(state);

ReactDOM.render(
  <StateProvider state={state}>
    <AppContainer />
  </StateProvider>,
  document.getElementById('root') as HTMLElement
);
