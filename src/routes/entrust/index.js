/**
 * Created by huangzhangshu on 2019/12/4
 * 业务委托组件
 */
import React, {Component} from 'react';
import {connect} from 'dva';
import {Title, Table, Button, Form, Select, Menu, Tooltip, Popconfirm, Icon} from '@vadp/ui';
import styles from './index.less';
import {calcPageOptions, pageSizeOptions} from '../../common/AdminContacts';
import TableTitle from '../../components/TableTitle';
import actions from '../../shared/actions'

const EditableContext = React.createContext();
const SELECT_PAGE_SIZE = 100;

class EditableCell extends Component {

  constructor(props) {
    super(props);
    this.state = {scrollPage: 1, searchKey: ''};
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }

  selectScroll = (e) => {
    e.persist();
    const {list, parentId, record: {id}, getFieldsValue} = this.props
    const {target} = e;
    const {scrollPage, searchKey} = this.state;
    let dataSource = [...list];
    const fields = getFieldsValue();
    const parentValue = fields[`${id}_${parentId}`];
    if (parentId) {
      dataSource = dataSource.filter((item) => String(item.parentkey) === String(parentValue));
    }
    if (target.scrollTop + target.offsetHeight === target.scrollHeight
      && scrollPage * SELECT_PAGE_SIZE < dataSource.length && !searchKey) {
      const nextScrollPage = scrollPage + 1;
      this.setState({scrollPage: nextScrollPage});
    }
  }

