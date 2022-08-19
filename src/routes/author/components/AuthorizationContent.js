/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {Table} from '@vadp/ui';
import {connect} from 'dva';
import styles from '../style/AuthorizationContent.less';
import {arrayToTree} from '../../../utils';

const indexOf = function (array, val) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === val) return i;
  }
  return -1;
};

const remove = function (array, val) {
  var index = indexOf(array, val);
  if (index > -1) {
    array.splice(index, 1);
  }
};

function unique(array) {
  var r = [];
  for (var i = 0, l = array.length; i < l; i++) {
    for (var j = i + 1; j < l; j++)
      if (array[i] == array[j]) j == ++i;
    r.push(array[i]);
  }
  return r;
}

class AuthorizationContent extends PureComponent {
  /**
   * 获取行
   * @returns {*[]}
   */
  getColumns = () => {
    const columns = [{
      title: 'title',
      dataIndex: 'title',
      key: 'title',
      render: (title, {id, description, parentId}) => {
        if(!parentId) return <span>{title}</span>
        return <span>{title}<span style={{marginLeft: 12}}>{id}</span><span style={{marginLeft: 12}}>{description}</span></span>
      }
    }];
    return columns;
  }

  /**
   * 根据id获取实体
   * @param id
   * @returns {*}
   */
  getRecordById = (id, data) => {
    for (const menu of data) {
      if (menu.id === id) {
        return menu;
      }
      const {children} = menu;
      if (children) {
        const record = this.getRecordById(id, children);
        if (record && record.id) return record;
      }
    }
    return {};
  }

  /**
   * 选择回调事件
   * @returns {{selectedRowKeys: Array, onSelect: onSelect}}
   */
  getRowSelection = () => {
    const {selectedRowKeys, authorMenus, updateKeys} = this.props;
    const rowSelection = {
      selectedRowKeys,
      onSelect: (record, selected) => {
        const childrenIds = this.getChildrenByRecord(record);
        const parentIds = this.getParentByRecord(record.parentId);
        if (selected) {
          const keys = unique(selectedRowKeys.concat(childrenIds).concat(parentIds));
          updateKeys(keys);
        } else {
          const selectedKeys = [...selectedRowKeys];
          for (const id of childrenIds) {
            remove(selectedKeys, id);
          }
          for (const id of parentIds) {
            const tree = arrayToTree(authorMenus, 'id', 'parentId', 'children');
            if (!this.hasSelectedChildren(selectedKeys, this.getRecordById(id, tree))) {
              remove(selectedKeys, id);
            }
          }
          updateKeys(unique(selectedKeys));
        }
      },
    };
    return rowSelection;
  }

  /**
   * 获取子节点
   * @param record
   * @returns {Array}
   */
  getChildrenByRecord = (record) => {
    let ids = [];
    ids.push(record.id);
    if (record.children) {
      const {children} = record;
      for (const c of children) {
        ids.push(c.id);
        if (c.children) ids = ids.concat(...this.getChildrenByRecord(c));
      }
    }
    return unique(ids);
  }

  /**
   * 获取父节点
   * @param parentId
   * @returns {Array}
   */
  getParentByRecord = (parentId) => {
    const {authorMenus} = this.props;
    const menus = authorMenus;
    let ids = [];
    if (parentId && parentId !== -1) {
      for (const menu of menus) {
        if (menu.id === parentId) {
          ids.push(menu.id);
          if (menu.parentId) ids = ids.concat(...this.getParentByRecord(menu.parentId));
        }
      }
    }
    return unique(ids);
  }

  /**
   * 判断是否有子节点被选中
   * @param selectedKeys
   * @param parentId
   * @returns {boolean}
   */
  hasSelectedChildren = (selectedKeys, record = {}) => {
    const childrenIds = this.getChildrenByRecord(record) || [];
    for (const childrenId of childrenIds) {
      for (const id of selectedKeys) {
        if (childrenId === id && childrenId !== record.id) {
          return true;
        }
      }
    }
    return false;
  }

  render() {
    const {authorMenus, expandedRowKeys = []} = this.props;
    const dataSource = arrayToTree(authorMenus || [], 'id', 'parentId');
    const y = document.body.clientHeight - 230;
    const tableKey = expandedRowKeys.length ? expandedRowKeys[0] : 'initialAuthorTable';
    return (
      <Table
        bordered
        key={tableKey}
        locale={{emptyText: ''}}
        className={styles.table}
        pagination={false}
        defaultExpandAllRows
        showHeader={false}
        columns={this.getColumns()}
        rowSelection={this.getRowSelection()}
        // expandedRowKeys={expandedRowKeys}
        dataSource={dataSource}
        scroll={{x: true, y}}
        rowKey={record => record.id}/>
    );
  }
}

function mapStateToProps(state) {
  return {size: state.global.size};
}

export default connect(mapStateToProps)(AuthorizationContent);
