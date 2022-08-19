import React, {PureComponent} from 'react';
import {Select, Button, Input} from '@vadp/ui';
import {Field} from '../../users/common/UserContacts';
import styles from '../style/Search.less';

const {Option} = Select;

export default class Search extends PureComponent {

  onInputChange(e) {
    const {onUpdateRoleKey} = this.props;
    onUpdateRoleKey(e.target.value);
  }

  onSelectChange = (value) => {
    const {onUpdateRoleType} = this.props;
    if (onUpdateRoleType) onUpdateRoleType(value);
  }

  // 绘制类型选项
  renderTypeOption = () => {
    const typeOptions = [];
    typeOptions.push(<Option key="role_type_empty" value="0" style={{height: 30}}></Option>);
    typeOptions.push(<Option key="role_type_normal" value="1">普通角色</Option>);
    typeOptions.push(<Option key="role_type_manager" value="2">管理员角色</Option>);
    return typeOptions;
  }

  render() {
    const {onSearch, searchRoleValue, searchRoleType} = this.props;
    const buttonStyle = {height: '30px'};
    return (
      <div className={styles.roleSearch}>
        <div className={styles.inputContainer}>
          <div>
            <span className={styles.searchLabel}>{Field.ROLE_NAME}</span>
            <Input
              className={styles.autoComplete}
              value={searchRoleValue}
              placeholder={Field.ROLE_NAME_PLACEHOLDER}
              onChange={this.onInputChange.bind(this)}/>
          </div>

          <div style={{marginLeft: 24}}>
            <span className={styles.searchLabel}>{Field.ROLE_TYPE}</span>
            <Select
              showSearch
              value={searchRoleType}
              onChange={this.onSelectChange}
              className={styles.autoComplete}
            >
              {this.renderTypeOption()}
            </Select>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            className="portal-admin-add-btn"
            style={buttonStyle}
            // icon="search"
            onClick={onSearch}
          >{Field.SEARCH}</Button>
        </div>
      </div>
    );
  };
}
