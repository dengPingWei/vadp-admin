import lodash from 'lodash';
import React, {PureComponent} from 'react';
import {connect} from 'dva';
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

const Option = AutoComplete.Option;
const SelectOption = Select.Option;
const FormItem = Form.Item;

class RoleButtonSearch extends PureComponent {

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
    const {roleValue, unitValue, modValue, copyValue} = this.props;
    const list = {
      unit: unitValue,
      role: roleValue,
      mod: modValue,
      copy: copyValue,
    };
    return list[field];
  }

  getOptions = (field) => {
    const {roles, units, mods, copys, copyValue} = this.props;
    const list = {
      unit: units,
      role: roles,
      mod: mods,
      copy: copys,
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
          options.push(option);
        }
      }
    }
    return options;
  }

  switchHandler = (field, value) => {
    const {dispatch, onSelect, form: {setFieldsValue}} = this.props;
    if (field === InputType.search) {
      this.onSubmit();
    } else {
      if (field === 'unit') {
        onSelect({unitValue: value, copyValue: '', copys: []});
        setFieldsValue({ copy: ''});
        dispatch({type: 'adminButton/fetchCopysByRole'});
      } else if (field === 'role') {
        onSelect({roleValue: value});
        // setFieldsValue({mod: '', copy: '', unit: ''});
      } else if (field === 'mod') {
        onSelect({modValue: value});
      } else if (field === 'copy') {
        onSelect({copyValue: value, modValue: '', mods: []});
        setFieldsValue({mod: ''});
        dispatch({type: 'adminButton/fetchModsByRole'});
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
    const {onSave, searchColumns} = this.props;
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
          <Title text="按钮授权"/>
          <Button
            className="portal-admin-add-btn"
            type="primary"
            style={buttonStyle}
            onClick={onSave}
          >{Field.SAVE}</Button>
        </div>
      </div>
    );
  };
}

function mapStateToProps(state) {
  return {
    roles: state.adminButton.roleState.roles,
    units: state.adminButton.roleState.units,
    mods: state.adminButton.roleState.mods,
    copys: state.adminButton.roleState.copys,
    roleValue: state.adminButton.roleState.roleValue,
    unitValue: state.adminButton.roleState.unitValue,
    modValue: state.adminButton.roleState.modValue,
    copyValue: state.adminButton.roleState.copyValue,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(Form.create()(RoleButtonSearch));
