import { observable } from 'mobx';
import { DashboardRobotModel } from './robots/model';

export class DashboardModel {
  readonly field: FieldModel;
  readonly robots: DashboardRobotModel[];
  @observable.ref flipped: boolean;

  constructor({
    field,
    robots,
    flipped,
  }: {
    field: FieldModel;
    robots: DashboardRobotModel[];
    flipped: boolean;
  }) {
    this.field = field;
    this.robots = robots;
    this.flipped = flipped;
  }

  static of(robots: DashboardRobotModel[]) {
    return new DashboardModel({
      field: FieldModel.of(),
      robots,
      flipped: false,
    });
  }
}

export class FieldModel {
  @observable dimensions: FieldDimensions;
  @observable fieldColor: string;
  @observable lineColor: string;
  @observable redTeamColor: string;
  @observable blueTeamColor: string;

  constructor({
    dimensions,
    fieldColor,
    lineColor,
    redTeamColor,
    blueTeamColor,
  }: FieldModel) {
    this.blueTeamColor = blueTeamColor;
    this.dimensions = dimensions;
    this.fieldColor = fieldColor;
    this.lineColor = lineColor;
    this.redTeamColor = redTeamColor;
  }

  static of() {
    return new FieldModel({
      dimensions: FieldDimensions.postYear2017(),
      fieldColor: '#0ca52a',
      lineColor: '#ffffff',
      redTeamColor: '#a72a2a',
      blueTeamColor: '#4930bb',
    });
  }
}

interface FieldModelValues {
  lineWidth: number;
  markWidth: number;
  fieldLength: number;
  fieldWidth: number;
  goalDepth: number;
  goalWidth: number;
  goalAreaLength: number;
  goalAreaWidth: number;
  goalCrossbarHeight: number;
  goalPostDiameter: number;
  goalNetHeight: number;
  penaltyMarkDistance: number;
  centerCircleDiameter: number;
  borderStripMinWidth: number;
}

export class FieldDimensions {
  @observable lineWidth: number;
  @observable markWidth: number;
  @observable fieldLength: number;
  @observable fieldWidth: number;
  @observable goalDepth: number;
  @observable goalWidth: number;
  @observable goalAreaLength: number;
  @observable goalAreaWidth: number;
  @observable goalCrossbarHeight: number;
  @observable goalPostDiameter: number;
  @observable goalNetHeight: number;
  @observable penaltyMarkDistance: number;
  @observable centerCircleDiameter: number;
  @observable borderStripMinWidth: number;

  constructor(values: FieldModelValues) {
    this.lineWidth = values.lineWidth;
    this.markWidth = values.markWidth;
    this.fieldLength = values.fieldLength;
    this.fieldWidth = values.fieldWidth;
    this.goalDepth = values.goalDepth;
    this.goalWidth = values.goalWidth;
    this.goalAreaLength = values.goalAreaLength;
    this.goalAreaWidth = values.goalAreaWidth;
    this.goalCrossbarHeight = values.goalCrossbarHeight;
    this.goalPostDiameter = values.goalPostDiameter;
    this.goalNetHeight = values.goalNetHeight;
    this.penaltyMarkDistance = values.penaltyMarkDistance;
    this.centerCircleDiameter = values.centerCircleDiameter;
    this.borderStripMinWidth = values.borderStripMinWidth;
  }

  static postYear2017() {
    return new FieldDimensions({
      lineWidth: 0.06,
      markWidth: 0.1,
      fieldLength: 9,
      fieldWidth: 6,
      goalDepth: 0.6,
      goalWidth: 2.6,
      goalAreaLength: 1,
      goalAreaWidth: 5,
      goalCrossbarHeight: 1.8,
      goalPostDiameter: 0.1,
      goalNetHeight: 1,
      penaltyMarkDistance: 2.05,
      centerCircleDiameter: 1.56,
      borderStripMinWidth: 0.7,
    });
  }
}
