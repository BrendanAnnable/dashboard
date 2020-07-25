import dgram = require('dgram');

import { WebSocketServer } from './web_socket_server';
import { WebSocket } from './web_socket_server';

type Opts = {
  teamAAddress: string;
  teamBAddress: string;
};

/**
 * The server component of a UDP proxy running over web sockets. Acts as a gateway to the UDP network.
 * All clients currently share a single UDP connection, mostly for performance reasons. Could potentially be
 * improved to have more intelligent multiplexing.
 */
export class WebSocketProxyUDPServer {
  constructor(
    private server: WebSocketServer,
    private teamAAddress: string,
    private teamBAddress: string,
  ) {
    server.onConnection(this.onClientConnection);
    this.teamAAddress = teamAAddress;
    this.teamBAddress = teamBAddress;
  }

  static of(
    server: WebSocketServer,
    { teamAAddress, teamBAddress }: Opts,
  ): WebSocketProxyUDPServer {
    return new WebSocketProxyUDPServer(server, teamAAddress, teamBAddress);
  }

  private onClientConnection = (socket: WebSocket) => {
    WebSocketServerClient.of(socket, this.teamAAddress, this.teamBAddress);
  };
}

class WebSocketServerClient {
  private connected: boolean;
  private offListenMap: Map<string, () => void>;
  private udpServer: dgram.Socket;

  constructor(
    private socket: WebSocket,
    private teamAAddress: string,
    private teamBAddress: string,
  ) {
    this.connected = false;
    this.offListenMap = new Map();
    this.teamAAddress = teamAAddress;
    this.teamBAddress = teamBAddress;

    // Create a UDP4 socket. Reuse the address in the event another process is already using it
    this.udpServer = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.udpServer.on('error', this.onError);
    this.udpServer.on('listening', this.onListen);
    this.udpServer.on('message', this.onMessage);
    this.udpServer.on('close', this.onClose);

    // Bind to a random port and listen on all addresses
    this.udpServer.bind();
  }

  static of(socket: WebSocket, teamAAddress: string, teamBAddress: string) {
    return new WebSocketServerClient(socket, teamAAddress, teamBAddress);
  }

  private onError = (error: Error) => {
    console.log(`UDP server error:\n${error.stack}`);
    this.udpServer.close();
    this.connected = false;
  };

  private onListen = () => {
    this.udpServer.addMembership(this.teamAAddress);
    const address = this.udpServer.address();
    console.log(`UDP server listening on ${this.teamAAddress}:${address.port}`);
    this.udpServer.addMembership(this.teamBAddress);
    console.log(`UDP server listening on ${this.teamBAddress}:${address.port}`);
  };

  private onMessage = (msg: string, rinfo: dgram.RemoteInfo) => {
    console.log(
      `Received message from ${rinfo.family}:${rinfo.address}:${rinfo.port}`,
    );
    this.socket.send(
      'udp_packet',
      JSON.stringify({
        payload: msg,
        rinfo: {
          family: rinfo.family,
          address: rinfo.address,
          port: rinfo.port,
        },
      }),
    );
  };

  private onClose = () => {
    console.log('Closing UDP server');
    this.udpServer.dropMembership(this.teamAAddress);
    this.udpServer.dropMembership(this.teamBAddress);
  };
}
