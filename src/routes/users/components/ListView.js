import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Table, Tooltip, Icon, Popconfirm, Button, message} from '@vadp/ui';
import styles from '../style/ListView.less';
import {Field, TYPE_DATA} from '../common/UserContacts';
import {pageSizeOptions, calcPageOptions} from '../../../common/AdminContacts';

class ListView extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      y: window.innerHeight - 280,
      selectRows: [],
      selectedRowKeys: [],  // Check here to configure the default column
    };
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/updatePageInfo', payload: {pageNum: 1}});
    dispatch({type: 'adminUser/searchUsers'});
    dispatch({type: 'adminUser/findAllRole'});
    dispatch({type: 'adminUser/findRole'});
    dispatch({type: 'adminUser/findUnits'}); 
    dispatch({type: 'adminUser/findUpCodeList'});
    dispatch({type: 'adminUser/findDept'});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/resetState'});
  }


  onStopPropagation(ev) {
    // preventDefault
    ev.stopPropagation(); // 停止事件冒泡
  }

  onPageChange = (number) => {
    const {dispatch, searchDeptValue} = this.props;
    this.setState({selectedRowKeys: []});
    dispatch({type: 'adminUser/updatePageInfo', payload: {pageNum: number}});
    if (!searchDeptValue) dispatch({type: 'adminUser/searchUsers'});
  }

  onShowSizeChange = (current, pageSize) => {
    const {pageNum, recordCount} = this.props;
    const options = calcPageOptions(pageNum, pageSize, recordCount);
    this.handleChangePageSize({...options});
  }

  handleChangePageSize = (pageOptions) => {
    const {searchDeptValue} = this.props;
    const {pageSize, pageNum, paginationSize} = pageOptions;
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/updatePageInfo', payload: {pageSize, pageNum, paginationSize}});
    if (!searchDeptValue) dispatch({type: 'adminUser/searchUsers'});
  }

  handleAllocation = (record, allocationType = 'single') => {
    if (!record || record.length === 0) return;
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/showAllocationModal'});
    dispatch({type: 'adminUser/updateAllocationKeys', payload: []}); // 清空历史选择数据
    if (allocationType === 'single') dispatch({type: 'adminUser/findRoleByUser', payload: {id: record[0].id}}); // 如果是为单个用户分配角色，请求该用户用友的角色
    dispatch({type: 'adminUser/updateAllocationUsers', payload: {allocationSelectedUsers: record, allocationType}});
  }

  handleResetPassword = () => {
    const {dispatch} = this.props;
    const {selectedRowKeys} = this.state;
    dispatch({type: 'adminUser/resetPassword', payload: selectedRowKeys});
  }

  handleSelect = (record) => {
    const {dispatch} = this.props;
    const {compCode, empCode} = record;
    dispatch({type: 'adminUser/update', payload: {empUsers: [], empRecordCount: 0, empPageNum: 1, empSearchKey: ''}});
    dispatch({type: 'adminUser/updateCreateAvatar', payload: []});
    dispatch({type: 'adminUser/findAllRole'});
    dispatch({type: 'adminUser/find', payload: record});
    if (record.empCode) dispatch({type: 'adminUser/findEmp', payload: {empCode}});
    dispatch({type: 'adminUser/findEmpList', payload: {compCode, selectedValue: empCode}});
    // dispatch({type: 'adminUser/findUnit'});
  };

  handleAdd = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {empUsers: [], empRecordCount: 0, empPageNum: 1, empSearchKey: ''}});
    dispatch({type: 'adminUser/findEmpList'});
    dispatch({type: 'adminUser/updateCreateAvatar', payload: []});
    dispatch({type: 'adminUser/fetchUserFindSysPara', payload: {}});
    dispatch({type: 'adminUser/showModal', payload: {modalType: 'create', currentItem: {}}});
  }

  handleImport = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {importModalVisible: true, importUserType: '0'}});
  }

  handleImportRole = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {importModalVisible: true, importUserType: '1'}});
  }

  handleExport = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/exportUser'});
  }

  handleDelete = () => {
    const {dispatch} = this.props;
    const {selectRows} = this.state;
    dispatch({type: 'adminUser/deleteBatch', payload: selectRows});
    this.setState({selectedRowKeys: [], selectRows: []});
  }

  handleDeleteUser = (user) => {
    const {dispatch} = this.props;
    const {selectedRowKeys} = this.state;
    dispatch({type: 'adminUser/deleteBatch', payload: [user]});
    for (let i = 0; i < selectedRowKeys.length; i++) {
      if (selectedRowKeys[i] === user.account) {
        selectedRowKeys.splice(i, i + 1);
        break;
      }
    }
    this.setState({selectedRowKeys: [...selectedRowKeys]});
  }

  handleSelectChange = (selectedRowKeys, selectRows) => {
    this.setState({selectedRowKeys, selectRows});
  };

  getUnitByCode = (compCode) => {
    const {units} = this.props;
    for (const unit of units) {
      const {code} = unit;
      if (code === compCode) return unit;
    }
    return {};
  }

  getColumn = () => {
    const columns = [
      {
        title: '用户名',
        dataIndex: 'account',
        key: 'account',
        width: 150,
        render: (account) => {
          return account && account.length >= 15 ? <Tooltip title={account}>
              <span className={styles.userColumnNameText}>{account}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{account}</span>;
        },
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (name) => {
          return name && name.length >= 15 ? <Tooltip title={name}>
              <span className={styles.userColumnNameText}>{name}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{name}</span>;
        },
      },
      {
        title: '用户类型',
        dataIndex: 'type',
        key: 'type',
        width: 150,
        render: this.renderType,
      },
      {
        title: '组织',
        dataIndex: 'compCode',
        key: 'compCode',
        width: 250,
        render: (compCode) => {
          const unit = this.getUnitByCode(compCode);
          const {name = ''} = unit;
          return (name.length * 16 > 250) ? <Tooltip title={name}>
              <span className={styles.userColumnUnitText}>{name}</span></Tooltip> :
            <span className={styles.userColumnUnitText}>{name}</span>;
        },
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        key: 'deptName',
        width: 250,
        render: (deptName = '') => {
          return ((deptName || '').length * 16 > 250) ? <Tooltip title={deptName}>
              <span className={styles.userColumnUnitText}>{deptName}</span></Tooltip> :
            <span className={styles.userColumnUnitText}>{deptName}</span>;
        },
      },
      {
        title: '启用状态',
        dataIndex: 'accountEnabled',
        key: 'accountEnabled',
        width: 120,
        render: (accountEnabled) => {
          return accountEnabled =='T' ?
            <span className={styles.userColumnDescriptionText}>启用</span>:
            <span className={styles.userColumnDescriptionText}>禁用</span>
        },
      },
      {
        title: '用户描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        width: 250,
        render: (record) => {
          const description = record || '暂无描述信息';
          return description && description.length >= 30 ? <Tooltip title={description}>
            <span className={styles.userColumnDescriptionText}>{description}</span>
          </Tooltip> : <span className={styles.userColumnDescriptionText}>{description}</span>;
        },
      },
      {
        width: 100,
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        className: 'vadp-table-center',
        render: this.renderActions,
      },
    ];
    return columns;
  }

  filterList = (data, userSelectedKey) => {
    if (userSelectedKey === '' || !userSelectedKey) {
      return data;
    }
    const destData = [];
    for (const temp of data) {
      if (temp.id === userSelectedKey) destData.push(temp);
    }
    return destData;
  }

  renderType = (text) => {
    return <span>{TYPE_DATA[text]}</span>;
  }

  renderActions = (text, record) => {
    return (
      <div className={styles.actionContainer} onClick={this.onStopPropagation}>
        <Tooltip placement="bottom" title="编辑">
          <a onClick={() => this.handleSelect(record)}>
            <Icon type="-edit"/>
          </a>
        </Tooltip>
        <Tooltip placement="bottom" title="分配角色">
          <a onClick={() => this.handleAllocation([record], 'single')}>
            <Icon type="-userset"/>
          </a>
        </Tooltip>
        <Tooltip placement="bottom" title="删除">
          <Popconfirm
            title="确定要删除这行数据吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={() => this.handleDeleteUser(record)}
          >
            <a>
              <Icon type="-delete_o"/>
            </a>
          </Popconfirm>
        </Tooltip>
      </div>
    );
  }

  renderOperation = (dataSource) => {
    const {content, currentUser: {account}, exportLoading, importLoading, importRoleLoading} = this.props;
    const {selectedRowKeys} = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const importDisabled = !(account === 'admin');
    const importRoleDisabled = !(account === 'admin');
    const exportDisabled = !(dataSource.length !== 0 && account === 'admin');
    return (
      <div className={styles.userOperation}>
        <div className={styles.operationContainer}>
          <Button
            type="primary"
            disabled={!hasSelected}
            className="portal-admin-add-btn"
            // style={buttonStyle}
            onClick={this.handleResetPassword}
          >{Field.RESET_PASSWORD}</Button>
          <Button
            type="primary"
            disabled={!hasSelected}
            className="portal-admin-add-btn"
            onClick={() => {
              const records = [];
              for (const key of selectedRowKeys) {
                for (const value of content) {
                  if (value.account === key) {
                    records.push(value);
                    break;
                  }
                }
              }
              let saveManagerAndStaff = '';
              for (const selectedUser of records) {
                const {type} = selectedUser;
                // eslint-disable-next-line
                if (saveManagerAndStaff !== type && saveManagerAndStaff.length < 2) saveManagerAndStaff = saveManagerAndStaff.concat(type);
              }
              if (saveManagerAndStaff === '01' || saveManagerAndStaff === '10') {
                message.warn('管理员和普通员工不可一起批量分配角色');
                return;
              }
              this.handleAllocation(records, 'batch');
            }}>{Field.BATCH_ALLOCATION_ROLE}
          </Button>
          <Popconfirm
            title={Field.USER_DELETE_TITLE}
            cancelText={Field.CANCEL}
            okText={Field.OK}
            onConfirm={this.handleDelete}>
            <Button
              type="primary"
              disabled={!hasSelected}
              className="portal-admin-add-btn"
            >{Field.DELETE}</Button>
          </Popconfirm>
          {!exportDisabled && <Button
            type="primary"
            loading={exportLoading}
            disabled={exportDisabled}
            className="portal-admin-add-btn"
            onClick={this.handleExport}>导出
          </Button>}
          {!importDisabled && <Button
            type="primary"
            loading={importLoading}
            disabled={importDisabled}
            className="portal-admin-add-btn"
            onClick={this.handleImport}>导入
          </Button>}
          {!importRoleDisabled && <Button
            type="primary"
            loading={importRoleLoading}
            disabled={importRoleDisabled}
            className="portal-admin-add-btn"
            onClick={this.handleImportRole}>导入用户角色
          </Button>}
          <Button
            className="portal-admin-add-btn"
            type="primary"
            onClick={this.handleAdd}>{Field.ADD_USER}
          </Button>
        </div>
      </div>
    );
  }

  // 暂时去除rowSelection={onRowSelection}
  render() {
    const {content, loading, userSelectedKey, pageSize, pageNum, recordCount} = this.props;
    const {selectedRowKeys} = this.state;
    const rowSelection = {
      type: 'checkbox',
      columnWidth: 34,
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const columns = this.getColumn();
    const {y} = this.state;
    const dataSource = this.filterList(content, userSelectedKey);
    // eslint-disable-next-line no-undef
    const scroll = app.isIE() ? {y} : {x: true, y}; // app.isIE()
    return (
      <div className={styles.userList} type="table">
        {this.renderOperation(dataSource)}
        <Table
          locale={{emptyText: ''}}
          id="adminUserTable"
          className={styles.tableBody}
          // rowClassName={tableSize}
          bordered
          pagination={{
            showSizeChanger: true,
            pageSizeOptions,
            onShowSizeChange: this.onShowSizeChange,
            pageSize,
            current: pageNum,
            hideOnSinglePage: pageSize === 10,
            total: Math.max(recordCount, pageSize),
            showQuickJumper: true,
            onChange: this.onPageChange,
            size: 'default',
          }}
          defaultCurrent={1}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowSelection={rowSelection}
          scroll={scroll}
          rowKey={record => record.account}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tableSize: state.adminUser.tableSize,
    recordCount: state.adminUser.recordCount,
    loading: state.adminUser.loading,
    content: state.adminUser.content,
    userSelectedKey: state.adminUser.userSelectedKey,
    pageSize: state.adminUser.pageSize,
    pageNum: state.adminUser.pageNum,
    units: state.global.units,
    currentUser: state.user.currentUser,
    exportLoading: state.adminUser.exportLoading,
    importLoading: state.adminUser.importLoading,
    importRoleLoading: state.adminUser.importRoleLoading,
    searchDeptValue: state.adminUser.searchDeptValue,
  };
}

export default connect(mapStateToProps)(ListView);
