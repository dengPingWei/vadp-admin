/**
 * Created by huangzhangshu on 2018/3/27
 */
import React, {PureComponent} from 'react';
import {Layout, Form, Col, Button, message, Title, Row, Scroll} from '@vadp/ui';
import styles from './index.less';
import {unitColumns} from '../../../../common/AdminContacts';
import {switchItem, warpFormForUnit} from '../../../../utils/FormUtil';
import CodeTypes from '../../../../common/CodeTypes';
import event from '../../../../utils/event';
import {test} from '../../../../utils/index';

const {Content} = Layout;
const FormItem = Form.Item;

const halfFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 18},
  },
};

const fullFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 3},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 21},
  },
}

class DomainContent extends PureComponent {
  componentDidMount() {
    event.on('DOMAIN_FORM_RESET', this, this.onReset);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const {currentUnit, form: {resetFields}} = this.props;
    if (nextProps.currentUnit.id !== currentUnit.id) {
      resetFields();
    }
  }

  componentWillUnmount() {
    event.remove('DOMAIN_FORM_RESET', this);
  }

  onReset = () => {
    const {form: {resetFields}} = this.props;
    resetFields();
  }

  handleSubmit = () => {
    const {form: {validateFields, getFieldsValue}, onSubmit} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const fieldsValue = getFieldsValue();
      const testResult = test(fieldsValue.disEmail, 'email');
      if (testResult !== 'pass') {
        message.warn(testResult);
        return;
      }
      onSubmit(fieldsValue);
      // resetFields();
    });
  }

  switchHandler = (field, value) => {
    const {onRegion, form: {setFieldsValue}} = this.props;
    if (field === CodeTypes.prov) {
      onRegion({type: CodeTypes.city, codeLevel: '2', cd: value});
      onRegion({type: CodeTypes.adminArea, codeLevel: '3', cd: undefined});
      setFieldsValue({[CodeTypes.city]: ''});
      setFieldsValue({[CodeTypes.adminArea]: ''});
    } else if (field === CodeTypes.city) {
      onRegion({type: CodeTypes.adminArea, codeLevel: '3', cd: value});
      setFieldsValue({[CodeTypes.adminArea]: ''});
    } else {

    }
  }

  renderRule = (currentUnit) => {
    return (
      <div className={styles.rule}>
        {/*<span>{currentUnit.name}</span>*/}
        <span>编码规则 4-2-2-2-2</span>
      </div>
    );
  }

  renderFields = (currentUnit) => {
    const {getFieldDecorator} = this.props.form;
    const {codeList, isEditable} = this.props;
    return (
      <Form>
        {warpFormForUnit(unitColumns).map((columns, index) => {
          return <Row key={`unit_row_${index}`}>
            {columns.map((formItem) => {
              const item = {...formItem};
              if (item.isTitle) {
                return (
                  <Col span={24} key={`unit_line_${index}`}>
                    <Title text={item.title} style={{marginBottom: 12}}/>
                  </Col>
                );
              } else {
                const formItemLayout = item.span === 24 ? fullFormItemLayout : halfFormItemLayout;
                if (codeList[item.codeType]) item.options = codeList[item.codeType];
                if (item.field === 'code' && currentUnit.id) {
                  item.disabled = true;
                } else {
                  item.disabled = false;
                }
                if (!isEditable) item.disabled = true;
                return (
                  <Col span={item.span || 12} key={`unit_col_${item.field}`}>
                    <FormItem {...formItemLayout} label={item.text}>
                      {getFieldDecorator(item.field, {
                        initialValue: currentUnit[item.field] || item.defaultValue,
                        rules: [{
                          required: item.required,
                          message: item.errorMessage,
                        }],
                      })(switchItem(item, this.switchHandler))}
                    </FormItem>
                  </Col>
                );
              }
            })}
          </Row>
        })}
      </Form>
    );
  }

  renderSubmit() {
    const {currentUnit, onDelete, isEditable, currentUser: {account, type}, loading} = this.props;
    const disabled = !(isEditable && (account === 'admin' || type === '1'));
    return (
      <div className={styles.submitButton}>
        {currentUnit.id && <Button
          type="primary"
          style={{marginRight: 8}}
          disabled={disabled}
          onClick={onDelete}>删除</Button>}
        <Button loading={loading} type="primary" disabled={disabled} onClick={this.handleSubmit}>保存</Button>
      </div>
    );
  }

  render() {
    const {currentUnit} = this.props;
    return (
      <Content className={styles.domainContentContainer}>
        <Scroll className={styles.div}>
          {this.renderRule(currentUnit)}
          {this.renderFields(currentUnit)}
          {this.renderSubmit()}
        </Scroll>
      </Content>
    );
  }
}

export default Form.create()(DomainContent);
