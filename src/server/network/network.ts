import dgram from 'dgram';
import dns from 'dns';
import ip6addr from 'ip6addr';

export type ClientListener = (event: string, ...args: any[]) => void;
export type MessageCallback = (
  team: TeamData,
  payload: Buffer,
  rinfo: dgram.RemoteInfo,
) => void;

export type TeamData = {
  name: string;
  address: string;
  port: number;
};

export class UDPServers {
  private servers: UDPServer[];
  private clients: Map<string, ClientListener>;

  constructor(teams: TeamData[]) {
    this.clients = new Map<string, ClientListener>();
    this.servers = [];

    teams.forEach((team: TeamData) => {
      // Determine if we are listening on a IPv4 or IPv6 address and resolve any DNS address
      // If the specified address can be resolved to an IPv4 address prefer that over an IPv6 address
      dns.lookup(
        team.address,
        { family: 0, all: true, hints: dns.ADDRCONFIG | dns.V4MAPPED },
        (
          error: NodeJS.ErrnoException | null,
          addresses: dns.LookupAddress[],
        ) => {
          if (error) {
            throw `UDPServer encountered an error resolving a DNS address: Error: ${error.code}\n${error.stack}`;
          } else {
            // Filter returned addresses into either IPv4 or IPv6
            const ipv4 = addresses.filter(v => v.family === 4);
            const ipv6 = addresses.filter(v => v.family === 6);

            // Prefer IPv4 addresses
            if (ipv4.length > 0 || ipv6.length > 0) {
              this.servers.push(
                UDPServer.of(
                  {
                    name: team.name,
                    address:
                      ipv4.length > 0 ? ipv4[0].address : ipv6[0].address,
                    port: team.port,
                  },
                  (
                    team: TeamData,
                    payload: Buffer,
                    rinfo: dgram.RemoteInfo,
                  ) => {
                    this.onMessage(team, payload, rinfo);
                  },
                ),
              );
            }
          }
        },
      );
    });
  }

  static of(teams: TeamData[]) {
    return new UDPServers(teams);
  }

  // Add a new client to our list of clients
  on(client: string, emitCB: ClientListener) {
    // If the client is already in our list, remove it
    if (this.clients.has(client)) {
      this.clients.delete(client);
    }

    // Add the client
    this.clients.set(client, emitCB);

    // Return the off callback
    return () => this.clients.delete(client);
  }

  // One of the UDP servers received a new message, send it on to all clients
  private onMessage(team: TeamData, packet: Buffer, rinfo: dgram.RemoteInfo) {
    for (let emitCB of this.clients.values()) {
      emitCB('udp_packet', {
        payload: packet,
        team: {
          name: team.name,
          address: team.address,
          port: team.port,
        },
        rinfo: {
          family: rinfo.family,
          address: rinfo.address,
          port: rinfo.port,
        },
      });
    }
  }
}

class UDPServer {
  private socket: dgram.Socket;

  constructor(private team: TeamData, private msgCB: MessageCallback) {
    this.socket = dgram.createSocket({
      type: ip6addr.parse(team.address).kind() === 'ipv6' ? 'udp6' : 'udp4',
      reuseAddr: true,
    });

    this.socket.on('listening', () => {
      // Add multicast membership if we are using a multicast address
      if (
        ip6addr.createCIDR('224.0.0.0/4').contains(team.address) ||
        ip6addr.createCIDR('ff00::/8').contains(team.address)
      ) {
        this.socket.addMembership(team.address);
      }
      const address = this.socket.address();
      console.log(
        `${team.name} UDP Server: Listening on ${address.address}:${address.port}`,
      );
    });

    this.socket.on('error', (error: Error) => {
      console.log(`${team.name} UDP Server: Error:\n${error.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (packet: Buffer, rinfo: dgram.RemoteInfo) => {
      console.log(
        `${team.name} UDP Server: Received a message from ${rinfo.family}:${rinfo.address}:${rinfo.port}`,
      );
      console.log({ packet, parsed: JSON.parse(packet.toString()) });
      this.msgCB(this.team, packet, rinfo);
    });

    this.socket.on('close', () => {
      console.log('${team.name} UDP Server: Closed');
    });

    this.socket.bind({ port: team.port, address: team.address });
  }

  static of(team: TeamData, msg_cb: MessageCallback) {
    return new UDPServer(team, msg_cb);
  }
}
