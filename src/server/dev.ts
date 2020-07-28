import compression from 'compression';
import history from 'connect-history-api-fallback';
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import favicon from 'serve-favicon';
import sio from 'socket.io';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

import webpackConfig from '../../webpack.config';

import { UDPServers } from './network/network';

// Process command line arguments
const args = minimist(process.argv.slice(2));

// Get all of the teams from the command line
// Fall back to our defaults if none were specified
let teams = args._;
if (teams.length === 0) {
  teams = ['Red Team:239.226.152.162:9917', 'Blue Team:239.226.152.163:9917'];
}

// Convert command line data into a more usable format
const teamData = teams.map((team: string) => {
  const nameSplit = team.indexOf(':');
  const portSplit = team.lastIndexOf(':');
  const teamName = team.substring(0, nameSplit);
  const teamAddress = team.substring(nameSplit + 1, portSplit);
  const teamPort = Number(team.substring(portSplit + 1));
  return { name: teamName, address: teamAddress, port: teamPort };
});

const compiler = webpack(webpackConfig);
const app = express();
const server = http.createServer(app);
const sioNetwork = sio(server, {
  allowUpgrades: false,
  transports: ['websocket'],
});

// Start listening to the multicast/broadcast addresses
const udpServer = UDPServers.of(teamData);

// Whenever we get a new client connection let the UDP server know about it
sioNetwork.on('connection', (socket: sio.Socket) => {
  const off_cb = udpServer.on(
    socket.client.id,
    (event: string, ...args: any[]) => {
      socket.emit(event, ...args);
    },
  );
  socket.on('disconnect', (reason: string) => {
    console.log('Disconnected from a client');
    console.log(`Reason: ${reason}`);
    off_cb();
  });

  console.log('Connected to a new client');
});

const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/',
  index: 'index.html',
  stats: {
    colors: true,
  },
});

app.use(compression());
// We need to wrap the fallback history API with two instances of the dev middleware to handle the initial raw request
// and the following rewritten request.
// Refer to: https://github.com/webpack/webpack-dev-middleware/pull/44#issuecomment-170462282
app.use(devMiddleware);
app.use(history());
app.use(devMiddleware);
app.use(favicon(`${__dirname}/../assets/favicon.ico`));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log(`Server started at http://localhost:${port}`);
});
