import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Button} from '@vadp/ui';
import {Field} from '../common/UserContacts';
import event from '../../../utils/event';

import EditForm from './EditForm';

class UserModal extends Component {

  componentDidMount() {
    this.state = {};
  }

  handleUpload = (formData) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/updateUploadLoading', payload: true});
    dispatch({type: 'adminUser/uploadAvatar', payload: formData});
  }

  handleCancel = () => {
    const {dispatch, currentUser, modalType} = this.props;
    const params = {
      domain: currentUser.domainId, // 从当前登录用户中获取
      page: 1,
    };
    dispatch({type: 'adminUser/findAllRole', payload: params});
    dispatch({type: 'adminUser/hideModal', payload: modalType});
  }

  handleOk = (values) => {
    const {dispatch, modalType} = this.props;
    dispatch({type: 'adminUser/saveOrUpdate', payload: {modalType, item: values}});
  }

  handleSelectDomain = (compCode) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {empUsers: [], empRecordCount: 0, empPageNum: 1, empSearchKey: ''}});
    dispatch({type: 'adminUser/findEmpList', payload: {compCode}});
  }

  handleSave() {
    event.emit('SAVE_USER_MODAL_FORM');
  }

  handleReset() {
    event.emit('RESET_USER_MODAL_FORM');
  }

  render() {
    const {
      roleContent, modalVisible, modalType, domains, currentUser, uploadLoading, createAvatar, product,
      modalUnits, defaultAvatar, empUsers, currentUnit, modalEmpUser, currentDomain, empSearchKey,
      currentItem, passwordDefault, upCodeList, empRecordCount, empPageNum, empFetching, empSelectedValue,
    } = this.props;
    const modalOpts = {
      title: `${modalType === 'create'
        ? Field.CREATE_USER_TITLE
        : Field.UPDATE_USER_TITLE}`,
      visible: modalVisible,
      onCancel: this.handleCancel,
      destroyOnClose: true,
    };
    const item = modalType === 'create'
      ? {domainId: currentDomain}
      : currentItem;
    const destroyOnClose = true;
    const formProps = {
      product,
      empSelectedValue,
      empSearchKey,
      empFetching,
      empPageNum,
      empRecordCount,
      item,
      roles: roleContent,
      onCancel: this.handleCancel,
      onOk: this.handleOk,
      visible: modalVisible,
      domains,
      type: modalType,
      handleSelectDomain: this.handleSelectDomain,
      handleUpload: this.handleUpload,
      uploadLoading,
      destroyOnClose,
      createAvatar,
      modalUnits,
      empUsers,
      modalEmpUser,
      defaultAvatar,
      currentUnit,
      currentUser,
      passwordDefault,
      upCodeList,
    }
    return (
      <Modal
        {...modalOpts}
        wrapClassName="bi"
        className="modal-form"
        footer={[
          <Button
            style={{marginRight: 8}}
            key={Field.CLOSE}
            onClick={this.handleReset}>{Field.CLOSE}</Button>,
          <Button
            type="primary"
            htmlType="submit"
            key={Field.SAVE}
            onClick={this.handleSave}>{Field.SAVE}</Button>]}>
        <EditForm {...formProps}/>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    modalType: state.adminUser.modalType,
    modalVisible: state.adminUser.modalVisible,
    empUsers: state.adminUser.empUsers,
    modalEmpUser: state.adminUser.modalEmpUser,
    uploadLoading: state.adminUser.uploadLoading,
    createAvatar: state.adminUser.createAvatar,
    currentDomain: state.adminUser.currentDomain,
    currentItem: state.adminUser.currentItem,
    modalUnits: state.adminUser.modalUnits,
    roleContent: state.adminUser.roleContent,
    domains: state.adminDomain.content,
    currentUnit: state.global.currentUnit,
    defaultAvatar: state.global.defaultAvatar,
    currentUser: state.user.currentUser,
    passwordDefault: state.adminUser.passwordDefault,
    upCodeList: state.adminUser.upCodeList,
    empRecordCount: state.adminUser.empRecordCount,
    empPageNum: state.adminUser.empPageNum,
    empFetching: state.adminUser.empFetching,
    empSearchKey: state.adminUser.empSearchKey,
    empSelectedValue: state.adminUser.empSelectedValue,
    product: state.global.product,
  };
}

export default connect(mapStateToProps)(UserModal);
