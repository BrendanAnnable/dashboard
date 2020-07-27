import dgram = require('dgram');

export type ClientListener = (event: string, ...args: any[]) => void;

type TeamData = {
  server: dgram.Socket;
  name: string;
  address: string;
  port: number;
};

export class UDPServer {
  private redTeam: TeamData;
  private blueTeam: TeamData;
  private clients: Map<string, ClientListener>;

  constructor(redTeamAddress: string, blueTeamAddress: string) {
    this.clients = new Map();

    this.redTeam = {
      server: dgram.createSocket({ type: 'udp4', reuseAddr: true }),
      name: 'Red Team',
      address: redTeamAddress,
      port: 9917,
    };
    this.blueTeam = {
      server: dgram.createSocket({ type: 'udp4', reuseAddr: true }),
      name: 'Blue Team',
      address: blueTeamAddress,
      port: 9917,
    };

    this.initTeam(this.redTeam);
    this.initTeam(this.blueTeam);
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

  // Set up callbacks for a given team and then bind the team to its multicast address and port
  private initTeam = (team: TeamData) => {
    team.server.on('listening', () => {
      team.server.addMembership(team.address);
      const address = team.server.address();
      console.log(
        `${team.name} UDP Server: Listening on ${address.address}:${address.port}`,
      );
    });
    team.server.on('error', (error: Error) => {
      console.log(`${team.name} UDP Server: Error:\n${error.stack}`);
      team.server.close();
    });
    team.server.on('message', (packet: Buffer, rinfo: dgram.RemoteInfo) => {
      console.log(
        `${team.name} UDP Server: Received a message from ${rinfo.family}:${rinfo.address}:${rinfo.port}`,
      );
      for (let emit_cb of this.clients.values()) {
        emit_cb('udp_packet', {
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
    });
    team.server.on('close', () => {
      console.log('${team.name} UDP Server: Closed');
    });
    team.server.bind({ port: 9917, address: team.address });
  };
}
