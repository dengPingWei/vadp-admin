import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Row, Col, message} from '@vadp/ui';
import RoleSearch from './components/Search';
import RoleModal from './components/Modal';
import RoleList from './components/ListView';
import AllocationUserModal from './components/AllocationUserModal';
import EditModal from './components/EditModal';
import styles from './index.less';
import actions from '../../shared/actions'

class RolePage extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }

  state = {
    selectedRowKeys: [],  // Check here to configure the default column
    loading: false,
  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/updatePageInfo', payload: {pageNum: 1, userPageNum: 1}});
    dispatch({type: 'adminRole/updateState', payload: {pageNum: 1, recordCount: 0}});
    dispatch({type: 'adminRole/findAll'});
    // dispatch({type: 'adminRole/findUserAll'});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/resetState'});
  }

  handleSelect = (record) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/find', payload: record});
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({selectedRowKeys});
  };

  handleAssignMenus = (item) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/showModal', payload: {modalType: 'assignMenu', currentItem: item}});
  }

  handleAllocation = (record) => {
    const {dispatch} = this.props;
    const {roleAdminType} = record;
    const searchType = String(roleAdminType - 1);
    dispatch({type: 'adminRole/updateState', payload: {allocationSearchUserValue: ''}});
    dispatch({type: 'adminRole/updateAllocationUsers', payload: []});
    dispatch({type: 'adminRole/updateEditVisible', payload: {editModalVisible: false}});
    dispatch({type: 'adminRole/updateAllocationSearchType', payload: searchType});
    dispatch({type: 'adminRole/updatePageInfo', payload: {userPageNum: 1, userRecordCount: 0}});
    dispatch({type: 'adminRole/updateAllocationVisible', payload: true});
    dispatch({type: 'adminRole/setAllocationRole', payload: record});
    dispatch({type: 'adminRole/findUserByRole', payload: record});
    // if (roleCode === '1000') {
    // dispatch({type: 'adminRole/findUserAll', payload: {type: searchType}});
    // dispatch({type: 'adminRole/updateAllocationSearchType', payload: '1'});
    // }
    dispatch({type: 'adminRole/findNeverUsers'});
  }

  handleRemoveUser = (params) => {
    const {dispatch, role: {deleteAccounts = [], modalUsers = []}} = this.props;
    const {account} = params;
    deleteAccounts.push(account);
    for (let i = 0; i < modalUsers.length; i++) {
      if (account === modalUsers[i].account) modalUsers.splice(i, 1);
    }
    dispatch({type: 'adminRole/updateState', payload: {deleteAccounts, modalUsers: [...modalUsers]}});
  }

  handleEdit = (record) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/findUserByRole', payload: record});
    dispatch({type: 'adminRole/updateEditVisible', payload: {editModalVisible: true, modalRole: record}});
  }

  handleChangeResize = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/reset'});
  }

  dismissAllocation = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/updateAllocationVisible', payload: false});
  }

  dismissEdit = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/updateEditVisible', payload: {editModalVisible: false}});
    dispatch({type: 'adminRole/updateState', payload: {deleteAccounts: []}});
  }

  onDeleteRole = (roleRecords) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/delete', payload: roleRecords});
    this.setState({selectedRowKeys: []});
  }

  render() {
    const {
      dispatch, domain, defaultAvatar, defaultDarkAvatar, theme,
      role: {
        modalType, modalVisible, currentDomain, currentItem,
        content, loading, searchRoleType, searchRoleValue, allocationRole,
        allocationSelectedRowKeys, allocationModalVisible, allocationSearchUserValue,
        editModalVisible, editRecord, modalRole, modalUsers, allocationUsers, allocationSearchType,
        pageSize, pageNum, recordCount, userRecordCount, userPageSize, userPageNum, tableSize,checkboxHaveUser
      },
      auth: {currentUser},
      units,
    } = this.props;
    const modalProps = {
      item: modalType === 'create'
        ? {domainId: currentDomain, menuIds: []}
        : currentItem,
      type: modalType,
      visible: modalVisible,
      domains: domain.content,
      currentUser,
      onOk: (data) => {
        dispatch({type: 'adminRole/create', payload: data});
        dispatch({type: 'adminRole/hideModal', payload: modalType});

      },
      onCancel: (e) => {
        dispatch({type: 'adminRole/hideModal', payload: modalType});
      },
      onCheck: (menuKeys) => {
      },
    };
    const {selectedRowKeys} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record.isPreMake === 1,
      }),
    };

    const searchProps = {
      currentDomain,
      searchRoleValue,
      searchRoleType,
      hasSelected: selectedRowKeys.length > 0,
      searchResult: domain.content,
      onSelect: (value) => {
        const params = {
          domain: value,
          page: 1,
        };
        dispatch({type: 'adminRole/updateState', payload: {pageNum: 1, recordCount: 0}});
        dispatch({type: 'adminRole/switchDomain', payload: value});
        dispatch({type: 'adminRole/findAll', payload: params});

      },
      onSearch: () => {
        dispatch({type: 'adminRole/updateState', payload: {pageNum: 1, recordCount: 0}});
        dispatch({type: 'adminRole/findAll'});
      },
      onAdd: () => {
        dispatch({type: 'adminRole/showModal', payload: {modalType: 'create', currentItem: {}}});
      },
      onDelete: () => {
        dispatch({
          type: 'adminRole/deleteBatch',
          payload: {Ids: selectedRowKeys, domain: currentUser.domainId}
        });
        this.setState({selectedRowKeys: []});
      },
      onUpdateRoleKey: (value) => {
        dispatch({type: 'adminRole/updateSearchValue', payload: {searchRoleValue: value}});
      },
      onUpdateRoleType: (value) => {
        dispatch({type: 'adminRole/updateSearchValue', payload: {searchRoleType: value}});
      },
    };

    const listProps = {
      units,
      tableSize,
      pageSize,
      pageNum,
      recordCount,
      selectedRowKeys,
      data: content,
      onRowSelection: rowSelection,
      currentDomain,
      loading,
      onRowClick: this.handleSelect,
      onAssignMenus: this.handleAssignMenus,
      hasSelected: selectedRowKeys.length > 0,
      handleAllocation: this.handleAllocation,
      onDeleteRole: this.onDeleteRole,
      onEditRole: this.handleEdit,
      handleChangeResize: this.handleChangeResize,
      clearSelected: () => {
        this.setState({selectedRowKeys: []});
      },
      onAdd: () => {
        dispatch({type: 'adminRole/showModal', payload: {modalType: 'create', currentItem: {}}});
      },
      onPageChange: (number) => {
        this.setState({selectedRowKeys: []});
        dispatch({type: 'adminRole/updatePageInfo', payload: {pageNum: number}});
        dispatch({type: 'adminRole/findAll'});
      },
    }

    const allocationModalProps = {
      destroyOnClose: true,
      visible: allocationModalVisible,
      onCancel: this.dismissAllocation,
      onOk: () => {
        if(checkboxHaveUser){
            message.warn('已分配用户无需再分配');
        }else{
          if (allocationSelectedRowKeys.length === 0) {
            message.warn('请先选择用户');
          } else {
            dispatch({type: 'adminRole/saveAllocation'});
            this.dismissAllocation();
          }
        }
      },
      // bodyStyle: {maxHeight: '60vh'},
    }

    const allocationProps = {
      allocationRole,
      checkboxHaveUser,
      units,
      allocationSearchUserValue,
      tableSize,
      allocationSearchType,
      userRecordCount,
      userPageSize,
      userPageNum,
      dataSource: allocationUsers,
      onPageChange: (number) => {
        dispatch({type: 'adminRole/updatePageInfo', payload: {userPageNum: number}});
        // if (allocationSearchType === '-1') {
        dispatch({type: 'adminRole/findNeverUsers'});
        // } else {
        //   dispatch({type: 'adminRole/findUserAll', payload: {type: allocationSearchType}});
        // }
      },
      updateAllocationSelectedRowKeysByFilter: (value) => {
        dispatch({type: 'adminRole/updateAllocationSearchType', payload: value});
        dispatch({type: 'adminRole/updatePageInfo', payload: {userPageNum: 1}})
        dispatch({type: 'adminRole/findNeverUsers'});
        if (allocationRole.id) dispatch({type: 'adminRole/findUserByRole', payload: allocationRole});
      },
      updateSearchUser: (value) => {
        dispatch({type: 'adminRole/updateAllocationSearchUserValue', payload: value});
      },
      searchUser: () => {
        dispatch({type: 'adminRole/findNeverUsers'});
      },
      cleanSearchUser: () => {
        dispatch({type: 'adminRole/updateAllocationSearchUserValue', payload: ''});
      },
      cleanCheckHaveUer: () => {
        dispatch({type: 'adminRole/updateCheckboxHaveUser',payload:false});
      },
      updateCheckHaveUer: (value) => {
        dispatch({type: 'adminRole/updateCheckboxHaveUser',payload:value});
        dispatch({type: 'adminRole/updatePageInfo', payload: {userPageNum: 1}})
        dispatch({type: 'adminRole/findNeverUsers'});
        if (allocationRole.id) dispatch({type: 'adminRole/findUserByRole', payload: allocationRole});
      },
      updateColumnUnit: (unit) => {
        dispatch({type: 'adminRole/updateColumnUnit', payload: unit});
      },
      rowSelection: {
        selectedRowKeys: allocationSelectedRowKeys,
        onChange: (value) => {
          dispatch({type: 'adminRole/updateAllocationSelectedRowKeys', payload: value});
        },
      },
    }
    const editModalProps = {
      destroyOnClose: true,
      visible: editModalVisible,
      onCancel: this.dismissEdit,
      okText: '保存',
      onOk: () => {
        dispatch({type: 'adminRole/removeRolesForUser'});
      },
    }

    const editProps = {
      modalRole,
      modalUsers,
      data: editRecord,
      dispatch,
      defaultAvatar,
      defaultDarkAvatar,
      theme,
      handleAllocation: this.handleAllocation,
      removeUser: this.handleRemoveUser,
    }

    return (
      <div className={styles.adminRole}>
        <RoleSearch {...searchProps} />
        <RoleList {...listProps} />
        <RoleModal {...modalProps} />
        <AllocationUserModal modalProps={allocationModalProps} {...allocationProps}/>
        <EditModal editModalProps={editModalProps} {...editProps}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.user,
  user: state.adminUser,
  role: state.adminRole,
  domain: state.adminDomain,
  defaultAvatar: state.global.defaultAvatar,
  defaultDarkAvatar: state.global.defaultDarkAvatar,
  theme: state.global.theme,
  units: state.global.units,
});
export default connect(mapStateToProps)(RolePage);
