import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Form, Input, Select} from '@vadp/ui';

const {Item} = Form;
const {Option} = Select;
const validateTrigger = 'onBlur';
const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 18},
  },
};

// 新增菜单
class MenuModal extends Component {

  onCancel = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminMenu/updateState', payload: {menuModalVisible: false}});
  }

  handleSubmit = () => {
    const {form: {validateFields, getFieldsValue}, menuCurrentApp: {id: app}, currentItem: {id: parent}, childrenCount, dispatch, addRootMenu, menuTrees, addHiddenMenu = false} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const {title, url = '', icon, type = 2, description, page = ''} = getFieldsValue();
      const menus = [];
      const lastMenuId = menuTrees[menuTrees.length - 1].id || '';
      const lastMenuIdLength = lastMenuId.length;
      // eslint-disable-next-line radix
      let rootMenuId = (parseInt(lastMenuId.substring(0, 5)) + 1) + lastMenuId.substring(5, lastMenuIdLength);
      rootMenuId = rootMenuId.substring(0, rootMenuId.length - 3) + Math.floor((Math.random() * 900) + 100);
      menus.push({
        title,
        type: Number(type),
        url: '',
        parent: addRootMenu ? '-1' : parent,
        parentId: addRootMenu ? '-1' : parent,
        app,
        icon,
        description,
        isLeaf: addHiddenMenu,
        isEnabled: true,
        page: type === 2 || type === 4 ? page : '',
        order: addRootMenu ? String(menuTrees.length + 1) : String(childrenCount), // 确保新增菜单位于最后
        orderNum: addRootMenu ? String(menuTrees.length + 1) : String(childrenCount),
        id: addRootMenu ? rootMenuId : undefined,
        isHidden: addHiddenMenu,
      });
      dispatch({type: 'adminMenu/addMenu', payload: {menus}});
    });
  }

  renderLeaf = () => {
    return [
      <Option value={false}>否</Option>,
      <Option value={true}>是</Option>,
    ];
  }

  renderType = () => {
    const types = [];
    for (let i = 1; i <= 5; i++) {
      types.push(<Option value={`${i}`}>{i}</Option>);
    }
    return types;
  }

  render() {
    const {currentItem: {title}, menuCurrentApp: {name: appName}, menuModalVisible, form: {getFieldDecorator}, addRootMenu, addHiddenMenu = false} = this.props;
    const props = {
      visible: menuModalVisible,
      onCancel: this.onCancel,
      onOk: this.handleSubmit,
      destroyOnClose: true,
      title: addHiddenMenu ? '新增隐藏菜单' : '新增菜单',
    };
    const leaf = this.renderLeaf();
    const type = this.renderType();
    return (
      <Modal {...props} submit={this.handleSubmit}>
        <Form layout="horizontal">
          <Item label="应用"  {...formItemLayout}>
            {getFieldDecorator('app', {
              initialValue: appName,
            })(<Input disabled/>)}
          </Item>

          <Item label="父菜单"  {...formItemLayout}>
            {getFieldDecorator('parent', {
              initialValue: addRootMenu ? appName : title,
            })(<Input disabled/>)}
          </Item>

          <Item label="标题"  {...formItemLayout}>
            {getFieldDecorator('title', {
              validateTrigger,
              initialValue: '',
              rules: [
                {required: true, message: "菜单标题不能为空"},
              ],
            })(<Input
              autoComplete="new-account"
              maxlength={12}/>)}
          </Item>

          {addHiddenMenu && <Item label="page" {...formItemLayout}>
            {getFieldDecorator('page', {
              validateTrigger,
              initialValue: '',
              rules: [
                {required: true, message: "page不能为空"},
              ],
            })(<Input maxLength={128}/>)}
          </Item>}

          {false && <Item label="URL" {...formItemLayout}>
            {getFieldDecorator('url', {
              validateTrigger,
              initialValue: '',
            })(<Input maxLength={128}/>)}
          </Item>}

          {!addHiddenMenu && <Item label="图标" {...formItemLayout}>
            {getFieldDecorator('icon', {
              validateTrigger,
              initialValue: '',
            })(<Input maxLength={64}/>)}
          </Item>}

          {!addHiddenMenu && <Item label="描述"  {...formItemLayout}>
            {getFieldDecorator('description', {
              initialValue: '',
            })(<Input maxlength={120}/>)}
          </Item>}

          {false && <Item label="类别" {...formItemLayout}>
            {getFieldDecorator('type', {
              validateTrigger,
              initialValue: '2',
            })(<Select placeholder="请选择菜单类别">{type}</Select>)}
          </Item>}

          {false && <Item label="是否叶子节点" {...formItemLayout}>
            {getFieldDecorator('isLeaf', {
              validateTrigger,
              initialValue: false,
            })(<Select disabled>{leaf}</Select>)}
          </Item>}

        </Form>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    menuModalVisible: state.adminMenu.menuModalVisible,
    currentItem: state.adminMenu.currentItem,
    menuCurrentApp: state.adminMenu.menuCurrentApp,
    childrenCount: state.adminMenu.childrenCount,
    addRootMenu: state.adminMenu.addRootMenu,
    addHiddenMenu: state.adminMenu.addHiddenMenu,
    menuTrees: state.adminMenu.menuTrees,
  };
}

export default connect(mapStateToProps)(Form.create()(MenuModal));
