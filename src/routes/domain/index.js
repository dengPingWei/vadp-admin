import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  Table,
  Checkbox,
  Button,
  Select,
  message,
  Tooltip,
  Modal,
  Popconfirm,
} from '@vadp/ui';
import CodeTypes from '../../common/CodeTypes';
import OrgEditModel from './components/OrgEditModel.js';
import styles from './index.less';
import actions from '../../shared/actions'

const {confirm} = Modal;

class DomainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showModalOkButton: false,
      showModalTitle: '组织机构新增',
      compLevelCodes: [],
      selectValue: "",
      selectedRowKeys: [],
      enableIdentifi: false,
      stopUsingIdentity: false,
      publishd: false,
      editList: {},
      enableMap: {},
    };
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }

  onChange = e => {
    this.setState({value: e.target.value});
  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminDomain/fetchCodelist'});
    dispatch({type: 'adminDomain/fetchDict'});
    dispatch({type: 'adminDomain/fetchRegion', payload: {type: CodeTypes.prov, codeLevel: '1'}});
    dispatch({type: 'adminDomain/fetchTreeList', payload: '1'});
    dispatch({type: 'adminDomain/fetchCompetencyFunctionGroups'});
  }

  handleOperator = (record) => {
    let enableStatus = false;
    if (record.isEnabled == '0') {
      enableStatus = true;
    }
    this.setState({showModalTitle: '组织机构编辑'});
    const {dispatch} = this.props;

    dispatch({
      type: 'adminDomain/update',
      payload: {showModal: true, showModalTitle: '组织机构编辑', showModalOkButton: enableStatus, editList: record}
    })
    if (record.prov) {
      this.onCityRegion({type: CodeTypes.city, codeLevel: '2', cd: record.prov});
    }
    if (record.city) {
      this.onTownRegion({type: CodeTypes.adminArea, codeLevel: '3', cd: record.city});
    }
  }

  onCityRegion = (params) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminDomain/fetchRegionCity', payload: params});
  }

  onTownRegion = (params) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminDomain/fetchRegionTown', payload: params});
  }

  handleAdd = () => {
    const {dispatch} = this.props;
    this.setState({showModalTitle: '组织机构新增'});
    dispatch({
      type: 'adminDomain/update',
      payload: {showModal: true, showModalTitle: '组织机构新增', showModalOkButton: false, editList: {}}
    })
    // dispatch({type: 'adminDomain/fetchTreeList'});
  }

  handleCancel = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminDomain/update', payload: {showModal: false}})
  }

  handleSearch = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminDomain/update', payload: {orgcode: this.state.selectValue, treeList: []}});
    dispatch({type: 'adminDomain/fetchTreeList'});
  }

  handleDisplayDisabled = (e) => {
    const {dispatch} = this.props;
    let isEnabled = '';
    if (e.target.checked === true) {
      isEnabled = '0';
    } else {
      isEnabled = '1';
    }
    dispatch({type: 'adminDomain/update', payload: {isEnabled}})
    dispatch({type: 'adminDomain/fetchTreeList'});
  };

  handleClick(e) {
    this.setState({selectValue: e});
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    const {enableMap = {}} = this.state;
    const selectRowKeyArr = [];
    if (selectedRows.length !== 0) {
      for (let i = 0; i < selectedRows.length; i++) {
        selectRowKeyArr.push(selectedRows[i].isEnabled);
        enableMap[selectedRows[i].code] = selectedRows[i].isEnabled;
      }
    }
    const isEnable = selectRowKeyArr.indexOf('1');
    const isNotEnable = selectRowKeyArr.indexOf('0');
    const isPublish = selectRowKeyArr.indexOf('2');
    if (isEnable === -1 && isPublish === -1) {
      this.setState({enableIdentifi: true});
    } else if (isPublish !== -1 && isEnable === -1 && isNotEnable === -1) {
      this.setState({enableIdentifi: true});
    } else {
      this.setState({enableIdentifi: false});
    }
    if (isNotEnable === -1 && isPublish === -1) {
      this.setState({stopUsingIdentity: true});
    } else {
      this.setState({stopUsingIdentity: false});
    }
    if ((isPublish > -1) && (selectRowKeyArr.length == 1)) {
      this.setState({publishd: true});
    } else {
      this.setState({publishd: false});
    }
    this.setState({selectedRowKeys, enableMap});
  };

  handleDelete = () => {
    const {dispatch} = this.props;
    const temp = this.state.selectedRowKeys;
    if (temp.length > 1) {
      message.warn('只能单个删除组织');
      return;
    }
    const orgcode = temp.join(',');
    dispatch({
      type: 'adminDomain/deleteTreeList', payload: orgcode
    });
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
      });
    }, 1000);
  };

  handlePublish = () => {
    const {dispatch} = this.props;
    const temp = this.state.selectedRowKeys;
    if (temp.length > 1) {
      message.warn('只能选择一个组织发布');
      return;
    }
    const orgcode = temp.join(',');
    dispatch({
      type: 'adminDomain/publishTreeList', payload: orgcode
    });
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
      });
    }, 1000);
  };

  handleRefreshData = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminDomain/fetchTreeList'});
  };

  setRowClassName = (record, index) => {
    const className = record.isEnabled === '0' ? 'isEnableCellName' : '';
    return className;
  };

  getUnitByCode = (code = '') => {
    const {treeList = []} = this.props;
    return {};
  }

  handleStart = () => {
    const {dispatch} = this.props;
    const {selectedRowKeys, enableMap = {}} = this.state;
    let title = '组织一旦启用不允许删除,确认启用?';
    for (const key of selectedRowKeys) {
      if (enableMap[key] === '0') title = '确定要启用吗？';
    }
    const codes = selectedRowKeys.join(',');
    confirm({
      title,
      content: '',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        dispatch({
          type: 'adminDomain/startTreeList',
          payload: codes,
          callback: (res) => {
            if (res.code === 200) {
              this.setState({selectedRowKeys: []});
              this.handleRefreshData();
            }
          },
        });
      },
      onCancel: () => {
      },
    });
  };

  handleStop = () => {
    const {dispatch} = this.props;
    const temp = this.state.selectedRowKeys;
    const codes = temp.join(',');
    dispatch({
      type: 'adminDomain/stopTreeList',
      payload: codes,
      callback: (res) => {
        if (res.code === 200) {
          this.handleRefreshData();
        }
      },
    });
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
      });
    }, 1000);
  };

  render() {
    const {
      treeList, menuList = [], codeList, hospattr, hosplevel, provinceData,
      cityData, townData, showModal, showModalOkButton, editList,
    } = this.props;
    const columns = [
      {
        title: '组织编码',
        dataIndex: 'code',
        key: 'code',
        width: 250,
        render: (text, record) => <a onClick={this.handleOperator.bind(this, record)}>{text}</a>,
      },
      {
        title: '组织名称',
        dataIndex: 'name',
        key: 'name',
        render: (text = '') => {
          const maxWidth = window.innerWidth - 450 - (menuList.length * 50);
          if (text.length * 16 > maxWidth) {
            return (
              <Tooltip title={text}>
                <span className={styles.columnName} style={{maxWidth}}>{text}</span>
              </Tooltip>
            );
          }
          return <span className={styles.columnName} style={{maxWidth}}>{text}</span>;
        },
      },
      {
        title: '组织状态',
        dataIndex: 'isEnabled',
        key: 'isEnabled',
        width: 100,
        render: (isEnabled) => {
          const status = {
            0: '已停用',
            1: '已启用',
            2: '未启用',
          }
          return <span>{status[isEnabled] || '未启用'}</span>;
        },
      },
    ]
    if (menuList.length !== 0) {
      for (let i = 0; i < menuList.length; i++) {
        columns.push(
          {
            title: menuList[i].name,
            dataIndex: 'unitmenu',
            key: 'unitmenu' + i,
            width: 50,
            render: unitmenu => (
              <div className={styles.columnUnit}>
                <Checkbox checked={unitmenu[i]}/>
              </div>
            ),
          }
        );
      }
    }
    const {selectedRowKeys, enableIdentifi, stopUsingIdentity, publishd} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: (record, selected, selectedRows) => {
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
      },
    };
    const hasSelected = selectedRowKeys.length > 0;
    const formProps = {
      editList,
      codeList,
      hospattr,
      hosplevel,
      menuList,
      treeList,
      onCityRegion: this.onCityRegion,
      onTownRegion: this.onTownRegion,
      showModalTitle: this.state.showModalTitle,
      showModalOkButton: this.state.showModalOkButton,
      provinceData,
      cityData,
      townData,
    }
    // eslint-disable-next-line no-undef
    const isIE = app.isIE();
    const scroll = isIE ? {} : {x: true, y: window.innerHeight - 210};
    return (
      <div className={styles.adminDomain}>
        <div style={{height: 30, marginBottom: 10}}>组织类型：
          <Select
            defaultValue="全部"
            value={this.state.selectValue}
            onChange={this.handleClick.bind(this)}
            style={{width: 200}}>
            <Select.Option value=''>全部 </Select.Option>
            {menuList.length && menuList.map((item, index) => (
              <Select.Option key={item.code} value={item.code}>{item.name}</Select.Option>))}
          </Select>
          <Checkbox onChange={this.handleDisplayDisabled} style={{marginLeft: 20}}>显示停用</Checkbox>
          <Button type="primary" onClick={this.handleSearch} style={{float: 'right'}}>查询</Button>
        </div>
        <div style={{height: 30, marginBottom: 10}}>
          <Button type="primary" onClick={this.handleAdd} style={{float: 'right'}}>新增</Button>
          <Popconfirm
            title="确定要停用吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={this.handleStop}>
            <Button
              type="primary"
              disabled={!stopUsingIdentity || !hasSelected}
              style={{float: 'right', marginRight: 10}}>停用 </Button>
          </Popconfirm>
          <Button
            type="primary"
            disabled={!enableIdentifi || !hasSelected}
            onClick={this.handleStart}
            style={{float: 'right', marginRight: 10}}>启用 </Button>
          <Popconfirm
            title="确定要删除吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={this.handleDelete}>
            <Button
              type="primary"
              disabled={!publishd || !hasSelected}
              style={{float: 'right', marginRight: 10}}>删除</Button>
          </Popconfirm>
        </div>
        {treeList ? 
          (<Table
            locale={{emptyText: ''}}
            pagination={false}
            className={styles.tableBody}
            rowClassName={this.setRowClassName}
            columns={columns}
            rowKey={record => record.code}
            bordered
            dataSource={treeList}
            defaultExpandAllRows
            scroll={scroll}
            rowSelection={rowSelection}/> )
            :
          (<div className="ant-table-placeholder">暂无数据</div>)
        }

        <OrgEditModel
          {...formProps}
          showModal={showModal}
          showModalOkButton={showModalOkButton}

          handleRefreshData={this.handleRefreshData.bind(this)}/>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  treeList: state.adminDomain.treeList,
  codeList: state.adminDomain.codeList,
  menuList: state.adminDomain.menuList,
  hospattr: state.adminDomain.hospattr,
  hosplevel: state.adminDomain.hosplevel,
  provinceData: state.adminDomain.provinceData,
  cityData: state.adminDomain.cityData,
  townData: state.adminDomain.townData,
  showModal: state.adminDomain.showModal,
  showModalTitle: state.adminDomain.showModalTitle,
  showModalOkButton: state.adminDomain.showModalOkButton,
  editList: state.adminDomain.editList,
});
export default connect(mapStateToProps)(DomainPage);
