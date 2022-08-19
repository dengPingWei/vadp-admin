/**
 * Created by wangzhenqiang on 2020/5/11
 */
import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Table, Tooltip, Icon, Popconfirm, Button, message} from '@vadp/ui';
import styles from '../style/BusiListView.less';
import {Field, TYPE_DATA} from '../common/BusiApiContacts';
import {pageSizeOptions, calcPageOptions} from '../../../common/AdminContacts';

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


class BusiListView extends PureComponent {

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
    dispatch({type: 'adminBusi/updatePageInfo', payload: {pageNum: 1, busiPageNum: 1}});
    dispatch({type: 'adminBusi/updateState', payload: {pageNum: 1, recordCount: 0}});
    dispatch({type: 'adminBusi/findAllBusi'});
    dispatch({type: 'adminBusi/findAllRole'});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminBusi/resetState'});
  }


  onStopPropagation(ev) {
    // preventDefault
    ev.stopPropagation(); // 停止事件冒泡
  }

  onPageChange = (number) => {
    const {dispatch} = this.props;
    this.setState({selectedRowKeys: []});
     dispatch({type: 'adminBusi/updatePageInfo', payload: {pageNum: number}});
    dispatch({type: 'adminBusi/updateState', payload: {pageNum: number}});
    dispatch({type: 'adminBusi/findAllBusi'});

    // dispatch({type: 'adminBusi/searchBusis'});
  }

  onShowSizeChange = (current, pageSize) => {
    const {pageNum, recordCount} = this.props;
    const options = calcPageOptions(pageNum, pageSize, recordCount);
    this.handleChangePageSize({...options});
  }

  handleChangePageSize = (pageOptions) => {
    const {pageSize, pageNum, paginationSize} = pageOptions;
    const {dispatch} = this.props;
    dispatch({type: 'adminBusi/updatePageInfo', payload: {pageSize, pageNum, paginationSize}});
   // dispatch({type: 'adminBusi/searchBusis'});
  }


  handleSelect = (record) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminBusi/findRoleByMenuId', payload: record});
    dispatch({type: 'adminBusi/find', payload: record});
  };

  handleAdd = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminBusi/showModal', payload: {modalType: 'create', currentItem: {}}});
  }


  handleDelete = () => {
    const {dispatch} = this.props;
    const {selectRows} = this.state;
    dispatch({type: 'adminBusi/deleteBatch', payload: selectRows});
    this.setState({selectedRowKeys: [], selectRows: []});
  }

  handleDeleteBusi = (busis) => {
    const {dispatch} = this.props;
    const {selectedRowKeys} = this.state;
    dispatch({type: 'adminBusi/deleteBatch', payload: [busis]});
    for (let i = 0; i < selectedRowKeys.length; i++) {
      if (selectedRowKeys[i] === busis.resourceId) {
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
        title: '资源',
        dataIndex: 'url',
        key: 'url',
        className: 'vadp-table-small',
        render: (record) => {
          return <Tooltip title={record}>
              <span>{record}</span></Tooltip>
        },
      },
      {
        title: '授权角色',
        dataIndex: 'name',
        key: 'name',
        width: 600,
        className: 'vadp-table-small',
        render: (record) => {
          return record && record.length > 1 ? <Tooltip title={record}>
              <span className={styles.busiColumnNameText}>{record}</span></Tooltip> :
            <span className={styles.busiColumnNameText}>未授权</span>;
        },
      },

      {
        title: '创建时间',
        dataIndex: 'creationDate',
        key: 'creationDate',
        width: 150,
        className: 'vadp-table-small',
        render: (record) => {
          return <Tooltip title={record}>
              <span>{timetrans(record)}</span></Tooltip>
        },
      },

      {
        width: 80,
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
        <Tooltip placement="bottom" title="删除">
          <Popconfirm
            title="确定要删除这行数据吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={() => this.handleDeleteBusi(record)}
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
    const {content,} = this.props;
    const {selectedRowKeys} = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div className={styles.busiOperation}>
        <div className={styles.operationContainer}>
          <Popconfirm
            title={Field.BUSI_DELETE_TITLE}
            cancelText={Field.CANCEL}
            okText={Field.OK}
            onConfirm={this.handleDelete}>
            <Button
              type="primary"
               disabled={!hasSelected}
              className="portal-admin-add-btn"
            >{Field.DELETE}</Button>
          </Popconfirm>

          <Button
            className="portal-admin-add-btn"
            type="primary"
            onClick={this.handleAdd}>{Field.ADD_BUSI}
          </Button>
        </div>
      </div>
    );
  }

  // 暂时去除rowSelection={onRowSelection}
  render() {
    const {content, loading, busiSelectedKey, pageSize, pageNum, recordCount} = this.props;
    const {selectedRowKeys} = this.state;
    const rowSelection = {
      type: 'checkbox',
      columnWidth: 34,
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const columns = this.getColumn();
    const {y} = this.state;
    const dataSource = this.filterList(content, busiSelectedKey);
    // eslint-disable-next-line no-undef
    const scroll = app.isIE() ? {y} : {x: true, y};
    return (
      <div>
        {this.renderOperation(dataSource)}

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
          id="adminBusiTable"
          bordered
          size="default"
          columns={columns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          loading={loading}
          scroll={scroll}
          rowKey={record => record.id}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tableSize: state.adminBusi.tableSize,
    recordCount: state.adminBusi.recordCount,
    loading: state.adminBusi.loading,
    content: state.adminBusi.busiApiContent,
    busiSelectedKey: state.adminBusi.busiSelectedKey,
    pageSize: state.adminBusi.pageSize,
    pageNum: state.adminBusi.pageNum,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(BusiListView);
