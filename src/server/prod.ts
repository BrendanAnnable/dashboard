import compression from 'compression';
import history from 'connect-history-api-fallback';
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import favicon from 'serve-favicon';
import sio from 'socket.io';

import { WebSocketProxyUDPServer } from './network/network';
import { WebSocketServer } from './network/web_socket_server';

const args = minimist(process.argv.slice(2));
const teamAAddress = args.team_a || '239.226.152.162';
const teamBAddress = args.team_b || '239.226.152.163';

const app = express();
const server = http.createServer(app);
const sioNetwork = sio(server);

// Initialize socket.io namespace immediately to catch reconnections.
WebSocketProxyUDPServer.of(WebSocketServer.of(sioNetwork.of('/dashboard')), {
  teamAAddress,
  teamBAddress,
});

const root = `${__dirname}/../../dist`;
app.use(
  history({
    rewrites: [
      // Allows user to navigate to /storybook/ without needing to type /index.html
      { from: /\/storybook\/$/, to: 'storybook/index.html' },
    ],
  }),
);
app.use(compression());
app.use(express.static(root));
app.use(favicon(`${__dirname}/../assets/favicon.ico`));

const port = process.env.PORT || 9090;
server.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log(`Server started at http://localhost:${port}`);
});
