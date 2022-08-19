import lodash from 'lodash';
import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {AutoComplete, Button, Select, Form, Col, Row, Title, Input} from '@vadp/ui';
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
const {Search} = Input;

class ButtonSearch extends PureComponent {

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

  onChange = (event) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminButton/update', payload: {filterInputText: event.currentTarget.value}});
  }

  onSearch = (filterValue) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminButton/update', payload: {filterValue, tableKey: Date.now().toString()}});
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

  getDisabled = (field) => {
    const {userValue, unitValue} = this.props;
    if (field === 'unit') {
      return userValue === '' || userValue === undefined;
    } else if (field === 'mod' || field === 'copy') {
      return userValue === '' || userValue === undefined || unitValue === '' || unitValue === undefined;
    } else if (field === 'user') {
      return false;
    }
  }

  getDefaultValue = (field) => {
    const {userValue, unitValue, modValue, copyValue, roleValue} = this.props;
    const list = {
      unit: unitValue,
      user: userValue,
      role: roleValue,
      mod: modValue,
      copy: copyValue,
    };
    return list[field];
  }

  getOptions = (field) => {
    const {users, units, mods, copys, copyValue} = this.props;
    const list = {
      unit: units,
      user: users,
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
          // if (id === 'sys') {
          //   if (roleValue === '1000') options.push(option);
          // } else {
          options.push(option);
          // }
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
        onSelect({unitValue: value, modValue: '', mods: [], copyValue: '', copys: []});
        setFieldsValue({mod: '', copy: ''});
        dispatch({type: 'adminButton/fetchCopys'});
        dispatch({type: 'adminButton/fetchMods'});
      } else if (field === 'user') {
        onSelect({userValue: value, modValue: '', mods: [], copyValue: '', copys: [], unitValue: '', units: []});
        setFieldsValue({mod: '', copy: '', unit: ''});
        dispatch({type: 'adminButton/fetchUnits', payload: {userValue: value}});
      } else if (field === 'mod') {
        onSelect({modValue: value});
      } else if (field === 'copy') {
        onSelect({copyValue: value, modValue: '', mods: []});
        setFieldsValue({mod: ''});
        dispatch({type: 'adminButton/fetchMods'});
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
    const {onSave, filterInputText, searchColumns, dataSource} = this.props;
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
                formItem.disabled = this.getDisabled(formItem.field);
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
        {dataSource.length !== 0 && <Search
          value={filterInputText}
          placeholder="输入关键字过滤搜索"
          onSearch={this.onSearch}
          onChange={this.onChange}
          enterButton
          style={{width: 337, marginBottom: 8}}/>}
      </div>
    );
  };
}

function mapStateToProps(state) {
  return {
    users: state.adminButton.users,
    units: state.adminButton.units,
    mods: state.adminButton.mods,
    copys: state.adminButton.copys,
    userValue: state.adminButton.userValue,
    unitValue: state.adminButton.unitValue,
    modValue: state.adminButton.modValue,
    copyValue: state.adminButton.copyValue,
    filterValue: state.adminButton.filterValue,
    filterInputText: state.adminButton.filterInputText,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(Form.create()(ButtonSearch));
