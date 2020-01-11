import React from 'react';
import { DashboardModel } from '../model';
import { DashboardRobotModel } from './model';

export class Robots extends React.Component<{ model: DashboardModel }> {
  render() {
    const {
      model: { robots },
    } = this.props;
    return (
      <g>
        {robots.map(robot => (
          <RobotMarker key={robot.playerId} model={robot} />
        ))}
      </g>
    );
  }
}

export class RobotMarker extends React.Component<{
  model: DashboardRobotModel;
}> {
  render() {
    const {
      model: { playerId, color, position },
    } = this.props;
    if (!position) {
      return null;
    }
    const { x, y, z: rotation } = position;
    const radius = 0.15;
    return (
      <g transform={`translate(${x}, ${y})`}>
        <path
          transform={`scale(${radius}) rotate(${(180 * rotation) / Math.PI +
            135})`}
          d="M-1 -1L0 -1A1 1 270 1 1 -1 0Z"
          fill={color ?? 'white'}
        />
        <text
          fontSize={0.25}
          paintOrder="stroke fill"
          stroke={'black'}
          strokeWidth={0.02}
          fill="white"
          fontWeight="bold"
          transform={'scale(1, -1)'}
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {playerId}
        </text>
      </g>
    );
  }
}
