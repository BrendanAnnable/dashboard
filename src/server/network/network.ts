import dgram = require('dgram');

export type ClientListener = (event: string, ...args: any[]) => void;

export class UDPServer {
  private udpServer: dgram.Socket;
  private clients: Map<string, ClientListener>;

  constructor(private redTeamAddress: string, private blueTeamAddress: string) {
    this.clients = new Map();
    this.redTeamAddress = redTeamAddress;
    this.blueTeamAddress = blueTeamAddress;

    // Create a UDP4 socket. Reuse the address in the event another process is already using it
    this.udpServer = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.udpServer.on('error', this.onError);
    this.udpServer.on('listening', this.onListen);
    this.udpServer.on('message', this.onMessage);
    this.udpServer.on('close', this.onClose);

    // Bind to a random port and listen on all addresses
    this.udpServer.bind(59790);
  }

  static of(redTeamAddress: string, blueTeamAddress: string) {
    return new UDPServer(redTeamAddress, blueTeamAddress);
  }

  // Add a new client to our list of clients
  on(client: string, emit_cb: ClientListener) {
    // If the client is already in our list, remove it
    if (this.clients.has(client)) {
      this.clients.delete(client);
    }

    // Add the client
    this.clients.set(client, emit_cb);

    // Return the off callback
    return () => this.clients.delete(client);
  }

  clientsCount() {
    return this.clients.keys.length;
  }

  private onError = (error: Error) => {
    console.log(`UDP server error:\n${error.stack}`);
    this.udpServer.close();
  };

  private onListen = () => {
    // Make sure we are listening to the red team
    this.udpServer.addMembership(this.redTeamAddress);
    const address = this.udpServer.address();
    console.log(
      `UDP server listening on ${this.redTeamAddress}:${address.port}`,
    );

    // Make sure we are listening to the blue team
    this.udpServer.addMembership(this.blueTeamAddress);
    console.log(
      `UDP server listening on ${this.blueTeamAddress}:${address.port}`,
    );
  };

  // We have a new message from one of the teams. Send it on to all clients
  private onMessage = (msg: string, rinfo: dgram.RemoteInfo) => {
    console.log(
      `Received message from ${rinfo.family}:${rinfo.address}:${rinfo.port}`,
    );
    for (let emit_cb of this.clients.values()) {
      emit_cb('udp_packet', {
        payload: msg,
        rinfo: {
          family: rinfo.family,
          address: rinfo.address,
          port: rinfo.port,
        },
      });
    }
  };

  // Time to close up shop
  private onClose = () => {
    console.log('Closing UDP server');
    this.udpServer.dropMembership(this.redTeamAddress);
    this.udpServer.dropMembership(this.blueTeamAddress);
    this.clients.clear();
  };
}
