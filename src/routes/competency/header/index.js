/**
 * Created by huangzhangshu on 2019/11/28
 */
import React, {Component} from 'react';
import {Select, Button} from '@vadp/ui';
import {connect} from 'dva';
import styles from './index.less';

const {Option} = Select;

// 头部组件
class Header extends Component {

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/fetchFunction'});
  }

  // 下拉框选中
  onChange = (type, option) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'adminCompetency/update',
      payload: {
        selectUnitKeys: {},
        units: [],
        trees: [],
        currentFunctionCode: type,
        currentFunctionTitle: option.props.children,
      },
    });
    dispatch({type: 'adminCompetency/fetchList', payload: {type}});
  }

  // 匹配大小写
  onFilter = (input, option) => {
    if (!option.props.children || !input) return false;
    return option.props.children
      .toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  // 保存编辑数据
  onSave = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/saveRelation'});
  }

  // 渲染下拉框选项
  renderOption = () => {
    const {functionList} = this.props;
    return functionList.map(({code, name}) => {
      return (
        <Option value={code} key={code} title={name}>{name}</Option>
      );
    });
  }

  render() {
    const {currentFunctionCode} = this.props;
    const buttonStyle = {height: 30};
    return (
      <div className={styles.competencyHeader}>
        <div>
          <span className={styles.label}>组织类型:</span>
          <Select
            value={currentFunctionCode}
            showSearch
            onChange={this.onChange}
            filterOption={this.onFilter}
            className={styles.select}>
            {this.renderOption()}
          </Select>
        </div>
        <Button type="primary" style={buttonStyle} onClick={this.onSave}>保存</Button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {functionList: state.adminCompetency.functionList,currentFunctionCode: state.adminCompetency.currentFunctionCode};
}

export default connect(mapStateToProps)(Header);
