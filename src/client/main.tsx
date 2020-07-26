import { configure } from 'mobx';
import React from 'react';
import ReactDOM from 'react-dom';
import { installDash } from './components/dash/install';

import sio from 'socket.io-client';

const uri = `${document.location!.origin}/dashboard`;
const sioNetwork = sio(uri, {
  upgrade: false,
  transports: ['websocket'],
});
sioNetwork.on('connect', () => {
  console.log('Client connected to server');
});
sioNetwork.on('reconnect_attempt', () => {
  console.log('Client reconnecting to server');
  sioNetwork.io.opts.transports = ['polling', 'websocket'];
});
sioNetwork.on('disconnect', () => {
  console.log('Client disconnected from server');
});
sioNetwork.on('udp_packet', (...packet: any[]) => {
  console.log(packet.length);
});
sioNetwork.connect();

const { Dashboard } = installDash();

configure({ enforceActions: 'observed' });
ReactDOM.render(<Dashboard />, document.getElementById('root'));
