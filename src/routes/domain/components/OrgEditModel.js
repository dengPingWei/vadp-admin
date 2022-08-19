import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {message, Checkbox, Button, Modal, Form, Select, Radio, Row, Col, Input, Title, Icon} from '@vadp/ui';
import OrganizationType from "../orginzation";
import CodeTypes from '../../../common/CodeTypes';

const confirm = Modal.confirm;

const FormItem = Form.Item;
const {Option} = Select;

// 增加匹配中英文小中大括号
const patternText = /^[a-zA-Z0-9\u4e00-\u9fa5\[\](){}（）「」【】]+$/;

class OrgEditModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      childData: [],
      menuList: [],
      secondCity: '',
      isGroup: '',
      loading: false,
      formModalList: {},
      isToggleOn: false,
      iconValue: 'down',
      display_name: 'none', //此状态机为display的取值
      panelData: {},
    };
  }

  componentDidMount() {
  }

  handleChildData(selectedValues) {
    this.setState({childData: selectedValues});
  }

  updateFunctionData = (data) => {
    const {panelData} = this.state;
    const {functionCode, paramCode, paramValue} = data;
    panelData[functionCode] = {paramCode, paramValue};
    this.setState({panelData});
  }

  showIsGroupConfirm = () => {
    confirm({
      title: '请确认业务基础平台是否为集团模式?',
      content: '',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        this.handleSubmit('true')
      },
      onCancel: () => {
        this.handleSubmit('false')
      },
    });
  }

  checkIsFirst = () => {
   const {dispatch, treeList, form: {validateFields, getFieldsValue}} = this.props;
        validateFields((errors) => {
            if (errors) return;
            if (treeList.length === 0) {
                this.showIsGroupConfirm();
            } else {
                this.handleSubmit('true');
            }
        });
  }

  handleSubmit = (isGroup = null) => {
    const {dispatch, editList, form: {getFieldsValue}, handleRefreshData} = this.props;
    const {childData, panelData} = this.state;
    const details = [];
    for (const child of childData) {
      const item = {};
      const {code, functionCode} = child;
      item.functionCode = code || functionCode;
      const paramData = panelData[item.functionCode] || {};
      if (paramData.paramCode && paramData.paramValue) {
        item.paramCode = paramData.paramCode;
        item.paramValue = paramData.paramValue;
        details.push({functionCode: item.functionCode});
      }
      details.push(item);
    }
    const fields = getFieldsValue();
    fields.id = editList.id;
    fields.isGroup = isGroup;
    if (fields.adminArea === '') {
      fields.adminArea = '0';
    }
    if (fields.city === '') {
      fields.city = '0';
    }
    const data = {unit: fields, details};
    this.setState({loading: true});
    dispatch({
      type: 'adminDomain/fetchSaveOrUpdataTreeList',
      payload: {data},
      callback: (res) => {
        if (res.code === 200) {
          handleRefreshData();
          this.setState({loading: false, childData: [], panelData: []});
          dispatch({type: 'adminDomain/update', payload: {cityData: '', townData: ''}});
        } else {
          this.setState({loading: false});
        }
      },
    });
  }

  handleCancel = () => {
    const {dispatch} = this.props;
    this.setState({confirmLoading: false, childData: [], panelData: []});
    dispatch({type: 'adminDomain/update', payload: {showModal: false, editList: {}, cityData: '', townData: ''}});
  };

  handleProvinceChange = value => {
    const {dispatch, onCityRegion} = this.props;
    this.props.form.setFieldsValue({city: '', adminArea: ''});
    onCityRegion({type: CodeTypes.city, codeLevel: '2', cd: value});
    dispatch({type: 'adminDomain/update', payload: {townData: ''}});
  };

  handleTownChange = value => {
    const {onTownRegion, form: {setFieldsValue}} = this.props;
    setFieldsValue({adminArea: ''});
    onTownRegion({type: CodeTypes.adminArea, codeLevel: '3', cd: value});
  };

  displayName() { //编辑按钮的单击事件，修改状态机display_name的取值
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn,
      display_name: prevState.isToggleOn ? 'none' : 'block',
      iconValue: prevState.isToggleOn ? 'down' : 'up',
    }));
  }

  render() {
    const formList = this.props.codeList;
    const {confirmLoading} = this.state;
    const {editList, menuList, showModal, showModalTitle, showModalOkButton} = this.props;
    const isDisable = showModalTitle === '组织机构新增' ? false : true;
    const {getFieldDecorator} = this.props.form;
    const data1 = formList.institution_type_code || [];
    const compTypeCodeList = formList.comp_type_code || [];
    const compLevelCodesList = formList.compLevelCodes || [];
    const subjectionCodeList = formList.subjection_code || [];
    const hospattrList = this.props.hospattr || [];
    const hosplevelList = this.props.hosplevel || [];
    const provinceData = this.props.provinceData || [];

    const cityData = this.props.cityData || [];
    const townData = this.props.townData || [];
    const formProps = {menuList, editList};
    const formItemLayout = {labelCol: {span: 6}, wrapperCol: {span: 18}};
    const formLabelLayout = {labelCol: {span: 3}, wrapperCol: {span: 21}};
    return (
      <Modal
        title={showModalTitle}
        width={800}
        visible={showModal}
        maskClosable={false}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        onOk={this.checkIsFirst}
        footer={[
          <Button
            key="back"
            onClick={this.handleCancel}>取消</Button>,
          <Button
            key="submit"
            type="primary"
            loading={this.state.loading}
            disabled={showModalOkButton}
            onClick={this.checkIsFirst}>保存</Button>,
        ]}>
        <Form layout="horizontal" style={{maxHeight: '60vh', overflowY: 'auto', width: '100'}}>
          <Row>
            <Col span={24}> <Title text={`单位信息`} style={{marginBottom: 12}}/> </Col>
          </Row>
          <Row>
            <Col span={12} style={{display: 'inline-block'}}>
              <FormItem {...formItemLayout} label={`编码`}>
                {getFieldDecorator('code', {
                  rules: [{
                    max: 100,
                    message: '机构编码不能大于100个字符',
                  }, {required: true, message: '请输入组织机构编码',}], initialValue: editList.code
                })(
                  <Input disabled={isDisable}/>
                )}</FormItem>
            </Col>
            <Col span={12} style={{display: 'inline-block'}}>
              <FormItem {...formItemLayout} label="名称">
                {getFieldDecorator('name', {
                  rules: [
                    {
                      max: 99,
                      message: '机构名称不能大于99个字符',
                    },
                    {
                      pattern: new RegExp(patternText),//要匹配等正则
                      message: "(不能输入特殊字符或空格)",//输入不合法要提示等信息
                    },
                    {
                      required: true,
                      message: '请输入组织机构名称',
                    }], initialValue: editList.name
                })(<Input/>)}</FormItem>
            </Col></Row>

          <Row> <Col span={12}>
            <FormItem {...formItemLayout} label='单位级别'>
              {getFieldDecorator('compLevelCode', {
                rules: [{required: true, message: '请选择单位级别',}],
                initialValue: editList.compLevelCode
              })(
                <Select onChange={this.handleSecChange}>
                  {

                    compLevelCodesList.length && compLevelCodesList.map((item, index) => (
                      <Select.Option key={index} value={item.codeValue}>{item.codeName}</Select.Option>))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
            <Col span={12}> <FormItem {...formItemLayout} label='市或区县'>
              {getFieldDecorator('isCount', {
                rules: [{required: true, message: '请选择市或县区',}],
                initialValue: editList.isCount
              })
              (
                <Radio.Group onChange={this.onChange}>
                  <Radio value={'0'}>市</Radio>
                  <Radio value={'1'}>区县</Radio>
                </Radio.Group>
              )}
            </FormItem> </Col> </Row>


          <Row>
            <Col span={12}> <FormItem {...formItemLayout} label='医院等级'>
              {getFieldDecorator('hospLevelCode', {
                rules: [{required: true, message: '请选择医院等级',}],
                initialValue: editList.hospLevelCode
              })(
                <Select onChange={this.handleSecChange}>
                  {
                    hosplevelList.length && hosplevelList.map((item, index) => (
                      <Select.Option key={index} value={item.hospLevelCode}>{item.hospLevelName}</Select.Option>))
                  }
                </Select>
              )}
            </FormItem>
            </Col>
            <Col span={12}> <FormItem {...formItemLayout} label='财务会计'>
              {getFieldDecorator('accManager', {
                initialValue: editList.accManager,
              })(<Input placeholder="" maxLength={40}/>)}
            </FormItem>
            </Col>
          </Row>

          <Row> <Col span={12}>
            <FormItem {...formItemLayout} label='医院隶属'>
              {getFieldDecorator('subjectionCode', {initialValue: editList.subjectionCode})(
                <Select onChange={this.handleSecChange}>
                  <Select.Option key="subjection_type_empty" value='0' style={{height: 30}}></Select.Option>
                  {
                    subjectionCodeList.length && subjectionCodeList.map((item, index) => (
                      <Select.Option key={index} value={item.codeValue}>{item.codeName}</Select.Option>))
                  }
                </Select>
              )}</FormItem>
          </Col>
            <Col span={12}> <FormItem {...formItemLayout} label='医院性质'>
              {getFieldDecorator('hospAttrCode', {initialValue: editList.hospAttrCode})(
                <Select onChange={this.handleSecChange}>
                  <Select.Option key="hospAttrCode_type_empty" value='0' style={{height: 30}}></Select.Option>
                  {
                    hospattrList.length && hospattrList.map((item, index) => (
                      <Select.Option key={index} value={item.hospAttrCode}>{item.hospAttrName}</Select.Option>))
                  }
                </Select>
              )}
            </FormItem> </Col> </Row>

          <Row> <Col span={12}>
            <FormItem {...formItemLayout} label='事业类别'>
              {getFieldDecorator('institutionTypeCode', {initialValue: editList.institutionTypeCode})(
                <Select onChange={this.handleSecChange}>
                  <Select.Option key="institutionTypeCode_type_empty" value='0' style={{height: 30}}></Select.Option>
                  {
                    data1.length && data1.map((item, index) => (
                      <Select.Option key={index} value={item.codeValue}>{item.codeName}</Select.Option>))
                  }
                </Select>
              )}</FormItem>
          </Col>
            <Col span={12}> <FormItem {...formItemLayout} label='单位类别'>
              {getFieldDecorator('compTypeCode', {initialValue: editList.compTypeCode})(
                <Select onChange={this.handleSecChange}>
                  <Select.Option key="compTypeCode_type_empty3" value='0' style={{height: 30}}></Select.Option>
                  {
                    compTypeCodeList.length && compTypeCodeList.map((item, index) => (
                      <Select.Option key={index} value={item.codeValue}>{item.codeName}</Select.Option>))
                  }
                </Select>
              )}
            </FormItem> </Col> </Row>

          <Row> <Col span={12}>
            <FormItem {...formItemLayout} label='单位领导'>
              {getFieldDecorator('compLeader', {
                rules: [
                  {
                    max: 40,
                    message: '填写单位领导不能大于40个字符',
                  },
                  {
                    pattern: new RegExp(patternText),//要匹配等正则
                    message: "(不能输入特殊字符或空格)",//输入不合法要提示等信息
                  }
                ], initialValue: editList.compLeader
              })(<Input placeholder=''/>)}</FormItem>
          </Col>
            <Col span={12}> <FormItem {...formItemLayout} label='税务证号'>
              {getFieldDecorator('taxNo', {
                rules: [{
                  max: 20,
                  message: '填写税务证号不能大于20个字符',
                },
                  {
                    pattern: new RegExp(patternText),//要匹配等正则
                    message: "(不能输入特殊字符或空格)",//输入不合法要提示等信息
                  }], initialValue: editList.taxNo
              })(<Input placeholder=''/>)}
            </FormItem> </Col> </Row>

          <Row> <Col span={12}>
            <FormItem {...formItemLayout} label='机构代码'>
              {getFieldDecorator('unitCode', {
                rules: [
                  {
                    max: 128,
                    message: '机构代码不能大于128个字符',
                  }
                ], initialValue: editList.unitCode
              })(<Input placeholder=''/>)}</FormItem>
          </Col>
            <Col span={12}> <FormItem {...formItemLayout} label='属性代码'>
              {getFieldDecorator('typeCode', {
                rules: [
                  {
                    max: 13,
                    message: '属性代码不能大于13个字符',
                  },
                  {
                    message: '只能输入英文或数字',
                    pattern: /^[0-9a-zA-Z]*$/
                  }
                ], initialValue: editList.typeCode
              })(<Input placeholder=''/>)}
            </FormItem> </Col> </Row>

          <Row> <Col span={24}>
            <FormItem {...formLabelLayout} label='描述'>
              {getFieldDecorator('description', {
                rules: [{
                  max: 127,
                  message: '填写描述不能大于127个字符',
                },
                  {
                    pattern: new RegExp(patternText),//要匹配等正则
                    message: "(不能输入特殊字符或空格)",//输入不合法要提示等信息
                  }], initialValue: editList.description
              })(<Input placeholder=''/>)}</FormItem>
          </Col>

          </Row>
          <Row>
            <Col span={3}>
              <Title text={`联系方式`} style={{marginBottom: 12}}/>
            </Col>

            <Col span={3}> {}
              <Button value="small" type="link"  onClick={this.displayName.bind(this)}>
                {this.state.isToggleOn ? '收起' : '展开'}
                <Icon type={this.state.iconValue}/>
              </Button>
            </Col>
            <Col span={18}>
            </Col>
          </Row>
          <div style={{display: this.state.display_name}}>
            <Row> <Col span={12}>
              <FormItem {...formItemLayout} label='省'>
                {getFieldDecorator('prov', {initialValue: editList.prov})(
                  <Select

                    onChange={this.handleProvinceChange}
                  >
                    <Select.Option key="prov_type_empty" value='0' style={{height: 30}}></Select.Option>
                    {provinceData.map(province => (
                      <Option key={province.cd}>{province.cn}</Option>
                    ))}
                  </Select>
                )}</FormItem>
            </Col>
              <Col span={12}> <FormItem {...formItemLayout} label='市'>
                {getFieldDecorator('city', {initialValue: editList.city})(
                  <Select
                    onChange={this.handleTownChange}>
                    <Select.Option key="city_type_empty" value='0' style={{height: 30}}></Select.Option>
                    {cityData.map(province => (
                      <Option key={province.cd}>{province.cn}</Option>
                    ))}
                  </Select>
                )}
              </FormItem> </Col> </Row>

            <Row> <Col span={12}>
              <FormItem {...formItemLayout} label='县'>
                {getFieldDecorator('adminArea', {initialValue: editList.adminArea})(
                  <Select>
                    <Select.Option key="adminArea_type_empty" value='0' style={{height: 30}}></Select.Option>
                    {townData.map(province => (
                      <Option key={province.cd}>{province.cn}</Option>
                    ))}
                  </Select>
                )}</FormItem>
            </Col>
              <Col span={12}> <FormItem {...formItemLayout} label='邮政编码'>
                {getFieldDecorator('postCode', {
                  rules: [{
                    max: 20,
                    message: '填写邮政编码不能大于20个字符',
                  }], initialValue: editList.postCode
                })(<Input placeholder=''/>)}
              </FormItem> </Col> </Row>

            <Row> <Col span={12}>
              <FormItem {...formItemLayout} label='联系人'>
                {getFieldDecorator('linkman', {
                  rules: [{
                    max: 40,
                    message: '填写联系人不能大于40个字符',
                  },
                    {
                      pattern: new RegExp(patternText),//要匹配等正则
                      message: "(不能输入特殊字符或空格)",//输入不合法要提示等信息
                    }], initialValue: editList.linkman
                })(<Input placeholder=''/>)}</FormItem>
            </Col>
              <Col span={12}> <FormItem {...formItemLayout} label='联系电话'>
                {getFieldDecorator('linkPhone', {
                  rules: [{
                    max: 20,
                    message: '填写联系电话不能大于20个字符',
                  }], initialValue: editList.linkPhone
                })(<Input placeholder=''/>)}
              </FormItem> </Col> </Row>

            <Row> <Col span={12}>
              <FormItem {...formItemLayout} label='Email'>
                {getFieldDecorator('disEmail', {
                  rules: [{
                    max: 40,
                    message: '填写邮箱不能大于40个字符',
                  }], initialValue: editList.disEmail
                })(<Input placeholder=''/>)}</FormItem>
            </Col>
            </Row>
            <Row> <Col span={24}>
              <FormItem {...formLabelLayout} label='详细地址'>
                {getFieldDecorator('address', {
                  rules: [{
                    max: 40,
                    message: '填写详细地址不能大于40个字符',
                  },
                    {
                      pattern: new RegExp(patternText),//要匹配等正则
                      message: "(不能输入特殊字符或空格)",//输入不合法要提示等信息
                    }], initialValue: editList.address
                })(<Input placeholder=''/>)}</FormItem>
            </Col>
            </Row>
          </div>
          <Col span={24}> <Title text={`组织类型`} style={{marginBottom: 12}}/> </Col>
          <Row>
            <Col span={24}>
              <OrganizationType
                {...formProps}
                GetChildData={this.handleChildData.bind(this)}
                updateFunctionData={this.updateFunctionData}/>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default connect()(Form.create()(OrgEditModel));

