import 'reset.css/reset.css';
import './index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SocketIo from 'socket.io-client';
import App, * as app from './components/App';
import { StateContainer } from './core/State';

const state = new StateContainer({
  peers: [],
  ownedFiles: [],
  downloadableFiles: [],
  socket: SocketIo(process.env.REACT_APP_API_URI)
});

ReactDOM.render(
  <app.StateProvider state={state}>
    <App />
  </app.StateProvider>,
  document.getElementById('root') as HTMLElement
);
