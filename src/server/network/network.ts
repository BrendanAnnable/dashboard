import dgram = require('dgram');
import dns = require('dns');

export type ClientListener = (event: string, ...args: any[]) => void;

export type TeamData = {
  name: string;
  address: string;
  port: number;
};

type Listener = {
  server: dgram.Socket;
  ipv6: boolean;
  team: TeamData;
};

export class UDPServer {
  private listeners: Array<Listener>;
  private clients: Map<string, ClientListener>;

  constructor(teams: Array<TeamData>) {
    this.clients = new Map<string, ClientListener>();
    this.listeners = new Array<Listener>();

    teams.forEach((team: TeamData) => {
      // Determine if we are listening on a IPv4 or IPv6 address and resolve any DNS names
      dns.lookup(
        team.address,
        { family: 0, all: false },
        (
          error: NodeJS.ErrnoException | null,
          address: string,
          family: number,
        ) => {
          if (family === 6) {
            const listener = {
              server: dgram.createSocket({ type: 'udp6', reuseAddr: true }),
              ipv6: true,
              team: {
                name: team.name,
                address: address,
                port: team.port,
              },
            };
            this.initialiseListener(listener);
            this.listeners.push(listener);
          } else if (family === 4) {
            const listener = {
              server: dgram.createSocket({ type: 'udp4', reuseAddr: true }),
              ipv6: false,
              team: {
                name: team.name,
                address: address,
                port: team.port,
              },
            };
            this.initialiseListener(listener);
            this.listeners.push(listener);
          } else {
            console.log(
              `UDPServer encountered an error resolving a DNS address: Error:\n${error?.stack}`,
            );
          }
        },
      );
    });
  }

  static of(teams: Array<TeamData>) {
    return new UDPServer(teams);
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

  // Set up callbacks for a given team and then bind the team to its multicast address and port
  private initialiseListener = (listener: Listener) => {
    listener.server.on('listening', () => {
      // Add multicast membership if we are using a multicast address
      if (listener.ipv6) {
        // IPv6 multicast addresses start with 0xFF00
        if (listener.team.address.split(':')[0].toUpperCase() === 'FF00') {
          listener.server.addMembership(listener.team.address);
        }
      } else {
        // IPv4 multicast addresses start with 0xE
        const octet = Number(listener.team.address.split('.')[0])
          .toString(16)
          .toUpperCase();
        if (octet.startsWith('E')) {
          listener.server.addMembership(listener.team.address);
        }
      }
      const address = listener.server.address();
      console.log(
        `${listener.team.name} UDP Server: Listening on ${address.address}:${address.port}`,
      );
    });
    listener.server.on('error', (error: Error) => {
      console.log(`${listener.team.name} UDP Server: Error:\n${error.stack}`);
      listener.server.close();
    });
    listener.server.on('message', (packet: Buffer, rinfo: dgram.RemoteInfo) => {
      console.log(
        `${listener.team.name} UDP Server: Received a message from ${rinfo.family}:${rinfo.address}:${rinfo.port}`,
      );
      this.clients.forEach((emit_cb: ClientListener) => {
        emit_cb('udp_packet', {
          payload: packet,
          team: {
            name: listener.team.name,
            address: listener.team.address,
            port: listener.team.port,
          },
          rinfo: {
            family: rinfo.family,
            address: rinfo.address,
            port: rinfo.port,
          },
        });
      });
    });
    listener.server.on('close', () => {
      console.log('${team.name} UDP Server: Closed');
    });
    listener.server.bind({ port: 9917, address: listener.team.address });
  };
}
