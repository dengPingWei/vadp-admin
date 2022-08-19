import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Button} from '@vadp/ui';
import {Field} from '../common/BusiApiContacts';
import event from '../../../utils/event';

import EditForm from './BusiEditForm';

class BusiApiModal extends Component {

  componentDidMount() {
    this.state = {};
  }


  handleCancel = () => {
    const {dispatch, currentUser, modalType} = this.props;
    const params = {
      domain: currentUser.domainId, // 从当前登录用户中获取
      page: 1,
    };
    dispatch({type: 'adminBusi/findAllRole', payload: params});
    dispatch({type: 'adminBusi/hideModal', payload: modalType});
  }

  handleOk = (data) => {
    const {dispatch, currentUser, modalType} = this.props;
    dispatch({type: 'adminBusi/saveOrUpdate', payload: {data:data,modalType:modalType}});
    dispatch({type: 'adminBusi/hideModal', payload: modalType});
  }

  render() {
    const {
      modalType, modalVisible, currentItem,roleContent,roleSelectedContent,
      currentUser,
    } = this.props;

    const modalOpts = {
      title: `${modalType === 'create'
            ? Field.BUSI_ADD_TITLE
            : Field.BUSI_UPDATE_TITLE}`,
      visible: modalVisible,
      onCancel: this.handleCancel,
      footer: null,
    };

    // const item = modalType === 'create'
    //   ? {domainId: currentDomain}
    //   : currentItem;
    const item =currentItem;
    const destroyOnClose = true;
    const formProps = {
      item,
      roleSelectedContent,
      roles: roleContent,
      visible: modalVisible,
      onCancel: this.handleCancel,
      onOk: this.handleOk,
      type: modalType,
      destroyOnClose,
      currentUser,
    }
    return (
      <Modal
        {...modalOpts}
        className="modal-form">
       <EditForm {...formProps}/>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    modalType: state.adminBusi.modalType,
    modalVisible: state.adminBusi.modalVisible,
    currentItem: state.adminBusi.currentItem,
    roleContent: state.adminBusi.roleContent,
    roleSelectedContent: state.adminBusi.roleSelectedContent,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(BusiApiModal);
