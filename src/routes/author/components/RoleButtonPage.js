/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {connect} from 'dva';
import ButtonSearch from './RoleButtonSearch';
import ButtonTable from './RoleButtonTable';
import {RoleButtonColumns} from '../../../common/AdminContacts';
import actions from '../../../shared/actions'

class RoleButtonPage extends PureComponent {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminButton/fetchRoles'});
    dispatch({type: 'adminButton/fetchUnitsByRole'});
    dispatch({type: 'adminButton/fetchModsByRole'});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminButton/resetRoleState'});
  }

  render() {
    const {
      dispatch,
      searchValue,
      selectedRowKeys,
      dataSource,
      resource,
      currentUser,
    } = this.props;

    const searchProps = {
      currentUser,
      searchColumns: RoleButtonColumns,
      searchValue,
      onSelect: (value) => {
        dispatch({type: 'adminButton/updateRoleState', payload: value});
      },
      onSearch: () => {
        dispatch({type: 'adminButton/fetchDefinedSourceByRole'});
      },
      onSave: () => {
        dispatch({type: 'adminButton/saveButtonByRole'});
      },
    };

    const contentProps = {
      dataSource,
      selectedRowKeys,
      resource,
      updateKeys: (keys) => {
        dispatch({type: 'adminButton/updateRoleState', payload: {selectedRowKeys: keys}});
      },
      update: (payload) => {
        dispatch({type: 'adminButton/updateRoleState', payload});
      },
    }

    return (
      <div className="animated fadeIn">
        <ButtonSearch {...searchProps} />
        <ButtonTable {...contentProps}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    roles: state.adminButton.roleState.roles,
    dataSource: state.adminButton.roleState.dataSource,
    resource: state.adminButton.roleState.resource,
    selectedRowKeys: state.adminButton.roleState.selectedRowKeys,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(RoleButtonPage);
