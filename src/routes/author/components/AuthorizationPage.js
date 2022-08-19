/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import RuleSearch from './Search';
import AuthorizationContent from './AuthorizationContent';
import AuthorTypes from '../../../common/AuthorTypes';
import {
  authorUserColumns,
  authorUserColumnsForVadp,
} from '../../../common/AdminContacts';
import actions from '../../../shared/actions'

// 用户权限
class AuthorizationPage extends PureComponent {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  componentDidMount() {
    const {dispatch, searchValue: {unitValue}} = this.props;
    dispatch({type: 'adminAuthor/fetchAuthorUsers', payload: {type: AuthorTypes.USER_AUTHOR, compCode: unitValue}});
    dispatch({type: 'adminAuthor/fetchSearchUnit', payload: {type: AuthorTypes.USER_AUTHOR}});
    dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.USER_AUTHOR}});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminAuthor/resetSearchValue'});
  }

  render() {
    const {
      dispatch,
      searchValue,
      authorResource,
      selectedRowKeys,
      expandedRowKeys,
      authorMenus,
      currentUser,
      product,
    } = this.props;
    const {userPageSize, userPageNum, userRecordCount, userFetching, user, unitValue} = searchValue;
    const searchProps = {
      unitValue,
      user,
      userPageNum,
      userPageSize,
      userRecordCount,
      userFetching,
      currentUser,
      searchColumns: product === 'vadp' ? authorUserColumnsForVadp : authorUserColumns,
      type: AuthorTypes.USER_AUTHOR,
      searchValue,
      onSelect: (value) => {
        dispatch({type: 'adminAuthor/updateSearchValue', payload: value});
      },
      onFetchCopy: (value) => {
        dispatch({type: 'adminAuthor/fetchSearchCopys', payload: {type: AuthorTypes.USER_AUTHOR, compCode: value}});
        dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.USER_AUTHOR}});
      },
      onFetchUser: (value) => {
        dispatch({type: 'adminAuthor/fetchAuthorUsers', payload: {type: AuthorTypes.USER_AUTHOR, compCode: value}});
      },
      onFetchMod: () => {
        dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.USER_AUTHOR}});
      },
      onSearch: () => {
        dispatch({type: 'adminAuthor/fetchAuthorMenus', payload: {type: AuthorTypes.USER_AUTHOR}});
      },
      onSave: () => {
        dispatch({type: 'adminAuthor/saveAuthor', payload: {type: AuthorTypes.USER_AUTHOR}});
      },
      onCleanData: () => {
        dispatch({
          type: 'adminAuthor/updateSearchValue',
          payload: {authorMenus: [], expandedRowKeys: [], authorResource: []}
        });
      },
    };

    const contentProps = {
      authorMenus,
      selectedRowKeys,
      expandedRowKeys,
      authorResource,
      updateKeys: (keys) => {
        dispatch({type: 'adminAuthor/updateSearchValue', payload: {selectedRowKeys: keys}});
      },
      update: (payload) => {
        dispatch({type: 'adminAuthor/update', payload});
      },
    }

    return (
      <div className="animated fadeIn">
        <RuleSearch {...searchProps} />
        <AuthorizationContent {...contentProps}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchValue: state.adminAuthor.searchValue,
    authorMenus: state.adminAuthor.searchValue.authorMenus,
    authorResource: state.adminAuthor.searchValue.authorResource,
    selectedRowKeys: state.adminAuthor.searchValue.selectedRowKeys,
    expandedRowKeys: state.adminAuthor.searchValue.expandedRowKeys,
    currentUser: state.user.currentUser,
    product: state.global.product,
  };
}

export default connect(mapStateToProps)(AuthorizationPage);
