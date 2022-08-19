/**
 * Created by huangzhangshu on 2018/3/26
 */
import React, {PureComponent} from 'react';
import {Layout, Table, Tooltip, Icon, Title, Scroll} from '@vadp/ui';
import styles from './index.less';

const {Sider} = Layout;

export default class SiderMenu extends PureComponent {

  findColumns() {
    const {onRowClick} = this.props;
    return [{
      dataIndex: 'code',
      title: '组织编码',
      className: 'unitCodeRightBorder',
      render: (text, record) =>
        <div className={styles.columnIdTextLayout}>
          <a
            className={styles.columnIdText}
            onClick={() => onRowClick(record)}>{text}</a>
        </div>,
    }, {
      dataIndex: 'name',
      title: '组织名称',
      width: '60%',
      render: (text) => {
        return <div className={styles.columnNameTextLayout}>
          {text.length >= 10 ?
            <Tooltip placement="right" title={text}><span
              className={styles.columnNameText}>{text}</span></Tooltip> :
            <span className={styles.columnNameText}>{text}</span>}
        </div>;
      },
    }];
  }

  renderHeaderButtons(buttons) {
    return buttons.map((data, index) => {
      return (
        <a onClick={data.onClick} key={index}>
          <Icon type={data.icon} key={index} style={{fontSize: 18}}/>
        </a>
      );
    });
  }

  renderMenuHeader() {
    const {title, buttons} = this.props;
    return (
      <div className={styles.header}>
        <Title text={title}/>
        <div className={styles.buttonContainer}>
          {this.renderHeaderButtons(buttons)}
        </div>
      </div>
    );
  }

  render() {
    const {content, rowSelection} = this.props;
    return (
      <Scroll type="table">
        <Sider className={styles.adminSiderMenu} width={280}>
          {this.renderMenuHeader()}
          <Table
            locale={{emptyText: ''}}
            scroll={{x: true, y: document.body.clientHeight - 205}}
            className={styles.tableBorder}
            rowKey={(row) => row.id}
            showHeader
            pagination={false}
            bordered={false}
            size="default"
            columns={this.findColumns()}
            dataSource={content}
            rowSelection={rowSelection}/>
        </Sider>
      </Scroll>
    );
  };
}
