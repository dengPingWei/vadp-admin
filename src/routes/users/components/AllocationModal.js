/**
 * Created by huangzhangshu on 2018/3/6
 */
import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Modal, Button, message} from '@vadp/ui';
import {Field} from '../common/UserContacts';

import Allocation from './Allocation';

class AllocationModal extends PureComponent {

  cleanUnits = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/resetUnits'});
  }

  handleOk = () => {
    const {dispatch, allocationType, allocationSelectedRowKeys, initialAllocationSelectedRowKeys} = this.props;
    if (allocationType === 'single' && allocationSelectedRowKeys.sort().toString() === initialAllocationSelectedRowKeys.sort().toString()) {
      message.warn('数据项未发生变化');
    } else {
      dispatch({type: 'adminUser/hideAllocationModal'});
      dispatch({type: 'adminUser/updateRoles'});
    }
  }

  handleCancel = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/hideAllocationModal'});
  }

  handleUpdateColumnUnit = (unit) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/updateColumnUnit', payload: unit});
  }

  handleUpdateType = (e) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {allocationUpdateType: e.target.value}});
  }

  handleSelectDomain = (compCode) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/findEmpList', payload: {compCode}});
  }

  handleReset() {
  }

  render() {
    const {
      dispatch, item, roles, allocationVisible, allocationType, domains, allocationAllRoles,
      allocationSelectedUsers, createAvatar, tableSize, allocationSelectedRowKeys,
    } = this.props;
    const modalOpts = {
      title: `${allocationType === 'batch'
        ? Field.BATCH_ALLOCATION_ROLE
        : Field.ALLOCATION_ROLE}`,
      visible: allocationVisible,
      onCancel: this.handleCancel,
    };
    const destroyOnClose = true;
    const rowSelection = {
      onChange: (selectedRowKeys, selectAllocationRows) => {
        dispatch({ type: 'adminUser/updateAllocationRows', payload: selectAllocationRows });
        dispatch({ type: 'adminUser/updateAllocationKeys', payload: selectedRowKeys });
      },
      selectedRowKeys: allocationSelectedRowKeys,
    };
    const allocationProps = {
      tableSize,
      item,
      roles,
      onCancel: this.handleCancel,
      onOk: this.handleOk,
      visible: allocationVisible,
      domains,
      type: allocationType,
      handleSelectDomain: this.handleSelectDomain,
      allocationRoles: allocationAllRoles,
      rowSelection,
      allocationSelectedUsers,
      destroyOnClose,
      createAvatar,
      updateColumnUnit: this.handleUpdateColumnUnit,
      cleanUnits: this.cleanUnits,
      handleUpdateType: this.handleUpdateType,
    };
    return (
      <Modal
        {...modalOpts}
        width={950}
        destroyOnClose
        className="vadp-modal"
        footer={[
          <Button
            style={{marginRight: 8}}
            key={Field.CLOSE}
            onClick={this.handleCancel}>{Field.CLOSE}</Button>,
          <Button
            type="primary"
            htmlType="submit"
            key={Field.SAVE}
            onClick={this.handleOk}>{Field.SAVE}</Button>]}>
        <Allocation {...allocationProps}/>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    tableSize: state.adminUser.tableSize,
    allocationType: state.adminUser.allocationType,
    allocationVisible: state.adminUser.allocationVisible,
    allocationAllRoles: state.adminUser.allocationAllRoles,
    allocationSelectedUsers: state.adminUser.allocationSelectedUsers,
    createAvatar: state.adminUser.createAvatar,
    allocationSelectedRowKeys: state.adminUser.allocationSelectedRowKeys,
    initialAllocationSelectedRowKeys: state.adminUser.initialAllocationSelectedRowKeys,
  };
}

export default connect(mapStateToProps)(AllocationModal);
