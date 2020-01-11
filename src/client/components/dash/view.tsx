import { action } from 'mobx';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { DashboardModel } from './model';
import styles from './styles.css';

@observer
export class Dashboard extends React.Component<{
  model: DashboardModel;
  Field: React.ComponentType;
  Robots: React.ComponentType;
}> {
  render() {
    const {
      Field,
      Robots,
      model: { flipped },
    } = this.props;
    return (
      <div className={styles.dashboard} onKeyDown={this.onKeyDown} tabIndex={0}>
        <svg
          className={styles.svg}
          preserveAspectRatio="xMidYMid meet"
          viewBox={this.viewBox}
        >
          <g transform={`scale(1, -1) rotate(${flipped ? '180' : '0'})`}>
            <Field />
            <Robots />
          </g>
        </svg>
      </div>
    );
  }

  @computed
  private get viewBox() {
    const {
      model: {
        field: {
          dimensions: {
            borderStripMinWidth,
            fieldWidth,
            fieldLength,
            goalDepth,
          },
        },
      },
    } = this.props;
    const height = fieldLength + borderStripMinWidth * 2 + goalDepth * 2;
    const width = fieldWidth + borderStripMinWidth * 2;
    return `-${height / 2} -${width / 2} ${height} ${width}`;
  }

  @action.bound
  private onKeyDown(e: React.KeyboardEvent<unknown>) {
    if (e.key === 'f') {
      this.props.model.flipped = !this.props.model.flipped;
    }
  }
}
