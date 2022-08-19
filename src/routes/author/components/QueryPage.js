/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import QueryContent from './QueryContent';
import Search from './Search';
import AuthorTypes from '../../../common/AuthorTypes';
import {
  authorUserSearchColumns, calcPageOptions, authorUserSearchColumnsForVadp,
} from '../../../common/AdminContacts';
import actions from '../../../shared/actions'
// 用户权限查询
class UserQueryPage extends PureComponent {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  componentDidMount() {
    const {dispatch, tableSearchValue: {unitValue}} = this.props;
    dispatch({type: 'adminAuthor/update', payload: {userPageNum: 1}});
    dispatch({type: 'adminAuthor/fetchAuthorUsers', payload: {type: AuthorTypes.USER_QUERY, compCode: unitValue}});
    dispatch({type: 'adminAuthor/fetchSearchUnit', payload: {type: AuthorTypes.USER_QUERY}});
    dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.USER_QUERY}});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminAuthor/resetTableSearchValue'});
  }

  onShowSizeChange = (current, pageSize) => {
    const {recordCount, pageNum, dispatch} = this.props;
    const option = calcPageOptions(pageNum, pageSize, recordCount);
    dispatch({type: 'adminAuthor/update', payload: {userPageNum: option.pageNum, userPageSize: option.pageSize}});
    dispatch({type: 'adminAuthor/fetchUserTable'});
  }

  render() {
    const {
      dispatch, tableSearchValue: {authorMenus, tableSize}, tableSearchValue,
      pageSize, pageNum, recordCount, currentUser, product,
    } = this.props;
    const {userPageSize, userPageNum, userRecordCount, userFetching, user, unitValue} = tableSearchValue;
    const searchProps = {
      userPageSize,
      userPageNum,
      userRecordCount,
      userFetching,
      user,
      unitValue,
      currentUser,
      searchColumns: product === 'vadp' ? authorUserSearchColumnsForVadp : authorUserSearchColumns,
      type: AuthorTypes.USER_QUERY,
      searchValue: tableSearchValue,
      onSelect: (value) => {
        dispatch({type: 'adminAuthor/updateTableSearchValue', payload: value});
      },
      onFetchCopy: (value) => {
        dispatch({type: 'adminAuthor/fetchSearchCopys', payload: {type: AuthorTypes.USER_QUERY, compCode: value}});
      },
      onFetchUser: (value) => {
        dispatch({type: 'adminAuthor/fetchAuthorUsers', payload: {type: AuthorTypes.USER_QUERY, compCode: value}});
      },
      onFetchMod: () => {
        dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.USER_QUERY}});
      },
      onSearch: () => {
        dispatch({type: 'adminAuthor/update', payload: {userPageNum: 1, userRecordCount: 0}});
        dispatch({type: 'adminAuthor/fetchUserTable'});
      },
      onCleanData: () => {
        dispatch({type: 'adminAuthor/updateTableSearchValue', payload: {authorMenus: []}});
        dispatch({type: 'adminAuthor/update', payload: {userRecordCount: 0}});
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
        dispatch({type: 'adminAuthor/update', payload: {userPageNum: number}});
        dispatch({type: 'adminAuthor/fetchUserTable'});
      },
    }

    return (
      <div className="animated fadeIn">
        <Search {...searchProps}/>
        <QueryContent {...contentProps}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tableSearchValue: state.adminAuthor.tableSearchValue,
    pageSize: state.adminAuthor.userPageSize,
    pageNum: state.adminAuthor.userPageNum,
    recordCount: state.adminAuthor.userRecordCount,
    currentUser: state.user.currentUser,
    product: state.global.product,
  };
}

export default connect(mapStateToProps)(UserQueryPage);
