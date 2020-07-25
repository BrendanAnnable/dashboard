import { configure } from 'mobx';
import React from 'react';
import ReactDOM from 'react-dom';
import { installDash } from './components/dash/install';

import { WebSocketProxyUDPClient } from './network/network';

const network = WebSocketProxyUDPClient.of();
network.connect();

const { Dashboard } = installDash();

configure({ enforceActions: 'observed' });
ReactDOM.render(<Dashboard />, document.getElementById('root'));
