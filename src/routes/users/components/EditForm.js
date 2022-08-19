import React, {PureComponent} from 'react';
import {Tooltip, Form, Input, Select, Upload, Icon, message, Avatar,Switch} from '@vadp/ui';
import {connect} from 'dva';
import {Field, TYPE_DATA} from '../common/UserContacts';
import styles from '../style/EditForm.less';
import event from '../../../utils/event';
import {wrapAvatar, wrapUrlByContextPath} from '../../../utils';

const FormItem = Form.Item;
const {Option} = Select;

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

function beforeUpload(file) {
  const isJPG = file.type.indexOf('image') !== -1;
  if (!isJPG) {
    message.error('请选择图片文件');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片最大值为2MB');
  }
  return false;
}


class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      domainValue: {},
      loading: false,
      confirmDirty: false,
      autoCompleteResult: [],
      inputType: 'text',
    };
  }

  componentDidMount() {
    event.on('RESET_USER_MODAL_FORM', this, this.handleReset);
    event.on('SAVE_USER_MODAL_FORM', this, this.handleSubmit);
    this.props.form.resetFields();
    this.initDomainValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === false) {
      this.state.domainValue = {};
      this.props.form.resetFields();
    } else if (nextProps.visible === true) {
      this.initDomainValue(nextProps);
    }
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {empUsers: [], empRecordCount: 0, empPageNum: 1, empSearchKey: ''}});
    event.remove('RESET_USER_MODAL_FORM', this);
    event.remove('SAVE_USER_MODAL_FORM', this);
    this.props.form.resetFields();
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(Field.PASSWORD_ERROR);
    } else {
      callback();
    }
  };

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], {force: true});
    }
    callback();
  };

  empScroll = (e) => {
    e.persist();
    const {empRecordCount, empPageNum, empUsers, empFetching, dispatch, form: {getFieldsValue}} = this.props
    const {target} = e;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight
      && empUsers.length < empRecordCount && !empFetching) {
      // 调用api方法
      const fields = getFieldsValue();
      dispatch({type: 'adminUser/update', payload: {empPageNum: empPageNum + 1}});
      dispatch({type: 'adminUser/findEmpList', payload: {compCode: fields.compCode, selectedValue: fields.empCode}});
    }
  }

  onRolesChange = (checkedValues) => {
    this.props.form.setFieldsValue({roleIds: checkedValues})
  }

  onStatusChange = (checkedValues) => {
    this.props.form.setFieldsValue({status: checkedValues.target.checked})
  }

  getDomainById = (domainId, domains) => {
    let domain = {};
    for (let i = 0; i < domains.length; i++) {
      if (domains[i].id === domainId) domain = domains[i];
    }
    return domain;
  }

  handleSubmit = () => {
    const {
      form: {validateFields, getFieldsValue},
      item, onOk, type, createAvatar,
    } = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const fields = getFieldsValue();
      const createUser = {
        name: fields.name,
        account: fields.account,
        // eslint-disable-next-line no-undef
        password: app.rsaString(fields.password),
        accountEnabled: fields.accountEnabled==true?'T':'F',
        description: fields.description,
        compCode: fields.compCode,
        type: fields.type,
        empCode: fields.empCode,
        email: fields.email,
        mobileTelephone: fields.mobileTelephone,
        category: fields.category,
      };
      const updateUser = {
        ...item,
        name: fields.name,
        empCode: fields.empCode,
        email: fields.email,
        mobileTelephone: fields.mobileTelephone,
        description: fields.description,
        type: fields.type,
        category: fields.category,
        accountEnabled:fields.accountEnabled==true?'T':'F',
      }
      if (type === 'create') {
        createUser.avatar = createAvatar.filePath;
      } else {
        createUser.avatar = item.avatar;
      }
      onOk(type === 'create' ? createUser : updateUser);
    });
  };

  handleReset = () => {
    const {form, onCancel} = this.props;
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };
  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({confirmDirty: this.state.confirmDirty || !!value});
  };


  initDomainValue = (props) => {
    const {type, item, domains, form} = props;
    if (type === 'create') {
      this.setState({domainValue: domains[0] || {}});
    } else {
      const domain = this.getDomainById(item.domainId, domains);
      if (domain) this.setState({domainValue: domain})
    }
  }

  createDomains = () => {
    const {modalUnits} = this.props;
    const childrens = [];
    for (let i = 0; i < modalUnits.length; i++) {
      const domain = modalUnits[i] || {};
      const {name = '', code, spell = ''} = domain;
      if (name.length * 16 > 200) {
        childrens.push(<Option key={`${code}${i}`} value={code} spell={spell}>
          <Tooltip title={name} placement="right">
            <span className={styles.selectEllipsis}>{name}</span>
          </Tooltip>
        </Option>);
      } else {
        childrens.push(<Option key={`${code}${i}`} value={code} spell={spell}>{name}</Option>);
      }
    }
    return childrens;
  }

  createEmpUser = () => {
    const {empUsers, product = ''} = this.props;
    const childrens = [];
    if (product.toLowerCase() === 'vadp') {
      childrens.push(<Option key="" value="" style={{height: 30}}></Option>);
    }
    for (let i = 0; i < empUsers.length; i++) {
      const emp = empUsers[i];
      // <Tooltip title={emp.showName || emp.empName} placement="right">
      childrens.push(
        <Option key={`${emp.empCode}${i}`} empName={emp.empName} bankAccount={emp.bankAccount} value={emp.empCode} spell={emp.spell} title={emp.showName || emp.empName}>
          <Tooltip title={emp.showName || emp.empName} placement="right">
            <span className={styles.selectEllipsis}>{emp.showName || emp.empName}</span>
          </Tooltip></Option>);
    }
    return childrens;
  }

  empBlur = () => {
    const {dispatch, empSelectedValue, form: {getFieldsValue}} = this.props;
    const fields = getFieldsValue();
    dispatch({type: 'adminUser/update', payload: {empSearchKey: '', empUsers: [], empRecordCount: 0, empPageNum: 1}});
    dispatch({
      type: 'adminUser/findEmpList',
      payload: {isReplace: true, compCode: fields.compCode, selectedValue: empSelectedValue}
    });
  }

  empSearch = (empSearchKey) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminUser/update', payload: {empSearchKey, empUsers: [], empRecordCount: 0, empPageNum: 1}});
    dispatch({type: 'adminUser/findEmpList'});
  }

  empSelect = (selectedValue, {props: {empName, bankAccount}}) => {
    const {dispatch, form: {getFieldsValue, setFieldsValue}} = this.props;
    const fields = getFieldsValue();
    if(!fields.account) setFieldsValue({account: bankAccount || selectedValue});
    if(!fields.name) setFieldsValue({name: empName});
    dispatch({type: 'adminUser/update', payload: {empSearchKey: '', empRecordCount: 0, empPageNum: 1}});
    dispatch({type: 'adminUser/findEmpList', payload: {isReplace: true, selectedValue, compCode: fields.compCode}});
  }

  getInitUnit = () => {
    const {modalUnits, currentUnit, type, item} = this.props;
    if (type === 'create') {
      for (const unit of modalUnits) {
        if (unit.code === currentUnit.code) {
          return unit.code;
        }
      }
    } else {
      for (const unit of modalUnits) {
        if (unit.code === item.compCode) {
          return unit.code;
        }
      }
    }
  }

  getInitEmpUser = () => {
    const {modalEmpUser, type} = this.props;
    if (type === 'create') return '';
    return modalEmpUser.empCode;
  }
  handleDomainChange = (compCode) => {
    const {form: {setFieldsValue}, handleSelectDomain} = this.props;
    handleSelectDomain(compCode);
    setFieldsValue({empCode: ''});
  }

  handleEmpChange = (empCode) => {
    const {form: {setFieldsValue}, empUsers} = this.props;
    for (const emp of empUsers) {
      // if (emp.empCode === empCode) setFieldsValue({name: emp.empName});
    }
  }

  handleChange = (info) => {
    const {item, handleUpload, type} = this.props;
    const formData = new FormData();
    formData.append('user_id', type === 'create' ? type : item.id);
    formData.append('account', type === 'create' ? type : item.account);
    formData.append('img_file', info.file);
    if (handleUpload) handleUpload(formData);
  }

  renderUploadButton() {
    const {uploadLoading} = this.props;
    return (
      <div>
        <Icon type={uploadLoading ? 'loading' : 'plus'}/>
        <div className="ant-upload-text">上传头像</div>
      </div>
    );
  }

  renderDefaultAvatar(source) {
    const {defaultAvatar} = this.props;
    const avatarClassName = defaultAvatar === source ?
      styles.defaultAvatarImage : styles.avatarImage;
    // const source = type === 'create' ? createAvatar : avatar;
    return (
      <Avatar src={wrapAvatar(source)} alt="" square="square" className={avatarClassName}/>
    );
  }

  renderAvatar(source) {
    const {defaultAvatar} = this.props;
    const avatarClassName = defaultAvatar === source ?
      styles.defaultAvatarImage : styles.avatarImage;
    // const source = type === 'create' ? createAvatar : avatar;
    return (
      <Avatar src={wrapUrlByContextPath(source)} alt="" square="square" className={avatarClassName}/>
    );
  }

  renderTypes() {
    const {currentUser: {account}} = this.props;
    const types = [];
    types.push(<Option key="users_editform_0" value="0">普通员工</Option>)
    if (account === 'admin')
      types.push(<Option key="users_editform_1" value="1">管理员</Option>)
    return types;
  }

  renderCategorys() {
    const {upCodeList = []} = this.props;
    const categorys = [];
    categorys.push(<Option key="" value="" style={{height: 30}}></Option>)
    for (const item of upCodeList) {
      categorys.push(<Option key={item.codeValue} value={item.codeValue}>{item.codeName}</Option>);
    }
    return categorys;
  }
  onChangeIsUse =(checked)=>{
    const {form } = this.props;
    const {setFieldsValue} = form;
    setFieldsValue({accountEnabled: checked})
  }

  render() {
    const {inputType} = this.state;
    const {item, roles, uploadLoading, createAvatar, type, defaultAvatar, form, passwordDefault, currentUser, empSearchKey, product = ''} = this.props;
    const {getFieldDecorator, setFieldsValue} = form;
    const options = [];
    let accountEnabled = true;
    if(item && typeof(item.accountEnabled) !="undefined" && item.accountEnabled !=='T' ) {
      accountEnabled = false;
    }
    for (const role of roles) {
      options.push({
        label: `(${role.name})${role.remark}`, value: role.id,
      });
    }
    const domains = this.createDomains();
    const emps = this.createEmpUser();
    const uploadButton = this.renderUploadButton();
    const avatarImage = (createAvatar.filePath || item.avatar) ? this.renderAvatar(
      createAvatar.filePath || item.avatar) : this.renderDefaultAvatar(defaultAvatar);
    // if (type === 'create') item.avatar = createAvatar;
    const disabled = type !== 'create';
    // 普通用户类型可以编辑，管理管理不可以编辑
    let typeDisabled = type !== 'create' && item.type === '1';
    if (currentUser.account !== 'admin' && currentUser.type === '1') typeDisabled = true;
    const validateTrigger = 'onBlur';
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit} className={styles.userEditForm}>
        <div style={{width: 300}}>
          <FormItem label={Field.USERNAME_LABEL}  {...formItemLayout}>
            {getFieldDecorator('account', {
              validateTrigger,
              initialValue: item.account,
              rules: [
                {
                  required: true,
                  message: Field.USERNAME_RULE_MESSAGE,
                },
              ],
            })(<Input
              autoComplete="new-account"
              disabled={disabled}
              maxlength={18}
              onKeyUp={(e) => {
                const {value} = e.target;
                // replace(/\'[a-z|A-Z]/ig, '')
                if (value.indexOf('\'') === -1) {
                  const filterValue = value.replace(/[^\w\.\/]/ig, '');
                  setFieldsValue({account: filterValue});
                }
              }}/>)}
          </FormItem>

          <FormItem label={Field.NAME_LABEL}  {...formItemLayout}>
            {getFieldDecorator('name', {
              validateTrigger,
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  message: Field.NAME_RULE_MESSAGE,
                },
              ],
            })(<Input autoComplete="new-name" maxlength={16}/>)}
          </FormItem>

          {!disabled && passwordDefault && <FormItem
            {...formItemLayout}
            label={Field.PASSWORD_LABEL}>
            {getFieldDecorator('password', {
              validateTrigger,
              rules: [{
                required: true, message: Field.PASSWORD_REQUIRED,
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input
                type={inputType}
                autoComplete="new-password"
                maxlength={16}
                onFocus={() => this.setState({inputType: 'password'})}/>
            )}
          </FormItem>}

          {!disabled && passwordDefault && <FormItem
            {...formItemLayout}
            label={Field.CONFIRM_PASSWORD_LABEL}>
            {getFieldDecorator('confirm', {
              validateTrigger,
              rules: [{
                required: true, message: Field.CONFIRM_PASSWORD_REQUIRED,
              }, {
                validator: this.checkPassword,
              }],
            })(
              <Input
                type={inputType}
                maxlength={16}
                onBlur={this.handleConfirmBlur}
                onFocus={() => this.setState({inputType: 'password'})}/>
            )}
          </FormItem>}

          <FormItem label={Field.DOMAIN_LABEL} {...formItemLayout}>
            {getFieldDecorator('compCode', {
              validateTrigger,
              initialValue: this.getInitUnit(),
              rules: [
                {
                  required: true,
                  message: Field.DOMAIN_PLACEHOLDER,
                },
              ],
            })(<Select
              showSearch
              filterOption={(input, option) => {
                let {children, spell = ''} = option.props;
                if (typeof children !== 'string') {
                  children = children.props.title;
                }
                return children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  || spell.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              disabled={disabled}
              notFoundContent={Field.NOT_FOUND_DOMAIN}
              placeholder={Field.DOMAIN_PLACEHOLDER}
              onChange={this.handleDomainChange}>{domains}</Select>)}
          </FormItem>

          <FormItem label={Field.EMP_USER_LABEL} {...formItemLayout}>
            {getFieldDecorator('empCode', {
              initialValue: this.getInitEmpUser(),
              rules: [
                {
                  required: product.toLowerCase() !== 'vadp',
                  message: '请选择职工',
                },
              ],
            })(<Select
              showSearch
              placeholder={empSearchKey}
              onPopupScroll={this.empScroll}
              filterOption={(input, option) => {
                const {props: {spell = '', title = ''}} = option;
                return title  &&(title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  || (spell && spell.toLowerCase().indexOf(input.toLowerCase()) >= 0));
              }}
              onBlur={this.empBlur}
              onSelect={this.empSelect}
              onSearch={this.empSearch}
              onChange={this.handleEmpChange}>{emps}</Select>)}
          </FormItem>

          <FormItem label="用户级别" {...formItemLayout}>
            {getFieldDecorator('category', {
              validateTrigger,
              initialValue: item.category || '',
            })(<Select
              // disabled={typeDisabled}
              notFoundContent={Field.NOT_FOUND_USER_CATEGORY}
              placeholder={Field.USER_CATEGORY_PLACEHOLDER}>
              {this.renderCategorys()}</Select>)}
          </FormItem>

          <FormItem label={Field.USER_TYPE} {...formItemLayout}>
            {getFieldDecorator('type', {
              validateTrigger,
              initialValue: item.type || '0',
              rules: [
                {
                  required: true,
                  message: Field.USER_TYPE_MESSAGE,
                },
              ],
            })(<Select
              disabled={typeDisabled}
              notFoundContent={Field.NOT_FOUND_USER_TYPE}
              placeholder={Field.USER_TYPE_PLACEHOLDER}>
              {this.renderTypes()}</Select>)}
          </FormItem>

          <FormItem label={Field.EMAIL_LABEL}  {...formItemLayout}>
            {getFieldDecorator('email', {
              validateTrigger,
              initialValue: item.email,
              rules: [{
                type: 'email', message: Field.EMAIL_RULE_MESSAGE,
              }],

            })(<Input maxlength={32}/>)}
          </FormItem>


          <FormItem label={Field.MOBILE_LABEL}  {...formItemLayout}>
            {getFieldDecorator('mobileTelephone', {
              validateTrigger,
              initialValue: item.mobileTelephone,
              rules: [
                {
                  pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
                  message: '请输入正确的手机号码'
                }
              ]
            })(<Input maxlength={11}/>)}
          </FormItem>

          <FormItem label={Field.USER_DESCRIPTION}  {...formItemLayout}>
            {getFieldDecorator('description', {
              initialValue: item.description,
            })(<Input maxlength={120}/>)}
          </FormItem>
          <FormItem label="是否启用" {...formItemLayout} >{
            getFieldDecorator('accountEnabled',{
              initialValue:accountEnabled
            })
          (<Switch defaultChecked={accountEnabled} onChange={this.onChangeIsUse}/>)}
          </FormItem>
        </div>

        <div style={{marginLeft: 50}}>
          <Upload
            accept="image/png, image/jpg, image/jpeg"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={this.handleChange}>
            {!uploadLoading ? avatarImage : uploadButton}
          </Upload>
        </div>
      </Form>
    );
  }
}

export default connect()(Form.create()(EditForm));
