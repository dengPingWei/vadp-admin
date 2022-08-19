import lodash from 'lodash';
import React, {PureComponent} from 'react';
import {AutoComplete, Button, Select, Form, Col, Row, Title} from '@vadp/ui';
import {Field} from '../../users/common/UserContacts';
import styles from '../style/Search.less';
import {switchItem, warpFormForSearch} from '../../../utils/FormUtil';
import {
  miniFormItemLayout,
  fullFormItemLayout,
  searchFormItemLayout,
} from '../../../common/AdminContacts';
import InputType from '../../../utils/InputType';
import AuthorTypes from '../../../common/AuthorTypes';

const Option = AutoComplete.Option;
const SelectOption = Select.Option;
const FormItem = Form.Item;

class Search extends PureComponent {
  onInputChange(e) {
    const {onUpdateRoleKey} = this.props;
    onUpdateRoleKey(e.target.value);
  }

  // 匹配大小写
  onFilterOption = (input, option) => {
    if (!option.props.children || !input) return false;
    return option.props.children
      .toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  onSubmit = () => {
    const {form: {validateFields}, onSearch} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      onSearch();
    });
  }

  getDefaultValue = (field) => {
    const {
      searchValue: {
        userValue, unitValue, modValue, copyValue, roleValue,
      },
    } = this.props;
    const list = {
      unit: unitValue,
      user: userValue,
      role: roleValue,
      mod: modValue,
      copy: copyValue,
    };
    return list[field];
  }

  getRoleByCode = (code) => {
    const {searchValue: {roles}} = this.props;
    for (const role of roles) {
      if (role.roleCode === code) return role;
    }
    return {};
  }

  getOptions = (field) => {
    const {
      searchValue: {
        user, unit, mods, copys, roles, copyValue, roleValue,
      },
    } = this.props;
    const list = {
      unit,
      user,
      mod: mods,
      copy: copys,
      role: roles,
    };
    let options = list[field];
    if (field === 'mod') {
      // 根据是否账套相关 筛选系统列表
      const modOptions = lodash.cloneDeep(options) || [];
      options = lodash.cloneDeep([]);
      for (const option of modOptions) {
        const {isAccount, id} = option;
        if (copyValue && isAccount) {
          options.push(option);
        } else if (!copyValue && !isAccount) {
          const role = this.getRoleByCode(roleValue);
          if (id === 'sys') {
            if (roleValue === '1000' || role.roleAdminType === 2) options.push(option);
          } else if (id === 'mdp') {
            if (role.roleAdminType === 2) options.push(option);
          }  else {
            options.push(option);
          }
        }
      }
    }
    return options;
  }

  switchHandler = (field, value) => {
    const {
      onSelect, onFetchCopy, onFetchMod, currentUser: {account},
      searchValue: {roles, modValue, copyValue}, onSelectRole, form: {setFieldsValue}, onCleanData,
    } = this.props;
    if (field === InputType.search) {
      this.onSubmit();
    } else {
      if (onCleanData) onCleanData();
      if (field === 'unit') {
        if (copyValue) {
          setFieldsValue({mod: ''});
          onSelect({modValue: ''});
        }
        setFieldsValue({copy: ''});
        onSelect({copyValue: '', copys: []});
        onSelect({unitValue: value});
        onFetchCopy(value);
        if (account !== 'admin') {
          setFieldsValue({mod: ''});
          onSelect({modValue: '', mods: []});
          onFetchMod();
        }
      } else if (field === 'user') {
        // onSelect({modValue: '', mods: []});
        onSelect({userValue: value});
      } else if (field === 'mod') {
        onSelect({modValue: value});
      } else if (field === 'copy') {
        onSelect({copyValue: value});
        setFieldsValue({mod: ''});
        onSelect({modValue: '', mods: []});
        onFetchMod();
      } else if (field === 'role') {
        onSelect({roleValue: value});
        if (value !== '1000' && modValue === 'sys') {
          setFieldsValue({mod: ''});
          onSelect({modValue: ''});
        }
        setFieldsValue({mod: ''});
        onSelect({modValue: ''});
        for (const role of roles) {
          if (role.roleCode === value) {
            if (role.roleType === 0) {
              if (onSelectRole) onSelectRole(true);
            } else {
              if (onSelectRole) onSelectRole(false);
            }
          }
        }
      }
    }
  }

  renderOption(domain) {
    return (
      <Option key={domain.id} value={domain.id}>
        {domain.name}
      </Option>
    );
  }

  renderSelectOption = (value) => {
    return value.map((item) => {
      return (
        <SelectOption
          key={item.id || item.copyId}
          value={item.account || item.code || item.copyCode ||
          item.menuCode}>{item.name || item.copyName || item.modName}</SelectOption>
      );
    });
  }

  render() {
    const {onSave, type, searchColumns} = this.props;
    const {getFieldDecorator} = this.props.form;
    const buttonStyle = {height: '30px'};
    return (
      <div className={styles.roleSearch}>

        <Form onSubmit={this.onSubmit}>
          {warpFormForSearch(searchColumns).map((columns, index) => {
            return <Row>
              {columns.map((column) => {
                const formItem = {...column};
                let formItemLayout = formItem.span === 24 ?
                  fullFormItemLayout : miniFormItemLayout;
                if (formItem.type === InputType.search)
                  formItemLayout = searchFormItemLayout;
                if (formItem.type === InputType.select)
                  formItem.options = this.getOptions(formItem.field);
                return (
                  <Col span={formItem.span || 8} key={`${formItem.field}${index}`}>
                    <FormItem {...formItemLayout} label={formItem.text}>
                      {getFieldDecorator(formItem.field, {
                        initialValue: this.getDefaultValue(formItem.field) || formItem.defaultValue,
                        rules: [{
                          required: formItem.required,
                          message: formItem.errorMessage,
                        }],
                      })(switchItem(formItem, this.switchHandler))}
                    </FormItem>
                  </Col>
                );
              })}
            </Row>
          })}
        </Form>
        <div className={styles.header}>
          <Title text="角色授权"/>
          {(type === AuthorTypes.USER_AUTHOR || type === AuthorTypes.ROLE_AUTHOR) && <Button
            className="portal-admin-add-btn"
            type="primary"
            style={buttonStyle}
            onClick={onSave}
          >{Field.SAVE}</Button>}
        </div>
      </div>
    );
  };
}

export default Form.create()(Search);
