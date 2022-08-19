/**
 * created by huangzhangshu
 * 用户搜索
 */
import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Button, Select, Input} from '@vadp/ui';
import {Field} from '../common/UserContacts';
import styles from '../style/Search.less';

const SelectOption = Select.Option;

class Search extends PureComponent {
  // 选择角色
  onRoleChange = (value) => {
    this.handleUpdateSearchValue({searchRoleValue: value});
  }

  // 选择用户
  onUserChange = (value) => {
    this.handleUpdateSearchValue({searchAccountValue: value});
  }

  // 选择类型
  onTypeChange = (value) => {
    this.handleUpdateSearchValue({searchTypeValue: value});
  }

  // 选择组织
  onUnitChange = (value) => {
    this.handleUpdateSearchValue({searchUnitValue: value, searchDeptValue: ''});
  }

  // 选择部门
  onDeptChange = (value) => {
    this.handleUpdateSearchValue({searchDeptValue: value});
  }

  // 匹配大小写
  onFilterOption = (input, option) => {
    if (!option.props.children || !input) return false;
    const {spell = ''} = option.props;
    return option.props.children
        .toLowerCase().indexOf(input.toLowerCase()) >= 0
      || spell.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  handleSearch = () => {
    const {searchAccountValue, searchRoleValue, searchTypeValue, dispatch} = this.props;
    dispatch({type: 'adminUser/updatePageInfo', payload: {pageNum: 1}});
    dispatch({type: 'adminUser/searchUsers', payload: {searchAccountValue, searchRoleValue, searchTypeValue}});
  }

  handleUpdateSearchValue = (data) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/updateSearchValue', payload: data});
  }

  // 绘制角色选项
  renderRolesOption = (roles) => {
    return roles.map((role, index) => {
      return <SelectOption key={`${role.roleCode}${index}`} value={role.roleCode} spell="">{role.name}</SelectOption>;
    });
  }

  // 绘制用户选项
  renderUsersOption = (users) => {
    return users.map((user, index) => {
      return <SelectOption key={`${user.id}${index}`} value={user.account}>{user.name}</SelectOption>;
    });
  }

  // 绘制类型选项
  renderTypeOption = () => {
    const {currentUser: {account}} = this.props;
    const typeOptions = [];
    typeOptions.push(<SelectOption key="users_search_type_empty" value="" spell=""
                                   style={{height: 30}}></SelectOption>);
    typeOptions.push(<SelectOption key="users_search_type_0" value="0" spell="PTYG">普通员工</SelectOption>);
    if (account === 'admin') {
      typeOptions.push(<SelectOption key="users_search_type_1" value="1" spell="GLY">管理员</SelectOption>);
    }
    return typeOptions;
  }

  // 绘制部门选项
  renderDeptOption = () => {
    const {departmentList = [], searchUnitValue = ''} = this.props;
    const depts = [];
    depts.push(<SelectOption
      key="users_search_dept_empty"
      value=""
      spell=""
      style={{height: 30}}></SelectOption>);
    departmentList.filter(({compCode}) => compCode === searchUnitValue).forEach(({deptCode, deptName, spell = ''}) => {
      depts.push(<SelectOption key={`dept${deptCode}`} value={deptCode} spell={spell}>{deptName}</SelectOption>);
    });
    return depts;
  }

  // 绘制类型选项
  renderUnitOption = () => {
    const {modalUnits = []} = this.props;
    const unitOptions = [];
    unitOptions.push(<SelectOption key="users_search_unit_empty" value="" spell=""
                                   style={{height: 30}}></SelectOption>);
    modalUnits.forEach(({code, name, spell = ''}) => {
      unitOptions.push(<SelectOption key={code} value={code} spell={spell}>{name}</SelectOption>);
    });
    return unitOptions;
  }

  render() {
    const {
      searchAccountValue, searchRoleValue, searchTypeValue, searchRoles, searchUnitValue, searchDeptValue
    } = this.props;
    const buttonStyle = {height: '30px'};
    return (
      <div className={styles.userSearch}>
        <div className={styles.inputContainer}>
          <div>
            <span className={styles.searchLabel}>{Field.USER_SEARCH_NAME}</span>
            <Input
              className={styles.autoComplete}
              value={searchAccountValue}
              onChange={(e) => this.onUserChange(e.target.value)}/>
          </div>
          <div className={styles.searchMargin}>
            <span className={styles.searchLabel}>{Field.ROLE_LABEL}</span>
            <Select
              showSearch
              onChange={this.onRoleChange}
              value={searchRoleValue}
              className={styles.autoComplete}
              filterOption={this.onFilterOption}>
              <SelectOption key="users_search_role_empty" value="" style={{height: 30}}></SelectOption>
              {this.renderRolesOption(searchRoles)}
            </Select>
          </div>

          <div className={styles.searchMargin}>
            <span className={styles.searchLabel}>{Field.USER_TYPE}</span>
            <Select
              showSearch
              // getPopupContainer={t => t.parentElement}
              value={searchTypeValue}
              onChange={this.onTypeChange}
              className={styles.autoComplete}
              filterOption={this.onFilterOption}>
              {this.renderTypeOption()}
            </Select>
          </div>

          <div className={styles.searchMargin}>
            <span className={styles.searchLabel}>{Field.USER_UNIT}</span>
            <Select
              showSearch
              value={searchUnitValue}
              onChange={this.onUnitChange}
              className={styles.autoComplete}
              filterOption={this.onFilterOption}>
              {this.renderUnitOption()}
            </Select>
          </div>

          <div className={styles.searchMargin}>
            <span className={styles.searchLabel}>{Field.USER_DEPT}</span>
            <Select
              showSearch
              value={searchDeptValue}
              onChange={this.onDeptChange}
              className={styles.autoComplete}
              filterOption={this.onFilterOption}
            >
              {this.renderDeptOption()}
            </Select>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            className="portal-admin-add-btn"
            style={buttonStyle}
            // icon="search"
            onClick={this.handleSearch}
          >{Field.SEARCH}</Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchRoles: state.adminUser.searchRoles,
    searchAccountValue: state.adminUser.searchAccountValue,
    searchRoleValue: state.adminUser.searchRoleValue,
    searchTypeValue: state.adminUser.searchTypeValue,
    searchUnitValue: state.adminUser.searchUnitValue,
    searchDeptValue: state.adminUser.searchDeptValue,
    currentUser: state.user.currentUser,
    modalUnits: state.adminUser.modalUnits,
    departmentList: state.adminUser.departmentList,
  };
}

export default connect(mapStateToProps)(Search);
