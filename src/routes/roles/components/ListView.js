import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {Table, Tooltip, Button, Icon, Title, Popconfirm, Scroll} from '@vadp/ui';
import {connect} from 'dva';
import {Field} from '../../users/common/UserContacts';
import styles from '../style/ListView.less';
import {calcPageOptions, pageSizeOptions} from '../../../common/AdminContacts';

// import styles from './ListView.less';

function timetrans(date) {
  var date = new Date(date);
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '  ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m;
}

class ListView extends PureComponent {

  state = {
    y: window.innerHeight - 280,
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.initTableY();
  }

  componentDidUpdate() {
    this.initTableY();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const {handleChangeResize} = this.props;
    handleChangeResize();
  }

  onStopPropagation(ev) {
    // preventDefault
    ev.stopPropagation(); // 停止事件冒泡
  }

  initTableY = () => {
    const table = ReactDOM.findDOMNode(document.getElementById('roleTable'));
    if (table && table.clientHeight !== 0) {
      const availHeight = document.body.clientHeight - 255 + 16 - 40;
      const y = table.clientHeight > availHeight ? availHeight : table.clientHeight;
      if (y !== this.state.y)
        this.setState({y})
    }
  }

  onShowSizeChange = (current, pageSize) => {
    const {pageNum, recordCount} = this.props;
    const options = calcPageOptions(pageNum, pageSize, recordCount);
    this.handleChangePageSize({...options});
  }

  handleChangePageSize = (pageOptions) => {
    const {pageSize, pageNum, paginationSize} = pageOptions;
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/updateState', payload: {pageSize, pageNum, paginationSize}});
  }

  onPageChange = (number) => {
    const {dispatch, clearSelected} = this.props;
    if (clearSelected) clearSelected();
    dispatch({type: 'adminRole/updateState', payload: {pageNum: number}});
  }

  getColumns = () => {
    return [
      {
        title: '角色编码',
        dataIndex: 'roleCode',
        key: 'roleCode',
        width: 180,
        className: 'vadp-table-small',
        defaultSortOrder: 'ascend',
        sorter: () => {return true;},
        render: (roleCode) => {
          return roleCode.length >= 15 ? <Tooltip title={roleCode}>
              <span className={styles.userColumnNameText}>{roleCode}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{roleCode}</span>;
        },
      },
      {
        title: '角色名称',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        className: 'vadp-table-small',
        render: (name) => {
          return name.length >= 10 ? <Tooltip title={name}>
              <span className={styles.userColumnNameText}>{name}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{name}</span>;
        },
      },
      {
        title: '角色类别',
        dataIndex: 'roleAdminTypeName',
        key: 'roleAdminTypeName',
        width: 180,
        className: 'vadp-table-small',
        render: (roleAdminTypeName) => {
          return roleAdminTypeName.length >= 10 ? <Tooltip title={roleAdminTypeName}>
              <span className={styles.userColumnNameText}>{roleAdminTypeName}</span></Tooltip> :
            <span className={styles.userColumnNameText}>{roleAdminTypeName}</span>;
        },
      },
      {
        title: '角色描述',
        dataIndex: 'description',
        key: 'description',
        className: 'vadp-table-small',
        render: (description) => {
          return description && description.length >= 30 ? <Tooltip title={description}>
            <span className={styles.userColumnDescriptionText}>{description}</span>
          </Tooltip> : <span className={styles.userColumnDescriptionText}>{description || '暂无描述信息'}</span>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'creationDate',
        key: 'creationDate',
        width: 150,
        className: 'vadp-table-center',
        render: (creationDate) =>
          <span className={styles.userColumnCenterText}>{timetrans(creationDate)}</span>,
      },
      {
        width: 100,
        title: '操作',
        key: 'action',
        className: 'vadp-table-center',
        render: this.renderActions,
      },
    ];
  }

  renderOperation() {
    const {
      hasSelected, onAdd, onDeleteRole, selectedRowKeys, data,
    } = this.props;
    return (
      <div className={styles.roleOperation}>
        <div className={styles.operationContainer}>
          <Popconfirm
            title="确定要删除数据吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={() => {
              const records = [];
              for (const role of data) {
                for (const key of selectedRowKeys) {
                  if (role.id === key) records.push(role);
                }
              }
              onDeleteRole(records);
            }}>
            <Button type="primary" disabled={!hasSelected} className="portal-admin-add-btn">{Field.DELETE}</Button>
          </Popconfirm>
          <Button
            className="portal-admin-add-btn"
            type="primary"
            onClick={onAdd}>{Field.ADD_USER}
          </Button>
        </div>
      </div>
    );
  }

  renderActions = (text, record) => {
    const {handleAllocation, onEditRole, onDeleteRole} = this.props;
    const {isPreMake} = record;
    const deleteStyle = {};
    let disabled = false;
    if (isPreMake === 1) disabled = true;
    if (isPreMake === 1) deleteStyle.visibility = 'hidden';
    return (
      <div className={styles.actionContainer} onClick={this.onStopPropagation}>
        <Tooltip placement="bottom" title="编辑">
          <a onClick={() => onEditRole(record)}>
            <Icon type="-edit"/>
          </a>
        </Tooltip>
        <Tooltip placement="bottom" title="分配用户">
          <a onClick={() => handleAllocation(record)}>
            <Icon type="-userset"/>
          </a>
        </Tooltip>
        <Tooltip placement="bottom" title="删除" disabled={disabled}>
          <Popconfirm
            title="确定要删除这行数据吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={() => onDeleteRole([record])}
          >
            <a style={deleteStyle} disabled={disabled}>
              <Icon type="-delete_o"/>
            </a>
          </Popconfirm>
        </Tooltip>
      </div>
    );
  }

  render() {
    const {data, loading, onRowSelection, pageSize, pageNum, recordCount} = this.props;
    const {y} = this.state;
    // eslint-disable-next-line no-undef
    const scroll = app.isIE() ? {y} : {x: true, y};
    return (
      <div className={styles.userListView}>
        {this.renderOperation()}
        <Table
          locale={{emptyText: ''}}
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
          id="roleTable"
          bordered
          size="default"
          columns={this.getColumns()}
          rowSelection={onRowSelection}
          dataSource={data}
          loading={loading}
          scroll={scroll}
          rowKey={record => record.id}/>
      </div>
    );
  }
}


export default connect()(ListView);
