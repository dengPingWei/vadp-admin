/**
 * Created by huangzhangshu on 2018/4/3
 */
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {Modal, Select, Table, Tooltip, Scroll, Input,Checkbox} from '@vadp/ui';
import styles from '../style/AllocationUser.less';

const Option = Select.Option;
const Search = Input.Search;


export default class AllocationUserModal extends PureComponent {

  state = {
    y: 310,
  }

  componentDidMount() {
    const {cleanSearchUser,cleanCheckHaveUer} = this.props;
    cleanSearchUser();
    cleanCheckHaveUer();
  }

  getColumns = () => {
    return [
      {
        title: '用户名',
        dataIndex: 'account',
        key: 'account',
        width: '150px',
        className: 'vadp-table-small',
        render: (account) => {
          return account.length >= 15 ? <Tooltip title={account}>
              <span className={styles.userColumnNameText}>{account}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{account}</span>;
        },
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: '150px',
        className: 'vadp-table-small',
        render: (name) => {
          return name.length >= 15 ? <Tooltip title={name}>
              <span className={styles.userColumnNameText}>{name}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{name}</span>;
        },
      },
      {
        title: '用户描述',
        dataIndex: 'description',
        key: 'description',
        className: 'vadp-table-small',
        render: (description = '') => {
          return (description && description.length >= 30) ? <Tooltip title={description}>
              <span className={styles.description}>{description}</span></Tooltip> :
            <span className={styles.description}>{description || '暂无描述信息'}</span>;
        },
      },
    ];
  }

  getDefaultUnits = (record) => {
    const ids = [];
    for (const unit of record) {
      ids.push(unit.id);
    }
    return ids;
  }

  handleChange = (value) => {
    const {updateAllocationSelectedRowKeysByFilter} = this.props;
    updateAllocationSelectedRowKeysByFilter(value);
  }

  unitChange = (data, value) => {
    const {updateColumnUnit} = this.props;
    const unit = {...data, unitIds: value};
    updateColumnUnit(unit);
  }

  changeUser = (e) => {
    const {updateSearchUser} = this.props;
    updateSearchUser(e.target.value);
  }

  changeHaveUser = (e) => {
    const {updateCheckHaveUer} = this.props;
    updateCheckHaveUer(e.target.checked);
  }

  searchUser = (value) => {
    const {searchUser} = this.props;
    searchUser(value);
  }

  filterSource = () => {
    const source = [];
    const {dataSource, allocationRole: {roleCode}} = this.props;
    for (const data of dataSource) {
      const {type} = data;
      if (roleCode === '1000') {
        if (type === '1') source.push(data);
      } else {
        source.push(data);
      }
    }
    return source;
  }

  renderUnits = (record = []) => {
    return record.map((unit) => {
      return <Option key={unit.id}>{unit.name}</Option>;
    });
  }

  render() {
    const {
      modalProps, rowSelection, userPageSize, allocationSearchUserValue,
      userPageNum, userRecordCount, onPageChange, allocationSearchType, tableSize,checkboxHaveUser,
      units, allocationRole: {roleAdminType},
    } = this.props;
    const {y} = this.state;
    return (
      <Modal {...modalProps} width={950} title="分配用户" wrapClassName="vertical-center-modal" className="vadp-modal">
        <div className={styles.roleAllocationUser}>
          <div className={styles.rangeContainer}>
            <span>以下角色范围内</span>
            <Select
              className={styles.select}
              value={allocationSearchType}
              onChange={this.handleChange.bind(this)}>
              <Option value="1">管理用户</Option>
              {roleAdminType === 1 && <Option value="0">普通用户</Option>}
            </Select>
            <Search
              value={allocationSearchUserValue}
              style={{width: 200, marginLeft: 16}}
              onChange={this.changeUser}
              onSearch={this.searchUser}
              placeholder="搜索用户"/>
                <Checkbox onChange={this.changeHaveUser} defaultChecked={checkboxHaveUser} style={{width: 100, marginLeft: 8}}>仅显示已分配用户</Checkbox>
          </div>
          <Scroll className={styles.roleAllocationUser} type="table">
            <Table
              locale={{emptyText: ''}}
              rowClassName={tableSize}
              pagination={{
                pageSize: userPageSize,
                current: userPageNum,
                hideOnSinglePage: true,
                total: userRecordCount,
                showQuickJumper: true,
                onChange: onPageChange,
              }}
              scroll={{x: true, y}}
              className={styles.table}
              rowSelection={rowSelection}
              dataSource={this.filterSource()}
              columns={this.getColumns(units)}
              rowKey={record => record.account}
              bordered/>
          </Scroll>
        </div>
      </Modal>
    );
  };
}
