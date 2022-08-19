import React from 'react';
import {Form, Input, Button, Select, message} from '@vadp/ui';
import {miniFormItemLayout} from '../../../common/AdminContacts';
import styles from '../style/EditForm.less';
import {filterRule, filterChinese} from '../../../utils';

const FormItem = Form.Item;
const {Option} = Select;

class EditForm extends React.PureComponent {

  componentDidMount() {
    this.props.form.resetFields();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === false) {
      this.props.form.resetFields();
    }
  }

  componentWillUnmount() {
    this.props.form.resetFields();
  }


  handleSubmit = (e) => {
    e.preventDefault();
    const {form: {validateFields, getFieldsValue, resetFields}, onOk} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
      };
      if (filterRule(data.roleCode)) {
        message.error('角色编码不能包含特殊字符!');
        return;
      }
      if (filterChinese(data.roleCode)) {
        message.error('角色编码不能包含中文字符');
        return;
      }
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

  renderTypes() {
    const {currentUser: {account}} = this.props;
    const types = [];
    types.push(<Option key="normal_role" value="1">普通角色</Option>)
    if (account === 'admin')
      types.push(<Option key="manager_role" value="2">管理员角色</Option>)
    return types;
  }

  render() {
    const {item} = this.props;
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = miniFormItemLayout;
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit} className={styles.roleEditForm}>

        <FormItem label='角色编码'  {...formItemLayout}>
          {getFieldDecorator('roleCode', {
            initialValue: item.roleCode,
            rules: [
              {
                required: true,
                message: '请输入角色编码',
              },
            ],
          })(<Input maxlength={20}/>)}
        </FormItem>


        <FormItem label='角色名称'  {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: '请输入角色名称',
              },
            ],
          })(<Input disabled={item.systemed} maxlength={16}/>)}
        </FormItem>

        <FormItem label='角色类别'  {...formItemLayout}>
          {getFieldDecorator('roleAdminType', {
            initialValue: item.roleAdminType || '1',
            rules: [
              {
                required: true,
                message: '请输入角色名称',
              },
            ],
          })(<Select
            // disabled={disabled}
            notFoundContent="暂无角色类型"
            placeholder="请选择角色类型">
            {this.renderTypes()}</Select>)}
        </FormItem>

        <FormItem label='角色描述'  {...formItemLayout}>
          {getFieldDecorator('description', {
            initialValue: item.description,
            rules: [
              {
                required: false,
                message: '请输入角色描述',
              },
            ],
          })(<Input maxlength={120}/>)}
        </FormItem>

        <FormItem
          wrapperCol={{span: 14, offset: 6}}
        >
          <div className="modal-editform">
            <Button style={{marginRight: 8}} onClick={this.handleReset}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </div>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(EditForm);
