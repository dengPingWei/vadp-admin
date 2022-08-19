import React, {PureComponent} from 'react';
import {Tooltip, Form, Input, Select, Upload, Icon, message, Button,Radio} from '@vadp/ui';
import {connect} from 'dva';
import {Field, TYPE_DATA} from '../common/BusiApiContacts';
import styles from '../style/EditForm.less';
import {filterChinese, filterRule, wrapAvatar, wrapUrlByContextPath} from '../../../utils';

const FormItem = Form.Item;
const {Option} = Select;
const {Group} = Radio;

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 19},
  },
};


class BusiEditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      domainValue: {},
      loading: false,
      confirmDirty: false,
      autoCompleteResult: [],
      inputType: 'text',
      pageType: this.props.type === 'create' ? 'busi_url' :  this.props.item.pageType,
    };
  }

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



  handleChange = (e) => {
    this.setState({
      pageType: e.target.value,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {form: {validateFields, getFieldsValue, resetFields}, onOk,item} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }

      const fieldsValue=getFieldsValue();
      const pageType=fieldsValue.pageType;
      let url=fieldsValue.url;
      if(pageType=='busi_bo'){
         url= fieldsValue.boName + "." +fieldsValue.method;
      }

      //role_id做为up_ment的app_id传到后端,因为up_mentm没有role_id
      const roleId=fieldsValue.roleId.join(",");
      const data = {
        ...item,
        pageType,
        url,
        roleId,
      };
      if (data.url.length==0 || data.url=='') {
        message.error('url地址/Bo_标识/方法名不可空');
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



  createOptions = () => {
    const {roles} = this.props;
    const childrens = [];
    childrens.push(<Option key="" value="" style={{height: 30}}></Option>);
    for (const role of roles) {
      childrens.push(<Option key={role.id} value={role.id}>{role.name}</Option>);
    }
    return childrens;
  }

  render() {
    const {inputType} = this.state;
    const {item,roleSelectedContent, roles, uploadLoading, createAvatar, type, defaultAvatar, form, passwordDefault, currentUser, empSearchKey} = this.props;
    const {getFieldDecorator, setFieldsValue} = form;
    const selectedRole=[];
    for (const selRole of roleSelectedContent) {
        selectedRole.push(selRole.roleId);
    }

    return (

      <Form layout="horizontal" onSubmit={this.handleSubmit} className={styles.busiEditForm}>
         <Form.Item name="radio-group" label="业务类型"  {...formItemLayout}>
           {getFieldDecorator('pageType', {
             initialValue: type === 'create' ? this.state.pageType :item.pageType,
           })(<Radio.Group   onChange={this.handleChange}>
             <Radio value="busi_url">URL地址</Radio>
             <Radio value="busi_bo">BO_标识与方法</Radio>
           </Radio.Group>)}
          </Form.Item>

          <FormItem label={ Field.BUSI_API_URL }   {...formItemLayout}>
            {getFieldDecorator('url', {
              initialValue: type === 'create' ?  '' :  item.pageType ==='busi_url' ? item.url : '',
              rules: [
                {
                  required: type==='create' && this.state.pageType == "busi_url" ? true :  item.pageType == "busi_url" ? true :  false ,
                  message: Field.URL_RULE_MESSAGE,
                },
              ],
            })(<Input  disabled={type === 'create' ? this.state.pageType == "busi_url" || item.pageType == "" ? false :  true :  this.state.pageType == "busi_bo" || item.pageType == "" ? true :  false } autoComplete="new-name" maxlength={90}/>)}
          </FormItem>

        <FormItem label={Field.BUSI_API_BO }   {...formItemLayout}>
          {getFieldDecorator('boName', {
            initialValue:  type === 'create' ?  '' :  item.pageType ==='busi_url' ? '' : item.url ==="" ?  '': item.url.split(".")[0],
            rules: [
              {
                required: type==='create' && this.state.pageType == "busi_url" ? false :  item.pageType == "busi_url" ? false :  true ,
                message: Field.BO_RULE_MESSAGE,
              },
            ],
          })(<Input disabled={type === 'create' ? (this.state.pageType == "busi_url" || item.pageType == "" ? true :  false ) : (this.state.pageType == "busi_url" || item.pageType == "" ? true :  false )}  autoComplete="new-name" maxlength={90}/>)}
        </FormItem>
        <FormItem label={Field.BUSI_API_METHOD }   {...formItemLayout}>
          {getFieldDecorator('method', {
            initialValue:  type === 'create' ?  '' :  item.pageType ==='busi_url' ? '' : item.url ==="" ?  '': item.url.split(".")[1],
            rules: [
              {
                required: type==='create' && this.state.pageType == "busi_url" ? false :  item.pageType == "busi_url" ? false :  true ,
                message: Field.METHOD_RULE_MESSAGE,
              },
            ],
          })(<Input  disabled={type === 'create' ? this.state.pageType == "busi_url" || item.pageType == "" ? true :  false :  this.state.pageType == "busi_url" || item.pageType == "" ? true :  false }  autoComplete="new-name" maxlength={90}/>)}
        </FormItem>


          <FormItem label={Field.BUSI_API_ALLOCATION_ROLE} {...formItemLayout}>
            {getFieldDecorator('roleId', {
              initialValue:  type === 'create' ?  [] :  selectedRole[0] === ''? [] :selectedRole,
              rules: [
                {
                  required: type==='create' && this.state.pageType == "busi_url" ? true :  item.pageType == "busi_url" ? true :  false ,
                  message: Field.ROLEID_RULE_MESSAGE,
                }
                ],
            })(<Select mode="multiple" showSearch>{this.createOptions()}</Select>)}
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

export default connect()(Form.create()(BusiEditForm));
