import React, {Component} from 'react';
import {Modal} from '@vadp/ui';
import EditForm from './EditForm';
import AssignMenus from './AssignMenus';

class ModalForm extends Component {

  render() {
    const {item, visible, type, onCancel, onOk, onCheck, domains, currentUser} = this.props;
    const titles = {
      'create': '添加角色',
      'update': '修改角色',
      'assignMenu': '分配角色权限',

    }
    const modalOpts = {
      title: titles[type],
      visible: visible,
      onCancel: onCancel,
      cancelText: '取消',
      footer: null,
    };
    let checkedKeys = {};
    if (item.menuIds) {
      checkedKeys = {checked: [], halfChecked: []};
      for (let i = 0; i < item.menuIds.length; i++) {
        if (item.menuIds[i].type === 'halfChecked') {
          checkedKeys.halfChecked.push(item.menuIds[i].id);
        } else {
          checkedKeys.checked.push(item.menuIds[i].id);
        }
      }
    }
    const formProps = {
      item,
      onCancel,
      onOk,
      visible,
      checkedKeys,
      type,
      domains,
      currentUser,
    }
    return (
      <Modal {...modalOpts} className="modal-form">
        {'create,update'.indexOf(type) > -1 ?
          <EditForm {...formProps}/>
          : <AssignMenus item={item} checkedKeys={checkedKeys} onCheck={onCheck}/>
        }
      </Modal>
    );
  }
}

export default ModalForm;
