/**
 * Created by huangzhangshu on 2020/1/15
 * 导入用户数据
 */
import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Upload, Button, Icon, Radio, Table, message as Message} from '@vadp/ui';
import styles from '../style/ImportModal.less';

const {Dragger} = Upload;
const {Group} = Radio;
const TYPES = {
  0: '批量导入用户',
  1: '批量导入用户角色',
}

// 导入用户
class ImportModal extends Component {

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'adminUser/update',
      payload: {importFileList: [], importErrorList: [], importType: '1', importUserType: '0'}
    });
  }

  beforeUpload = () => {
    return false;
  }

  onDragChange = (info) => {
    const {dispatch} = this.props;
    const {fileList} = info;
    if (fileList.length === 0) return;
    const importFileList = fileList.splice(fileList.length - 1, fileList.length);
    dispatch({type: 'adminUser/update', payload: {importFileList}});
  }

  onUpload = () => {
    const {dispatch, importFileList, importType, importUserType} = this.props;
    if (!importFileList || importFileList.length === 0) {
      Message.warn('请先选择上传文件');
      return;
    }
    const file = importFileList[0].originFileObj;
    file.status = 'uploading';
    const {uid} = file;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    dispatch({type: 'adminUser/update', payload: {importFileList}});
    if (importUserType === '0') {
      dispatch({type: 'adminUser/importUser', payload: {formData, uid}});
    } else if (importUserType === '1') {
      dispatch({type: 'adminUser/importRole', payload: {formData, uid}});
    }
  }

  getTableColumns = () => {
    return [
      {title: '行号', dataIndex: 'number', key: 'number', width: 100},
      {title: '报错信息', dataIndex: 'message', key: 'message'},
    ];
  }

  onChange = (e) => {
    const {dispatch} = this.props;
    const {value} = e.target;
    dispatch({type: 'adminUser/update', payload: {importType: value}});
  }

  onCancel = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {importModalVisible: false}});
    dispatch({
      type: 'adminUser/update',
      payload: {importFileList: [], importErrorList: [], importType: '1', importUserType: '0'}
    });
  }

  onRemove = (file) => {
    const {dispatch, importFileList} = this.props;
    for (let index in importFileList) {
      const importFile = importFileList[index];
      if (importFile.uid === file.uid) {
        importFileList.splice(index, 1);
        break;
      }
    }
    dispatch({type: 'adminUser/update', payload: {importFileList: [...importFileList]}});
  }

  render() {
    const {importModalVisible, contextPath, importType, importFileList, importErrorList, importUserType, importLoading, importRoleLoading} = this.props;
    const modalProps = {
      visible: importModalVisible,
      title: TYPES[importUserType],
      onCancel: this.onCancel,
      destroyOnClose: true,
      footer: [
        <Button
          loading={importLoading || importRoleLoading}
          style={{marginRight: 8}}
          type="primary"
          htmlType="submit"
          onClick={this.onUpload}>上传</Button>,
        <Button
          onClick={this.onCancel}>关闭</Button>],
      width: 620,
    }
    const dragProps = {
      fileList: importFileList,
      name: 'file',
      multiple: false,
      accept: '.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      beforeUpload: this.beforeUpload,
      onChange: this.onDragChange,
      onRemove: this.onRemove,
    }
    const tableProps = {
      bordered: true,
      pagination: false,
      columns: this.getTableColumns(),
      dataSource: importErrorList,
      scroll: {x: true, y: Math.max(window.innerHeight - 600, 200)},
    }
    const href = importUserType === '0' ? `${contextPath}/plugins/global/up_org_user.xlsx` : `${contextPath}/plugins/global/up_org_role.xlsx`;
    const hrefName = importUserType === '0' ? 'up_org_user.xlsx' : 'up_org_role.xlsx';
    // eslint-disable-next-line no-undef
    const methodStyle = (app.isIE() && importFileList.length > 0) ? {marginTop: 36} : {}; //app.isIE() 
    return (
      <Modal {...modalProps}>
        <div className={styles.importUser}>
          <div className={styles.base}>
            <span>模版下载:</span>
            <a className={styles.baseLink} href={href}>{hrefName}
              <Icon className={styles.baseLingIcon} type="-biImport"/></a>
          </div>
          <Dragger {...dragProps}>
            <div className={styles.drag}>
              <p className={styles.pText}>拖拽到该区域或<p className={styles.dragClickText}>点击这里</p>，完成上传</p>
              <span>支持Office 2007以上版本</span>
            </div>
          </Dragger>
          <div className={styles.method} style={methodStyle}>
            <span>导入方式:</span>
            <Group value={importType} onChange={this.onChange} className={styles.group}>
              <Radio value="1">增量导入</Radio>
              <Radio value="0">完全导入</Radio>
            </Group>
          </div>
          <Table {...tableProps} style={{marginBottom: 32}} locale={{emptyText: ''}}/>
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    importModalVisible: state.adminUser.importModalVisible,
    importType: state.adminUser.importType,
    importFileList: state.adminUser.importFileList,
    importErrorList: state.adminUser.importErrorList,
    importUserType: state.adminUser.importUserType,
    importLoading: state.adminUser.importLoading,
    importRoleLoading: state.adminUser.importRoleLoading,
    contextPath: state.global.contextPath,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(ImportModal);
