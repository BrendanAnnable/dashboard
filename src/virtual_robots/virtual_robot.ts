import { TeamData } from '../server/network/network';
import dgram from 'dgram';
import ip6addr from 'ip6addr';

import { Simulator } from './simulator';

export class VirtualRobot {
  private socket: dgram.Socket;

  constructor(
    private readonly name: string,
    private readonly team: TeamData,
    private readonly simulators: Simulator[],
  ) {
    this.socket = dgram.createSocket({
      type: ip6addr.parse(team.address).kind() === 'ipv6' ? 'udp6' : 'udp4',
      reuseAddr: true,
    });
    this.socket.bind({ address: team.address, port: team.port });
  }

  static of({
    name,
    team,
    simulators,
  }: {
    name: string;
    team: TeamData;
    simulators: Simulator[];
  }) {
    return new VirtualRobot(name, team, simulators);
  }

  start(): () => void {
    const stops = this.simulators.map(simulator => simulator.start());
    return () => stops.forEach(stop => stop());
  }
}
