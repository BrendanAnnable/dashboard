import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FieldModel } from './model';

@observer
export class Field extends React.Component<{ model: FieldModel }> {
  render() {
    return (
      <g>
        {this.grass}
        {this.goals}
        {this.centerCircle}
        {this.centerMark}
        {this.halfwayLine}
        {this.fieldBorder}
        {this.goalAreas}
        {this.penaltyMarkers}
      </g>
    );
  }

  @computed
  private get grass() {
    const {
      model: {
        fieldColor,
        dimensions: { borderStripMinWidth, fieldWidth, fieldLength, goalDepth },
      },
    } = this.props;
    const height = fieldLength + borderStripMinWidth * 2 + goalDepth * 2;
    const width = fieldWidth + borderStripMinWidth * 2;
    const x = -fieldLength * 0.5 - goalDepth - borderStripMinWidth;
    const y = -fieldWidth * 0.5 - borderStripMinWidth;
    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fieldColor}
        rx={0.15}
      />
    );
  }

  @computed
  private get centerCircle() {
    const {
      model: {
        lineColor,
        dimensions: { centerCircleDiameter, lineWidth },
      },
    } = this.props;
    return (
      <circle
        r={centerCircleDiameter * 0.5}
        strokeWidth={lineWidth}
        stroke={lineColor}
        fill="none"
      />
    );
  }

  @computed
  private get centerMark() {
    const {
      model: {
        lineColor,
        dimensions: { lineWidth },
      },
    } = this.props;
    const width = lineWidth * 2;
    return (
      <>
        <line
          x1={0}
          y1={width}
          x2={0}
          y2={-width}
          stroke={lineColor}
          strokeWidth={width}
        />
        <line
          x1={width}
          y1={0}
          x2={-width}
          y2={0}
          stroke={lineColor}
          strokeWidth={width}
        />
      </>
    );
  }

  @computed
  private get halfwayLine() {
    const {
      model: {
        lineColor,
        dimensions: { fieldWidth, lineWidth },
      },
    } = this.props;
    return (
      <line
        x1={0}
        y1={fieldWidth / 2}
        x2={0}
        y2={-fieldWidth / 2}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
    );
  }

  @computed
  private get fieldBorder() {
    const {
      model: {
        lineColor,
        dimensions: { fieldWidth, fieldLength, lineWidth },
      },
    } = this.props;
    return (
      <Rect
        x={-fieldLength / 2}
        y={-fieldWidth / 2}
        width={fieldWidth}
        height={fieldLength}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
    );
  }

  @computed
  private get goalAreas() {
    const {
      model: {
        lineColor,
        dimensions: { fieldLength, goalAreaWidth, goalAreaLength, lineWidth },
      },
    } = this.props;
    const y = -goalAreaWidth * 0.5;
    const goalArea = (x: number) => (
      <Rect
        x={x}
        y={y}
        width={goalAreaWidth}
        height={goalAreaLength}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
    );
    return (
      <>
        {goalArea(fieldLength * 0.5 - goalAreaLength)}
        {goalArea(-fieldLength * 0.5)}
      </>
    );
  }

  @computed
  private get penaltyMarkers() {
    const {
      model: {
        lineColor,
        dimensions: { fieldLength, lineWidth, penaltyMarkDistance },
      },
    } = this.props;
    const marker = (x: number) => (
      <>
        <line
          x1={x + lineWidth}
          y1={0}
          x2={x - lineWidth}
          y2={0}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        <line
          x1={x}
          y1={lineWidth}
          x2={x}
          y2={-lineWidth}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
      </>
    );
    return (
      <>
        {marker(fieldLength * 0.5 - penaltyMarkDistance)}
        {marker(-(fieldLength * 0.5) + penaltyMarkDistance)}
      </>
    );
  }

  @computed
  private get goals() {
    const {
      model: {
        lineColor,
        redTeamColor,
        blueTeamColor,
        dimensions: { fieldLength, goalWidth, goalDepth, lineWidth },
      },
    } = this.props;
    const y = -goalWidth * 0.5;
    const goal = (x: number, color: string) => (
      <Rect
        x={x}
        y={y}
        width={goalWidth}
        height={goalDepth}
        stroke={lineColor}
        fill={color}
        strokeWidth={lineWidth}
      />
    );
    return (
      <>
        {goal(fieldLength * 0.5, redTeamColor)}
        {goal(-fieldLength * 0.5 - goalDepth, blueTeamColor)}
      </>
    );
  }
}

const Rect = React.memo(
  ({
    x,
    y,
    width: height,
    height: width,
    fill = 'none',
    stroke = 'none',
    strokeWidth,
    rx = 0,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    rx?: number;
  }) => (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      rx={rx}
    />
  ),
);
