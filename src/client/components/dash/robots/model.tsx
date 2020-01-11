import { observable } from 'mobx';
import { Matrix3 } from '../../../math/matrix3';
import { Vector2 } from '../../../math/vector2';
import { Vector3 } from '../../../math/vector3';

export class DashboardRobotModel {
  playerId?: number;
  position?: Vector3;
  color?: string;

  // The robots current state
  state?: State;

  // Position, orientation, and covariance of the player on the field
  current_pose?: Robot;

  // The current walk speed of the robot in it's local [x, y, θ] coordinates
  // x and y in m/s and θ in rad/s
  // positive x being forwards, positive y being strafing to the left, and positive θ being anti-clockwise
  walk_command?: Vector3;

  // Position and orientation of the players target on the field specified
  target_pose?: Robot;

  // Position that the robot is aiming to kick the ball to
  // If no kick is planned set to [0, 0]
  // Vector has origin on the ground between the robots feet
  kick_target?: Vector2;

  // Position, velocity, and covariance of the ball on the field
  ball?: Ball;

  // Position, orientation, and covariance of detected robots on the field
  others?: Robot[];

  static of() {
    return new DashboardRobotModel();
  }
}

class Robot {
  @observable.ref playerId: number;
  @observable.ref position: Vector3;
  @observable.ref velocity: Vector3;
  @observable.ref covariance: Matrix3;
  @observable.ref team: Team;

  constructor({
    playerId,
    position,
    velocity,
    covariance,
    team,
  }: {
    playerId: number;
    position: Vector3;
    velocity: Vector3;
    covariance: Matrix3;
    team: Team;
  }) {
    this.playerId = playerId;
    this.position = position;
    this.velocity = velocity;
    this.covariance = covariance;
    this.team = team;
  }
}

class Ball {
  @observable.ref position: Vector3;
  @observable.ref velocity: Vector3;
  @observable.ref covariance: Matrix3;

  constructor({
    position,
    velocity,
    covariance,
  }: {
    position: Vector3;
    velocity: Vector3;
    covariance: Matrix3;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.covariance = covariance;
  }
}

enum Team {
  Unknown,
  Blue,
  Red,
}

const enum State {
  Unknown,
  Unpenalised,
  Penalised,
}
