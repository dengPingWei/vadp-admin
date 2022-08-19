import React, {Component} from 'react';
import {Form, Title, Input, Row, Col, Button, Table, Select, message, Popconfirm} from '@vadp/ui';
import {connect} from 'dva';
import {getTreeNodeById} from '../../../utils/index';
import styles from '../style/EditForm.less';

const FormItem = Form.Item;
const {Option} = Select;

class EditForm extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedRowKeys: [], scrollBody: null};
    this.resetFields = this.resetFields.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const {currentItem} = this.props;
    const {currentItem: nextCurrentItem, form: {resetFields}} = nextProps;
    if (currentItem.id !== nextCurrentItem.id) {
      resetFields();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {buttonValues = []} = this.props;
    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
      const scrollBody = menuForm.getElementsByClassName('ant-table-body')[0];
      if (!scrollBody) return;
      if (((window.innerHeight - 320 > 300 && scrollBody.clientHeight > 300) || (window.innerHeight - 320 - scrollBody.clientHeight < 200)) && buttonValues.length !== 0) {
        scrollBody.style.position = 'relative';
        this.state.scrollBody = scrollBody;
      } else {
        this.state.scrollBody = null;
      }
    }
  }

  getTableColumns = () => {
    const {buttons = []} = this.props;
    const {scrollBody} = this.state;
    return [
      {
        title: '菜单标题',
        dataIndex: 'title',
        key: 'title',
        width: '50%',
        render: (title, _, index) => {
          return (
            <Input
              className="menuButtonInput"
              value={title}
              maxLength={32}
              onChange={(e) => this.handleButtonChange('title', e.target.value, index)}/>
          );
        },
      },
      {
        title: '功能ID',
        dataIndex: 'buttonId',
        key: 'buttonId',
        width: '50%',
        render: (buttonId, _, index) => {
          const source = [{}, ...buttons];
          return (
            <Select
              dropdownClassName="admin-menu-select"
              getPopupContainer={() => scrollBody || document.body}
              value={buttonId}
              style={{width: '100%'}}
              onChange={(value) => this.handleButtonChange('buttonId', value, index)}>
              {source.map((button) => {
                const {buttonId: id, buttonTitle} = button;
                if (!id) return <Option key="" value="" style={{height: 30}}/>;
                return <Option key={id} value={id}>{buttonTitle}</Option>;
              })}
            </Select>
          );
        },
      },
    ];
  }

  handleAddButton = () => {
    const {buttonValues = [], dispatch} = this.props;
    const item = {
      title: '',
      buttonId: '',
      index: buttonValues.length,
    };
    buttonValues.push(item);
    dispatch({type: 'adminMenu/updateState', payload: {buttonValues}});
  }

  handleDeleteButton = () => {
    const {buttonValues, dispatch} = this.props;
    const {selectedRowKeys} = this.state;
    const [index] = selectedRowKeys;
    const button = buttonValues[index];
    if (button.id) {
      dispatch({type: 'adminMenu/deleteButtons', payload: {button, index}});
    } else {
      buttonValues.splice(index, 1);
      dispatch({type: 'adminMenu/updateState', payload: {buttonValues}});
      message.success('删除成功');
    }
    this.setState({selectedRowKeys: []});
  }

  handleButtonChange = (field, value, index) => {
    const {buttonValues, dispatch} = this.props;
    buttonValues[index][field] = value;
    dispatch({type: 'adminMenu/updateState', payload: {buttonValues}});
  }

  handleSaveButton = () => {
    const inputs = document.getElementsByClassName('menuButtonInput');
    for (const input of inputs) {
      // 保存按钮信息时，输入框失去焦点
      input.blur();
    }
    const {dispatch} = this.props;
    dispatch({type: 'adminMenu/saveButtons'});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {form: {validateFields, getFieldsValue, resetFields}, item, onOk} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: item.id,
        parentId: item.parentId,
      };
      onOk(data);
      resetFields();
    });
  };

  handleReset = () => {
    const {form, onCancel} = this.props;
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  openMenuModal = (addRootMenu = false, addHiddenMenu = false) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminMenu/updateState', payload: {menuModalVisible: true, addRootMenu, addHiddenMenu}});
  }

  updateMenu = () => {
    const {form: {validateFields, getFieldsValue}, currentItem, menuTrees, dispatch} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const {title, icon, order, description} = getFieldsValue();
      const {parentId} = currentItem;
      let orderMenus = [];
      const menus = [];
      if (parentId === '-1' || !parentId) {
        orderMenus = menuTrees;
      } else {
        const node = getTreeNodeById(menuTrees, currentItem.parentId);
        if (node && node.children) orderMenus = node.children;
      }
      for (const menu of orderMenus) {
        if (menu.id === currentItem.id) menu.orderNum = order;
      }
      orderMenus.sort((sourceObj = {}, targetObj = {}) => {
        const sortResult = Number(sourceObj.orderNum || 0) - Number(targetObj.orderNum || 0);
        if (sortResult === 0 && targetObj.id === currentItem.id) {
          return -1;
        }
        if (sortResult === 0 && sourceObj.id === currentItem.id) {
          return -1;
        }
        return sortResult;
      })
      let menuOrder = 0;
      for (const {appId, parentId, title: originTitle, icon: originIcon, description: originDescription, id, isLeaf, name, type, url = '', enabled} of orderMenus) {
        let menuTitle = title;
        let menuIcon = icon;
        let menuDescription = description;
        if (id !== currentItem.id) {
          menuTitle = originTitle;
          menuIcon = originIcon;
          menuDescription = originDescription;
        }
        menus.push({
          appId,
          parentId,
          description: originDescription,
          icon: menuIcon,
          id,
          isLeaf,
          name,
          title: menuTitle,
          type,
          url: (type === 3 || type === 1) && url ? url.substring(url.indexOf('/#/')) : url,
          app: appId,
          parent: parentId,
          orderNum: String(menuOrder),
          order: String(menuOrder),
          isEnabled: enabled,
          page: url ? type === 2 || type === 4 ? (url || '').split('page=')[1] || '' : '' : '',
        })
        menuOrder++;
      }
      dispatch({type: 'adminMenu/updateMenu', payload: {menus}});
    });
  }

  onStatusChange = (checkedValues) => {
    const {form} = this.props;
    form.setFieldsValue({isDefault: checkedValues.target.checked});
  }

  wrapData = (buttonValues = []) => {
    for (let i = 0; i < buttonValues.length; i += 1) {
      const button = buttonValues[i];
      button.index = i;
    }
    return buttonValues;
  }

  resetFields() {
    const {form} = this.props;
    form.resetFields();
  }


  render() {
    const {selectedRowKeys} = this.state;
    const {item = {}, buttons = [], buttonValues, size: {height}} = this.props;
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 20},
      },
    };
    const columns = this.getTableColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys) => {
        this.setState({selectedRowKeys: keys});
      },
      type: 'radio',
    }
    const deleteDisabled = !(selectedRowKeys.length);
    const buttonStyle = {height: 30};
    return (
      <div className={styles.menuForm} id="menuForm">
        <div>
          <div className={styles.rightButtons}>
            <Title text="菜单详情"/>
            <div>
              <Button type="primary" style={buttonStyle} onClick={this.openMenuModal.bind(this, true, false)}>添加根菜单</Button>
              {(!item.isLeaf && item.id) &&
              <Button type="primary" style={{...buttonStyle, marginLeft: 12}} onClick={this.openMenuModal.bind(this, false, false)}>添加子菜单</Button>}
              {(item.isLeaf && item.id && (item.type === 2 || item.type === 4)) &&
              <Button type="primary" style={{...buttonStyle, marginLeft: 12}} onClick={this.openMenuModal.bind(this, false, true)}>添加隐藏菜单</Button>}
              {item.id && <Button type="primary" style={{...buttonStyle, marginLeft: 12}} onClick={this.updateMenu}>保存</Button>}
            </div>
          </div>
          <Form
            layout="horizontal"
            onSubmit={this.handleSubmit}
            style={{paddingTop: '16px'}}
            className="admin-form">
            <Row>
              <Col span={12}>
                <FormItem label="标题："  {...formItemLayout}>
                  {getFieldDecorator('title', {
                    initialValue: item.title,
                    rules: [
                      {
                        required: true,
                        message: '请输入菜单标题',
                      }, {
                        max: 16,
                        message: '最多输入16个字符',
                      },
                    ],
                  })(<Input autocomplete="off" key={item.id} disabled={!item.id}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="描述：" {...formItemLayout}>
                  {getFieldDecorator('description', {
                    initialValue: item.description,
                  })(<Input autocomplete="off" disabled={!item.id}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="序号：" {...formItemLayout}>
                  {getFieldDecorator('order', {
                    initialValue: item.orderNum,
                    rules: [
                      {
                        required: true,
                        message: '请输入菜单序号',
                      }, {
                        pattern: /^[0-9]+$/,
                        message: '只能输入数字',
                      },
                    ],
                  })(<Input autocomplete="off" maxLength={16} disabled={!item.id}/>)}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem label="图标：" {...formItemLayout}>
                  {getFieldDecorator('icon', {
                    initialValue: item.icon,
                  })(<Input autocomplete="off" disabled={!item.id}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="ID：" {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: item.id,
                  })(<Input autocomplete="off" disabled/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="URL：" {...formItemLayout}>
                  {getFieldDecorator('url', {
                    initialValue: item.url,
                  })(<Input autocomplete="off" disabled/>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>

        {buttons.length !== 0 && <div className={styles.functionContainer}>
          <div className={styles.topButtons}>
            <Title text="菜单按钮列表"/>
            <div className={styles.buttons}>
              <Popconfirm
                title="确定删除?"
                okText="确定"
                canceltext="取消"
                onConfirm={() => this.handleDeleteButton()}>
                <Button
                  disabled={deleteDisabled}
                  type="primary"
                  className={styles.button}>删除</Button>
              </Popconfirm>
              <Button type="primary" className={styles.button} onClick={this.handleAddButton}>
                新增
              </Button>
              <Button type="primary" className={styles.button} onClick={this.handleSaveButton}>
                保存
              </Button>
            </div>
          </div>
          <Table
            locale={{emptyText: ''}}
            pagination={false}
            bordered
            size="default"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={this.wrapData(buttonValues)}
            scroll={{x: true, y: height - 270}}
            rowKey={record => record.index}>
          </Table>
        </div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    buttons: state.adminMenu.buttons,
    buttonValues: state.adminMenu.buttonValues,
    currentItem: state.adminMenu.currentItem,
    menuTrees: state.adminMenu.menuTrees,
    size: state.global.size,
  };
}

export default connect(mapStateToProps)(Form.create()(EditForm));
