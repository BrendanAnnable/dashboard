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

import { WebSocketProxyUDPServer } from './network/network';
import { WebSocketServer } from './network/web_socket_server';

const args = minimist(process.argv.slice(2));
const teamAAddress = args.team_a || '239.226.152.162';
const teamBAddress = args.team_b || '239.226.152.163';

const compiler = webpack(webpackConfig);
const app = express();
const server = http.createServer(app);
const sioNetwork = sio(server);

// Initialize socket.io namespace immediately to catch reconnections.
WebSocketProxyUDPServer.of(WebSocketServer.of(sioNetwork.of('/dashboard')), {
  teamAAddress,
  teamBAddress,
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
