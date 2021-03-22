// import { DashboardSimulator } from './simulators/vision_simulator';
import { TeamData } from '../server/network/network';
import { VirtualRobot } from './virtual_robot';

export class Team {
  private robots: VirtualRobot[];
  private data: TeamData;

  constructor({
    robots,
    teamData,
  }: {
    robots: VirtualRobot[];
    teamData: TeamData;
  }) {
    this.robots = robots;
    this.data = teamData;
  }

  static of({
    teamData,
    numRobots,
  }: {
    teamData: TeamData;
    numRobots: number;
  }) {
    const robots = Array.from({ length: numRobots }, (_, i) => {
      return VirtualRobot.of({
        name: `Virtual Robot ${i + 1}`,
        team: teamData,
        simulators: [
          //   DashboardSimulator.of({ send }),
        ],
      });
    });
    return new Team({ robots, teamData });
  }

  start(): () => void {
    const stops = this.robots.map(robot => robot.start());
    return () => stops.forEach(stop => stop());
  }
}
