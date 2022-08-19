/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import RoleSearch from './RuleSearch';
import AuthorizationContent from './AuthorizationContent';
import AuthorTypes from '../../../common/AuthorTypes';
import {
  authorRoleColumns,
  authorRoleColumnsForVadp,
} from '../../../common/AdminContacts';
import actions from '../../../shared/actions'

// 角色权限
class AuthorizationPage extends PureComponent {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  state = {
    searchColumns: authorRoleColumns,
    searchColumnsForVadp: authorRoleColumnsForVadp,
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminAuthor/fetchAuthorRoles', payload: {type: AuthorTypes.ROLE_AUTHOR}});
    dispatch({type: 'adminAuthor/fetchSearchUnit', payload: {type: AuthorTypes.ROLE_AUTHOR}});
    dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.ROLE_AUTHOR}});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminAuthor/resetRoleSearchValue'});
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
    const {searchColumns, searchColumnsForVadp} = this.state;

    const searchProps = {
      currentUser,
      searchColumns: product === 'vadp' ? searchColumnsForVadp : searchColumns,
      type: AuthorTypes.ROLE_AUTHOR,
      searchValue,
      onSelect: (value) => {
        dispatch({type: 'adminAuthor/updateRoleSearchValue', payload: value});
      },
      onFetchMod: () => {
        dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.ROLE_AUTHOR}});
      },
      onFetchCopy: (value) => {
        dispatch({type: 'adminAuthor/fetchSearchCopys', payload: {type: AuthorTypes.ROLE_AUTHOR, compCode: value}});
        dispatch({type: 'adminAuthor/fetchSearchMods', payload: {type: AuthorTypes.ROLE_AUTHOR}});
      },
      onSearch: () => {
        dispatch({type: 'adminAuthor/fetchAuthorMenus', payload: {type: AuthorTypes.ROLE_AUTHOR}});
        dispatch({type: 'adminAuthor/fetchAuthorResource', payload: {type: AuthorTypes.ROLE_AUTHOR}});
      },
      onSave: () => {
        dispatch({type: 'adminAuthor/saveAuthor', payload: {type: AuthorTypes.ROLE_AUTHOR}});
      },
      onSelectRole: (required) => {
        for (const column of searchColumns) {
          if (column.field === 'unit')
            column.required = required;
        }
        this.setState({searchColumns: [...searchColumns]});
      },
      onCleanData: () => {
        dispatch({type: 'adminAuthor/updateRoleSearchValue', payload: {authorMenus: [], expandedRowKeys: [], authorResource: []}});
      },
    };

    const contentProps = {
      authorMenus,
      selectedRowKeys,
      expandedRowKeys,
      authorResource,
      updateKeys: (keys) => {
        dispatch({type: 'adminAuthor/updateRoleSearchValue', payload: {selectedRowKeys: keys}});
      },
      update: (payload) => {
        dispatch({type: 'adminAuthor/update', payload});
      },
    }

    return (
      <div className="animated fadeIn">
        <RoleSearch {...searchProps} />
        <AuthorizationContent {...contentProps}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchValue: state.adminAuthor.roleSearchValue,
    authorMenus: state.adminAuthor.roleSearchValue.authorMenus,
    authorResource: state.adminAuthor.roleSearchValue.authorResource,
    selectedRowKeys: state.adminAuthor.roleSearchValue.selectedRowKeys,
    expandedRowKeys: state.adminAuthor.roleSearchValue.expandedRowKeys,
    currentUser: state.user.currentUser,
    product: state.global.product,
  };
}

export default connect(mapStateToProps)(AuthorizationPage);
