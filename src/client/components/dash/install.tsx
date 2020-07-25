import React from 'react';
import { Vector3 } from '../../math/vector3';
import { Field as FieldImpl } from './field';
import { DashboardModel } from './model';
import { DashboardRobotModel } from './robots/model';
import { Robots as RobotsImpl } from './robots/view';
import { Dashboard } from './view';

export function installDash(): {
  Dashboard: React.ComponentType;
} {
  const model = DashboardModel.of([
    DashboardRobotModel.of(),
    DashboardRobotModel.of(),
    DashboardRobotModel.of(),
  ]);
  model.robots[0].position = new Vector3(1, 2, 0);
  model.robots[0].playerId = 1;
  model.robots[0].color = '#a72a2a';
  model.robots[1].position = new Vector3(-2, 1, Math.PI);
  model.robots[1].playerId = 2;
  model.robots[1].color = '#4930bb';
  model.robots[2].position = new Vector3(3, -2, Math.PI / 4);
  model.robots[2].playerId = 3;
  const Field = () => <FieldImpl model={model.field} />;
  const Robots = () => <RobotsImpl model={model} />;
  return {
    Dashboard: () => <Dashboard Field={Field} Robots={Robots} model={model} />,
  };
}