  getSelectOptions = () => {
    const {list = [], record: {id}, parentId, getFieldsValue, width} = this.props;
    const {searchKey, scrollPage} = this.state;
    let dataSource = [...list];
    const fields = getFieldsValue();
    const parentValue = fields[`${id}_${parentId}`];
    if (parentId) {
      dataSource = dataSource.filter((item) => String(item.parentkey) === String(parentValue));
    }
    const maxLength = searchKey ? dataSource.length
      : Math.min(scrollPage * SELECT_PAGE_SIZE, dataSource.length);
    const options = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < maxLength; i++) {
      const {name = '', key} = dataSource[i];
      if (name.length * 16 > width) {
        options.push(<Select.Option key={`${id}_${key}`} value={String(key)}>
          <Tooltip title={name}>
            <span className={styles.columnEllipsis} style={{maxWidth: width}}>{name}</span>
          </Tooltip>
        </Select.Option>);
      } else {
        options.push(<Select.Option key={`${id}_${key}`} value={String(key)}>{name}</Select.Option>);
      }
    }
    return options;
  }

  getPageInput = () => {
    const {
      parentId, dataIndexId, record: {id}, setFieldsValue, getFieldsValue, dependMap, width,
    } = this.props;
    const fields = getFieldsValue();
    const parentValue = fields[`${id}_${parentId}`];
    const options = this.getSelectOptions();
    return (
      <Select
        style={{width: width - 18}}
        showSearch
        onPopupScroll={this.selectScroll}
        disabled={parentId !== '' && !parentValue}
        filterOption={(input, option) => {
          let {children} = option.props;
          if (typeof children !== 'string') {
            children = children.props.title;
          }
          return children && children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onSearch={(value) => {
          this.setState({searchKey: value, scrollPage: 1});
        }}
        onChange={() => {
          const dependId = dependMap[dataIndexId];
          const dependKey = `${id}_${dependId}`
          if (dependId) setFieldsValue({[dependKey]: ''});
        }}>{options}</Select>
    );
  };

  getInput = () => {
    const {list = [], parentId, dataIndexId, record: {id}, setFieldsValue, getFieldsValue, dependMap, width = 200} = this.props;
    const fields = getFieldsValue();
    const parentValue = fields[`${id}_${parentId}`];
    let dataSource = [...list];
    if (parentId) {
      dataSource = dataSource.filter((item) => String(item.parentkey) === String(parentValue));
    }
    return (
      <Select
        style={{width: width - 18}}
        showSearch
        filterOption={(input, option) => {
          let {children} = option.props;
          if (typeof children !== 'string') {
            children = children.props.title;
          }
          return children && children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        disabled={parentId !== '' && !parentValue}
        onChange={() => {
          const dependId = dependMap[dataIndexId];
          const dependKey = `${id}_${dependId}`
          if (dependId) setFieldsValue({[dependKey]: ''});
        }}>
        {dataSource.map((item) => {
          const {name = '', key} = item;
          if (name.length * 16 > width) {
            return (
              <Select.Option key={`${id}_${key}`} value={String(key)}>
                <Tooltip title={name}>
                  <span className={styles.columnEllipsis} style={{maxWidth: width}}>{name}</span>
                </Tooltip>
              </Select.Option>
            );
          }
          return <Select.Option key={`${id}_${key}`} value={String(key)}>{name}</Select.Option>;
        })}
      </Select>
    );
  };

  renderCell = ({getFieldDecorator}) => {
    const {
      editing,
      dataIndex,
      dataIndexId,
      title,
      titleText,
      inputType,
      record = {},
      index,
      children,
      list = [],
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{margin: 0}}>
            {getFieldDecorator(`${record.id}_${dataIndexId}`, {
              initialValue: record[dataIndexId],
              rules: [
                {
                  required: true,
                  message: `${titleText}不能为空`,
                },
              ],
            })(list.length >= 1000 ? this.getPageInput() : this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class Entrust extends Component {

  state = {dependMap: {}}

  componentDidMount() {
    const {dispatch} = this.props;
    // 初始化请求列表数据
    dispatch({type: 'adminEntrust/fetchMenu'});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    // 清除数据
    dispatch({type: 'adminEntrust/recoverState'});
  }

  // 获取表格列
  getColumns = () => {
    const {currentEntrust} = this.props;
    const {dependMap} = this.state;
    if (!currentEntrust.appId) return {};
    let scrollX = 0;
    const {fromComp = [], fielterAttrs = [], targets = []} = currentEntrust;
    const columns = [];
    const columnsSource = [...fromComp, ...fielterAttrs, ...targets];
    // eslint-disable-next-line guard-for-in
    for (const index in columnsSource) {
      const source = columnsSource[index];
      const {fieldName: title, id, parentId, list} = source;
      const idMap = `${id}Map`;
      if (parentId) dependMap[parentId] = id;
      const colInnerWidth = (window.innerWidth - 420) / columnsSource.length;
      const width = Math.max(Math.ceil(colInnerWidth), 200);
      const col = {
        title: <TableTitle title={title} required/>,
        titleText: title,
        dataIndex: idMap,
        dataIndexId: id,
        parentId,
        list,
        ellipsis: true,
        editable: true,
        render: (item = {}) => {
          const name = item.name || '';
          return (name.length + 1) * 16 >= (width - 18)
            ? <Tooltip title={name}>
              <span className={styles.tableSpan} style={{maxWidth: width - 18}}>{name}</span>
            </Tooltip>
            : <span className={styles.tableSpan} style={{maxWidth: width - 18}}>{name}</span>;
        },
      };
      col.width = width;
      scrollX += col.width + 20;
      if (Number(index) === columnsSource.length - 1) delete col.width;
      columns.push(col);
    }
    columns.push({
      width: 100,
      title: '操作',
      key: 'entrustOperation',
      className: 'vadp-table-center',
      fixed: 'right',
      editable: false,
      render: this.renderActions,
    })
    return {columns, scrollX};
  }

  // 判断是否处理编辑状态
  isEditing = (record = {}) => {
    const {editableKeys = []} = this.props;
    const {id} = record;
    for (const key of editableKeys) if (key === id) return true;
    return false;
  }

  // 新增
  onAdd = () => {
    const {dispatch, tableList, currentEntrust, editableKeys} = this.props;
    const newId = `NewSource${Date.now().toString()}`;
    tableList.push({
      id: newId,
      appId: currentEntrust.appId,
      businessScenarioId: currentEntrust.businessScenarioId,
    });
    editableKeys.push(newId);
    dispatch({type: 'adminEntrust/update', payload: {tableList: [...tableList], editableKeys: [...editableKeys]}});
  }

  // 点击委托关系
  onClickMenuItem = ({item: {props = {}}, keyPath: menuSelectedKeys}) => {
    const {dispatch} = this.props;
    const {entrust} = props;
    dispatch({
      type: 'adminEntrust/update',
      payload: {menuSelectedKeys, selectedKeys: [], editableKeys: [], tableList: [], record: 0},
    });
    this.onSelectEntrust(entrust);
  }

  // 删除
  onDelete = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminEntrust/fetchBusinessDelete'});
  }

  // 删除单个数据
  onDeleteSingle = (id) => {
    const {dispatch, tableList, editableKeys} = this.props;
    if (String(id).indexOf('NewSource') === -1) {
      dispatch({type: 'adminEntrust/fetchBusinessDelete', payload: {ids: String(id)}});
    } else {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tableList.length; i++) {
        if (tableList[i].id === id) tableList.splice(i, 1);
      }
      for (let i = 0; i < editableKeys.length; i++) {
        if (editableKeys[i] === id) editableKeys.splice(i, 1);
      }
      dispatch({type: 'adminEntrust/update', payload: {tableList: [...tableList], editableKeys, selectedKeys: []}});
    }
  }

  // 修改编辑
  onEdit = () => {
    const {selectedKeys, editableKeys, dispatch} = this.props;
    if (editableKeys.length) {
      dispatch({type: 'adminEntrust/update', payload: {editableKeys: [], selectedKeys: []}});
      dispatch({type: 'adminEntrust/fetchBusinessList'});
    } else {
      dispatch({type: 'adminEntrust/update', payload: {editableKeys: selectedKeys}});
    }
  }

  // 编辑单个数据
  onEditSingle = (id) => {
    const {editableKeys, dispatch} = this.props;
    dispatch({type: 'adminEntrust/update', payload: {editableKeys: [...editableKeys, id]}});
  }

  // 分页器选择
  onPageChange = (number) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminEntrust/update', payload: {pageNum: number, selectedKeys: []}});
    dispatch({type: 'adminUser/fetchBusinessList'});
  }

  // 保存编辑数据
  onSave = () => {
    const {dispatch, form: {validateFields, getFieldsValue}} = this.props;
    validateFields((error) => {
      if (error) {
        // 如果有错误 不处理保存请求
        return;
      }
      // 获取全部数据
      const fields = getFieldsValue();
      dispatch({type: 'adminEntrust/fetchBusinessSave', payload: {fields}});
    });
  }

  // 点击委托关系
  onSelectEntrust = (currentEntrust = {}) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminEntrust/update', payload: {currentEntrust}});
    dispatch({type: 'adminEntrust/fetchBusinessList'});
  }

  // 表格选中
  onSelectChange = (selectedKeys, selectRows) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminEntrust/update', payload: {selectedKeys}});
  };

  // 分页器size大小变化
  onShowSizeChange = (current, pageSize) => {
    const {pageNum, recordCount} = this.props;
    const options = calcPageOptions(pageNum, pageSize, recordCount);
    this.handleChangePageSize({...options});
  }

  handleChangePageSize = (pageOptions) => {
    const {pageSize, pageNum, paginationSize} = pageOptions;
    const {dispatch} = this.props;
    dispatch({type: 'adminEntrust/update', payload: {pageSize, pageNum, paginationSize}});
    dispatch({type: 'adminEntrust/fetchBusinessList'});
  }

  renderActions = (text, record) => {
    return (
      <div className={styles.actionContainer} onClick={this.onStopPropagation}>
        <Tooltip placement="bottom" title="编辑">
          <a onClick={() => this.onEditSingle(record.id)}>
            <Icon type="-edit"/>
          </a>
        </Tooltip>
        <Tooltip placement="bottom" title="删除">
          <Popconfirm
            title="确定要删除这行数据吗?"
            okText="确定"
            canceltext="取消"
            onConfirm={() => this.onDeleteSingle(record.id)}
          >
            <a>
              <Icon type="-delete_o"/>
            </a>
          </Popconfirm>
        </Tooltip>
      </div>
    );
  }

  // 渲染委托关系列表
  renderMenuItem = () => {
    const {entrustList} = this.props;
    return entrustList.map((entrust) => {
      const {businessScenarioName, businessScenarioId} = entrust;
      return (
        <Menu.Item key={businessScenarioId} entrust={entrust} className={styles.menuItem}>
          {businessScenarioName}
        </Menu.Item>
      );
    });
  }

  render() {
    const {
      pageSize, pageNum, recordCount, selectedKeys, tableList, currentEntrust,
      editableKeys, menuSelectedKeys, deleteLoading, saveLoading, form,
    } = this.props;
    const {dependMap} = this.state;
    const {getFieldsValue, setFieldsValue} = form;
    const rowSelection = {
      type: 'checkbox',
      columnWidth: 34,
      selectedRowKeys: selectedKeys,
      onChange: this.onSelectChange,
      fixed: true,
    };
    const {columns: initialColumns = [], scrollX} = this.getColumns();
    const columns = initialColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          getFieldsValue,
          setFieldsValue,
          dependMap,
          record,
          inputType: 'select',
          dataIndex: col.dataIndex,
          dataIndexId: col.dataIndexId,
          title: col.title,
          titleText: col.titleText,
          list: col.list,
          parentId: col.parentId,
          width: col.width,
          editing: this.isEditing(record),
        }),
      };
    });
    const components = {
      body: {
        cell: EditableCell,
      },
    };
    const menuItems = this.renderMenuItem();
    const scroll = window.navigator.userAgent.indexOf('MSIE') === -1 ? {x: scrollX, y: true} : {x: scrollX};
    const editDisabled = !(selectedKeys.length !== 0 || editableKeys.length !== 0);
    const deleteDisabled = !(selectedKeys.length !== 0);
    const saveDisabled = !(editableKeys.length !== 0);
    return (
      <div className={styles.adminEntrust}>
        <div className={styles.listContainer}>
          <Title text="委托关系列表" style={{marginTop: 6}}/>
          <Menu
            style={{width: 220, height: '100%', marginTop: 16}}
            mode="vertical"
            selectedKeys={menuSelectedKeys}
            onClick={this.onClickMenuItem}>
            {menuItems}
          </Menu>
        </div>
        {currentEntrust.businessScenarioId && (<div className={styles.tableContainer}>
          <div className={styles.titleContainer}>
            <Title text="委托关系详情"/>
            <div className={styles.buttonContainer}>
              <Button
                type="primary"
                disabled={editDisabled}
                className={styles.button}
                onClick={this.onEdit}>{editableKeys.length ? '取消修改' : '修改'}
              </Button>
              <Popconfirm
                title="确定删除?"
                okText="确定"
                canceltext="取消"
                onConfirm={() => this.onDelete()}>
                <Button
                  type="primary"
                  disabled={deleteDisabled}
                  className={styles.button}
                  loading={deleteLoading}>删除</Button>
              </Popconfirm>
              <Button
                type="primary"
                disabled={saveDisabled}
                className={styles.button}
                onClick={this.onSave}
                loading={saveLoading}>保存</Button>
              <Button className={styles.button} type="primary" onClick={this.onAdd}>新增</Button>
            </div>
          </div>
          <EditableContext.Provider value={form}>
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
              components={components}
              columns={columns}
              dataSource={tableList}
              bordered
              defaultCurrent={1}
              scroll={scroll}
              rowSelection={rowSelection}
              rowKey={record => record.id}
              className={styles.table}/>
          </EditableContext.Provider>
        </div>)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    entrustList: state.adminEntrust.entrustList,
    selectedKeys: state.adminEntrust.selectedKeys,
    editableKeys: state.adminEntrust.editableKeys,
    menuSelectedKeys: state.adminEntrust.menuSelectedKeys,
    tableList: state.adminEntrust.tableList,
    pageSize: state.adminEntrust.pageSize,
    pageNum: state.adminEntrust.pageNum,
    recordCount: state.adminEntrust.recordCount,
    currentEntrust: state.adminEntrust.currentEntrust,
    deleteLoading: state.adminEntrust.deleteLoading,
    saveLoading: state.adminEntrust.saveLoading,
  };
}

export default Form.create()(connect(mapStateToProps)(Entrust));
