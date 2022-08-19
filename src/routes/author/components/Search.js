import lodash from 'lodash';
import React, {PureComponent} from 'react';
import {Button, Form, Col, Row, Title} from '@vadp/ui';
import {connect} from 'dva';
import {Field} from '../../users/common/UserContacts';
import styles from '../style/Search.less';
import {switchItem, warpFormForSearch} from '../../../utils/FormUtil';
import {
  miniFormItemLayout,
  fullFormItemLayout,
  searchFormItemLayout
} from '../../../common/AdminContacts';
import InputType from '../../../utils/InputType';
import AuthorTypes from '../../../common/AuthorTypes';

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

  getOptions = (field) => {
    const {
      searchValue: {
        user, unit, mods, copys, userValue, copyValue,
      },
    } = this.props;
    const list = {
      unit,
      user,
      mod: mods,
      copy: copys,
    };
    let options = list[field];
    if (field === 'mod' && userValue) {
      // 如果是普通员工,则不显示系统管理平台
      for (const u of user) {
        if (u.account === userValue && u.type === '0') {
          options = lodash.cloneDeep(options) || [];
          for (let i = 0; i < options.length; i++) {
            if (options[i].id === 'sys') {
              options.splice(i, 1);
            }
          }
          for (let i = 0; i < options.length; i++) {
            if (options[i].id === 'mdp') {
              options.splice(i, 1);
            }
          }
        }
      }
    }
    if (field === 'mod') {
      // 根据是否账套相关 筛选系统列表
      const modOptions = lodash.cloneDeep(options) || [];
      options = lodash.cloneDeep([]);
      for (const option of modOptions) {
        const {isAccount} = option;
        if (copyValue && isAccount) {
          options.push(option);
        } else if (!copyValue && !isAccount) {
          options.push(option);
        }
      }
    }
    return options;
  }

  onSelect = (selectedValue) => {
    const {dispatch, type, unitValue} = this.props;
    if (type === AuthorTypes.USER_AUTHOR) {
      dispatch({type: 'adminAuthor/updateSearchValue', payload: {userSearchKey: '', selectedValue}});
      dispatch({
        type: 'adminAuthor/fetchAuthorUsers',
        payload: {type: AuthorTypes.USER_AUTHOR, compCode: unitValue, isReplace: true},
      });
    } else if (type === AuthorTypes.USER_QUERY) {
      dispatch({type: 'adminAuthor/updateTableSearchValue', payload: {userSearchKey: '', selectedValue}});
      dispatch({
        type: 'adminAuthor/fetchAuthorUsers',
        payload: {type: AuthorTypes.USER_QUERY, compCode: unitValue, isReplace: true},
      });
    }
  }

  selectScroll = (event) => {
    event.persist();
    const {dispatch, type, user = [], userRecordCount, userFetching, userPageNum, unitValue} = this.props
    const {target} = event;
    if (type === AuthorTypes.USER_AUTHOR) {
      if (target.scrollTop + target.offsetHeight === target.scrollHeight
        && user.length < userRecordCount && !userFetching) {
        // 调用api方法
        dispatch({type: 'adminAuthor/updateSearchValue', payload: {userPageNum: userPageNum + 1}});
        dispatch({
          type: 'adminAuthor/fetchAuthorUsers',
          payload: {type: AuthorTypes.USER_AUTHOR, compCode: unitValue},
        });
      }
    } else if (type === AuthorTypes.USER_QUERY) {
      if (target.scrollTop + target.offsetHeight === target.scrollHeight
        && user.length < userRecordCount && !userFetching) {
        // 调用api方法
        dispatch({type: 'adminAuthor/updateTableSearchValue', payload: {userPageNum: userPageNum + 1}});
        dispatch({
          type: 'adminAuthor/fetchAuthorUsers',
          payload: {type: AuthorTypes.USER_QUERY, compCode: unitValue},
        });
      }
    }
  }

  selectSearch = (searchKey) => {
    const {dispatch, unitValue, type} = this.props;
    if (type === AuthorTypes.USER_AUTHOR) {
      dispatch({
        type: 'adminAuthor/updateSearchValue',
        payload: {userSearchKey: searchKey, user: [], userRecordCount: 0, userPageNum: 1},
      });
      dispatch({type: 'adminAuthor/fetchAuthorUsers', payload: {type: AuthorTypes.USER_AUTHOR, compCode: unitValue}});
    } else if (type === AuthorTypes.USER_QUERY) {
      dispatch({
        type: 'adminAuthor/updateTableSearchValue',
        payload: {userSearchKey: searchKey, user: [], userRecordCount: 0, userPageNum: 1},
      });
      dispatch({type: 'adminAuthor/fetchAuthorUsers', payload: {type: AuthorTypes.USER_QUERY, compCode: unitValue}});
    }
  }

  switchHandler = (field, value) => {
    const {onCleanData} = this.props;
    const {
      onSelect, onFetchCopy, onFetchMod, currentUser: {account}, form: {setFieldsValue},
      searchValue: {copyValue}
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
        // onFetchUser(value);
      } else if (field === 'user') {
        setFieldsValue({mod: ''});
        // onSelect({modValue: '', mods: []});
        onSelect({userValue: value});
        setFieldsValue({mod: ''});
        onSelect({modValue: ''});
      } else if (field === 'mod') {
        onSelect({modValue: value});
      } else if (field === 'copy') {
        onSelect({copyValue: value});
        setFieldsValue({mod: ''});
        onSelect({modValue: '', mods: []});
        onFetchMod();
      }
    }
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
                if (formItem.field === 'user') {
                  formItem.selectScroll = this.selectScroll;
                  formItem.selectSearch = this.selectSearch;
                  formItem.onSelect = this.onSelect;
                }
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
            </Row>;
          })}
        </Form>
        <div className={styles.header}>
          <Title text="用户授权"/>
          {(type === AuthorTypes.USER_AUTHOR) && <Button
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

export default connect()(Form.create()(Search));
