/**
 * Created by huangzhangshu on 2020/1/16
 */
import React, {Component} from 'react';
import styles from './index.less';

export default class TableTitle extends Component {

  render() {
    const {title, required} = this.props;
    const className = required ? styles.tableTitle : '';
    return (
      <div className={className}>
        <span>{title}</span>
      </div>
    );
  }
}
