/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {Table, Scroll} from '@vadp/ui';
import styles from '../style/QueryContent.less';

import {pageSizeOptions} from '../../../common/AdminContacts';

export default class AuthorRoleQueryContent extends PureComponent {

  getColumns = () => {
    return [{
      title: '角色',
      dataIndex: 'name',
      width: '150px',
      className: 'vadp-table-small',
    }, {
      title: '单位',
      dataIndex: 'upOrgUnitName',
      width: '170px',
      className: 'vadp-table-small',
    }, {
      title: '系统',
      dataIndex: 'modName',
      width: '170px',
      className: 'vadp-table-small',
    }, {
      title: '模块',
      dataIndex: 'title',
      width: '170px',
      className: 'vadp-table-small',
    }, {
      title: '账套',
      dataIndex: 'copyName',
      className: 'vadp-table-small',
    }];
  }

  render() {
    const {authorMenus, pageSize, pageNum, recordCount, onPageChange, onShowSizeChange} = this.props;
    const y = window.innerHeight - 320;
    return (
      <Scroll className={styles.queryContent} type="table">
        <Table
          locale={{emptyText: ''}}
          // rowClassName={tableSize}
          bordered
          showHeader
          columns={this.getColumns()}
          pagination={{
            pageSizeOptions,
            onShowSizeChange,
            showSizeChanger: true,
            pageSize,
            current: pageNum,
            hideOnSinglePage: true,
            total: recordCount,
            showQuickJumper: true,
            onChange: onPageChange,
            size: 'default',
          }}
          scroll={{x: true, y}}
          dataSource={authorMenus}
          rowKey={record => record.id}/>
        </Scroll>
    );
  }
}
