import compression from 'compression';
import history from 'connect-history-api-fallback';
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import favicon from 'serve-favicon';
import sio from 'socket.io';
import fs from 'fs';
import yaml from 'yaml';

import { UDPServers } from './network/network';
import { TeamData } from './network/network';

// If the config file exists read it in instead of reading from the command line
let teamData: TeamData[] = [];
const stats = fs.statSync('config.yaml');
if (!stats.isFile()) {
  console.log(
    'Could not find config.yaml. Defaulting to command line team specification',
  );
  // Process command line arguments
  const args = minimist(process.argv.slice(2));

  // Get all of the teams from the command line
  // Fall back to our defaults if none were specified
  // The list of arguments should be a multiple of 3
  // <team name> <multicast address> <port> <team name> <multicast address> <port>
  let teams = args._;
  if (teams.length === 0 || teams.length % 3 !== 0) {
    teams = [
      'Red Team',
      '239.226.152.162',
      '9917',
      'Blue Team',
      '239.226.152.163',
      '9917',
    ];
  }

  // Convert command line data into a more usable format
  // Command line data is expected to be a space-separated list of team data
  // <team name> <multicast address> <port> <team name> <multicast address> <port>
  for (let i = 0; i <= teams.length - 3; i += 3) {
    teamData.push({
      name: teams[i],
      address: teams[i + 1],
      port: Number(teams[i + 2]),
    });
  }
} else {
  console.log('Using config.yaml for team specification');
  teamData = yaml.parse(
    fs.readFileSync('config.yaml', { encoding: 'utf8', flag: 'r' }),
  )['teams'];
}

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
