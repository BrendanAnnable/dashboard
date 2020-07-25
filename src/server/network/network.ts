import dgram = require('dgram');

import { Clock } from '../../shared/time/clock';
import { NodeSystemClock } from '../time/node_clock';

import { LruPriorityQueue } from './lru_priority_queue';
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
    private processor: PacketProcessor,
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
    return new WebSocketServerClient(
      socket,
      PacketProcessor.of(socket),
      teamAAddress,
      teamBAddress,
    );
  }

  private onError = (error: Error) => {
    console.log('UDO server error:\n' + error.stack);
    this.udpServer.close();
    this.connected = false;
  };

  private onListen = () => {
    this.udpServer.addMembership(this.teamAAddress);
    this.udpServer.addMembership(this.teamBAddress);
  };

  private onMessage = (msg: string, rinfo: dgram.RemoteInfo) => {
    this.processor.onPacket(msg, rinfo);
  };

  private onClose = () => {
    this.udpServer.dropMembership(this.teamAAddress);
    this.udpServer.dropMembership(this.teamBAddress);
  };
}

class PacketProcessor {
  private outgoingPackets: number = 0;

  // The maximum number of packets to send before receiving acknowledgements.
  private outgoingLimit: number;

  // The number of seconds before giving up on an acknowledge
  private timeout: number;

  constructor(
    private socket: WebSocket,
    private clock: Clock,
    private queue: LruPriorityQueue<
      string,
      { packet: string; rinfo: dgram.RemoteInfo }
    >,
    { outgoingLimit, timeout }: { outgoingLimit: number; timeout: number },
  ) {
    this.outgoingLimit = outgoingLimit;
    this.timeout = timeout;
    this.queue = queue;
  }

  static of(socket: WebSocket) {
    return new PacketProcessor(
      socket,
      NodeSystemClock,
      new LruPriorityQueue({ capacityPerKey: 2 }),
      { outgoingLimit: 10, timeout: 5 },
    );
  }

  onPacket(packet: string, rinfo: dgram.RemoteInfo) {
    // Throttle unreliable packets so that we do not overwhelm the client with traffic.
    const key = `${rinfo.family}:${rinfo.address}:${rinfo.port}`;
    this.queue.add(key, { packet, rinfo });
    this.maybeSendNextPacket();
  }

  private maybeSendNextPacket() {
    if (this.outgoingPackets < this.outgoingLimit) {
      const next = this.queue.pop();
      if (next) {
        const { packet, rinfo } = next;
        let isDone = false;
        const done = () => {
          if (!isDone) {
            this.outgoingPackets--;
            isDone = true;
            this.maybeSendNextPacket();
          }
        };
        this.outgoingPackets++;
        this.socket.volatileSend(packet, rinfo, done);
        this.clock.setTimeout(done, this.timeout);
      }
    }
  }
}
