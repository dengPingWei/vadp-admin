/**
 * Created by huangzhangshu on 2018/4/8
 */
import React, {PureComponent} from 'react';
import {Modal, Row, Col, Avatar, Tooltip, Icon, Title, Form, Scroll} from '@vadp/ui';
import styles from '../style/EditModal.less';
import {wrapAvatar} from '../../../utils';
import {roleColumns, fullFormItemLayout} from '../../../common/AdminContacts';
import {switchItem, warpFormForUnit} from '../../../utils/FormUtil';

const FormItem = Form.Item;

const halfFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 1},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
};

function timetrans(date) {
  var date = new Date(date);
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m;
}

class EditModal extends PureComponent {

  switchHandler = (field, value) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminRole/updateModalRole', payload: {[field]: value}});
  }

  renderCell = (rows) => {
    const {defaultAvatar, defaultDarkAvatar, theme, removeUser, modalRole} = this.props;
    const darkThemes = ['dark', 'default'];
    const isDark = (darkThemes.indexOf(theme) > -1);
    const avatar = isDark ? defaultDarkAvatar : defaultAvatar;
    return rows.map((row, index) => {
      const avatarClassName = row.avatar ? styles.avatarImg : styles.defaultAvatarImg;
      return (
        <Col span={3} key={`${row.id}${index}`} className={styles.avatarDiv}>
          <div className={styles.user}>
            <Avatar src={wrapAvatar(row.avatar || avatar)} alt="" className={avatarClassName}/>
            {row.name.length >= 5 ? <Tooltip title={row.name}>
              <span
                style={{marginTop: 5}}
                className={styles.userSpan}>{row.name}</span></Tooltip> :
              <span style={{marginTop: 5}} className={styles.userSpan}>{row.name}</span>}
            {/*<div className={styles.borders}/>*/}
            <a onClick={() => removeUser({account: row.account, role: modalRole})}>
              <Icon type="close-circle" className={styles.deleteIcon}/>
            </a>
          </div>
        </Col>
      );
    });
  }

  // 绘制头像列表
  renderList(avatars) {
    const childrens = [];
    const wrapAvatars = [];
    let rowAvatar = [];
    for (let i = 0; i < avatars.length; i++) {
      if ((i % 8 === 0 && i !== 0)) {
        wrapAvatars.push(rowAvatar);
        rowAvatar = [];
      }
      rowAvatar.push(avatars[i]);
      if (i === avatars.length - 1) {
        wrapAvatars.push(rowAvatar);
        rowAvatar = [];
      }
    }
    wrapAvatars.map((rows, index) => {
      childrens.push(<Row gutter={24} key={`roles_edit_modal_${index}`}>{this.renderCell(rows, index)}</Row>);
    });
    return childrens;
  }

  render() {
    const {editModalProps, modalRole, modalUsers, form} = this.props;
    const {getFieldDecorator} = form;
    const childrens = this.renderList([...modalUsers]);
    return (
      <Modal title="编辑角色" width={777} className="vadp-modal" {...editModalProps}>
        <div className={styles.roleEditModal}>
          <Form style={{marginTop: 12}}>
            {warpFormForUnit(roleColumns).map((columns, index) => {
              return <Row key={`role_row_${index}`}>
                {columns.map((formItem) => {
                  const item = {...formItem};
                  if (item.field === 'name' || item.field === 'description') {
                    item.disabled = false;
                  } else {
                    item.disabled = true;
                  }
                  if (modalRole.roleType === 1) {
                    item.disabled = true;
                  }
                  var initialValue = modalRole[item.field];
                  if (item.field === 'creationDate' || item.field === 'lastUpdateDate') {
                    initialValue = timetrans(modalRole[item.field]);
                  }
                  const formItemLayout = item.span === 24 ? fullFormItemLayout : halfFormItemLayout;
                  return (
                    <Col span={item.span || 12} key={`unit_col_${item.field}`}>
                      <FormItem {...formItemLayout} label={item.text} className={item.className}>
                        {getFieldDecorator(item.field, {
                          initialValue,
                          rules: [{
                            required: item.required,
                            message: item.errorMessage,
                          }],
                        })(switchItem(item, this.switchHandler))}
                      </FormItem>
                    </Col>
                  );
                })}
              </Row>;
            })}
          </Form>
          <Scroll className={styles.avatar}>
            {childrens}
          </Scroll>
        </div>
      </Modal>
    );
  }
}

export default Form.create()(EditModal);
