/**
 * Created by huangzhangshu on 2018/3/6
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Table, Tooltip, Title, Input, Select, Tag, Radio } from '@vadp/ui';
import styles from '../style/Allocation.less';

const { Search } = Input;

const { Option } = Select;

class Allocation extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { y: 200, filterInputText: '', tableKey: Date.now().toString() };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'adminUser/findAllocationRole' });
  }

  componentDidUpdate() {
    const table = ReactDOM.findDOMNode(document.getElementById('userAllocationTable'));

    const availHeight = 200;
    const y = table.clientHeight < availHeight ? table.clientHeight : availHeight;
    this.setState({ y });
  }

  componentWillUnmount() {
    const { dispatch, cleanUnits } = this.props;
    dispatch({ type: 'adminUser/update', payload: { allocationAllRoles: [] } });
    cleanUnits();
  }

  getColumn() {
    const columns = [
      {
        title: '角色编码',
        dataIndex: 'roleCode',
        key: 'roleCode',
        width: 180,
        className: 'vadp-table-small',
        render: (roleCode) => {
          return roleCode.length >= 50 ? <Tooltip title={roleCode}>
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
        title: '角色类型',
        dataIndex: 'roleAdminTypeName',
        key: 'roleAdminTypeName',
        width: 180,
        className: 'vadp-table-small',
        render: (roleAdminTypeName) => {
          return <span className={styles.userColumnNameText}>{roleAdminTypeName}</span>;
        },
      },
    ];
    return columns;
  }

  getDefaultUnits = (record = []) => {
    const ids = [];
    for (const unit of record) {
      ids.push(unit.compId);
    }
    return ids;
  }

  unitChange = (data, value) => {
    const { updateColumnUnit } = this.props;
    const unit = { ...data, unitIds: value };
    updateColumnUnit(unit);
  }

  filterSource = () => {
    const { allocationRoles, allocationSelectedUsers } = this.props;
    const { filterInputText } = this.state;
    let roles = [];
    let hasCommonStaff = false;
    for (const user of allocationSelectedUsers) {
      const { type } = user;
      if (type === '0') {
        hasCommonStaff = true;
        break;
      }
    }
    if (hasCommonStaff) {
      for (const role of allocationRoles) {
        const { roleCode } = role;
        if (roleCode !== '1000') roles.push(role);
      }
    } else {
      roles = allocationRoles;
    }
    roles = roles.filter(role => role.roleCode.indexOf(filterInputText) !== -1 || role.name.indexOf(filterInputText) !== -1);
    return roles;
  }

  onChange = (event) => {
    this.setState({ filterInputText: event.currentTarget.value });
  }

  onSearch = (filterValue) => {
    this.setState({ filterValue, tableKey: Date.now().toString() })
  }

  renderUsers(allocationSelectedUsers) {
    return allocationSelectedUsers.map((user) => {
      return (
        <Tooltip title={user.name}>
          <Tag className={styles.userSpan} color="blue">{user.name}</Tag>
        </Tooltip>
      );
    });
  }

  renderUnits = (record = []) => {
    return record.map((unit) => {
      return <Option key={unit.id}>{unit.name}</Option>;
    });
  }

  renderOperation() {
    const { allocationSelectedUsers } = this.props;
    return (
      <div className={styles.userAllocationOperation}>
        <Title text="已选用户" style={{ marginTop: 12 }} />
        <div className={styles.operationContainer}>
          {this.renderUsers(allocationSelectedUsers)}
        </div>
        <Title text="角色" style={{ marginTop: 12 }} />
      </div>
    );
  }

  render() {
    const { loading, tableSize, rowSelection, allocationRoles, handleUpdateType, type } = this.props;
    const { filterInputText, tableKey } = this.state;
    const bordered = true;
    const columns = this.getColumn();
    const { y } = this.state;
    // eslint-disable-next-line no-undef
    const scroll = app.isIE() ? { y } : { x: true, y }; //app.isIE()
    const dataSource = this.filterSource();
    return (
      <div className={styles.userAllocationContainer}>
        {this.renderOperation()}
        <div>
        {allocationRoles.length !== 0 && <Search
          value={filterInputText}
          placeholder="输入关键字过滤搜索"
          onSearch={this.onSearch}
          onChange={this.onChange}
          enterButton
          style={{ width: 237, marginBottom: 8, marginRight: 16 }} />}
          {type !== 'single' && <Radio.Group defaultValue={0} onChange={handleUpdateType}>
            <Radio value={0}>不覆盖</Radio>
            <Radio value={1}>覆盖</Radio>
          </Radio.Group>}
        </div>
        <Table
          key={tableKey}
          locale={{ emptyText: '' }}
          id="userAllocationTable"
          rowClassName={tableSize}
          bordered={bordered}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowSelection={rowSelection}
          pagination={false}
          scroll={scroll}
          rowKey={record => record.roleCode} />
      </div>
    );
  }
}

export default connect()(Allocation);
