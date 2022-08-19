/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Scroll} from '@vadp/ui';

import AuthorRoleQueryContent from './AuthorRoleQueryContent';
import RoleSearch from './RuleSearch';
import AuthorTypes from '../../../common/AuthorTypes';
import {
  authorRoleSearchColumns, calcPageOptions, authorRoleSearchColumnsForVadp,
} from '../../../common/AdminContacts';
import actions from '../../../shared/actions'
//
class RoleQueryPage extends PureComponent {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminAuthor/update', payload: {rolePageNum: 1}});
    dispatch({type: 'adminAuthor/fetchAuthorRoles', payload: {type: AuthorTypes.ROLE_QUERY}});
    dispatch({type: 'adminAuthor/fetchSearchUnit', payload: {type: AuthorTypes.ROLE_QUERY}});
    dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.ROLE_QUERY}});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminAuthor/resetRoleTableSearchValue'});
  }

  onShowSizeChange = (current, pageSize) => {
    const {recordCount, pageNum, dispatch} = this.props;
    const option = calcPageOptions(pageNum, pageSize, recordCount);
    dispatch({type: 'adminAuthor/update', payload: {rolePageNum: option.pageNum, rolePageSize: option.pageSize}});
    dispatch({type: 'adminAuthor/fetchRoleTable'});
  }

  render() {
    const {
      dispatch, tableSearchValue: {authorMenus, tableSize}, tableSearchValue,
      pageSize, pageNum, recordCount, currentUser, product,
    } = this.props;

    const searchProps = {
      currentUser,
      searchColumns: product === 'vadp' ? authorRoleSearchColumnsForVadp : authorRoleSearchColumns,
      type: AuthorTypes.USER_QUERY,
      searchValue: tableSearchValue,
      onSelect: (value) => {
        dispatch({type: 'adminAuthor/updateRoleTableSearchValue', payload: value});
      },
      onFetchMod: () => {
        dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.ROLE_QUERY}});
      },
      onFetchCopy: (value) => {
        dispatch({type: 'adminAuthor/fetchSearchCopys', payload: {type: AuthorTypes.ROLE_QUERY, compCode: value}});
      },
      onSearch: () => {
        dispatch({type: 'adminAuthor/update', payload: {rolePageNum: 1, roleRecordCount: 0}});
        dispatch({type: 'adminAuthor/fetchRoleTable'});
      },
      onCleanData: () => {
        dispatch({type: 'adminAuthor/updateRoleTableSearchValue', payload: {authorMenus: []}});
        dispatch({type: 'adminAuthor/update', payload: {roleRecordCount: 0}});
      },
    };

    const contentProps = {
      authorMenus,
      tableSize,
      pageSize,
      pageNum,
      recordCount,
      onShowSizeChange: this.onShowSizeChange,
      onPageChange: (number) => {
        dispatch({type: 'adminAuthor/update', payload: {rolePageNum: number}});
        dispatch({type: 'adminAuthor/fetchRoleTable'});
      },
    }

    return (
      <Scroll className="animated fadeIn">
        <RoleSearch {...searchProps}/>
        <AuthorRoleQueryContent {...contentProps}/>
      </Scroll>
    );
  }
}

function mapStateToProps(state) {
  return {
    tableSearchValue: state.adminAuthor.roleTableSearchValue,
    pageSize: state.adminAuthor.rolePageSize,
    pageNum: state.adminAuthor.rolePageNum,
    recordCount: state.adminAuthor.roleRecordCount,
    currentUser: state.user.currentUser,
    product: state.global.product,
  };
}

export default connect(mapStateToProps)(RoleQueryPage);
