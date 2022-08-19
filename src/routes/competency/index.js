/**
 * Created by huangzhangshu on 2019/11/28
 */
import React, {Component} from 'react';
import {connect} from 'dva';
import Header from './header';
import Content from './content';
import styles from './index.less';
import actions from '../../shared/actions'

// 组织职能关系页面
class Competency extends Component {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'adminCompetency/update',
      payload: {currentFunctionCode: '', currentFunctionTitle: '', units: [], trees: []},
    });
  }

  render() {
    const {currentFunctionCode} = this.props;
    return (
      <div className={styles.competency}>
        <Header/>
        {currentFunctionCode && <Content/>}
        {/* <Content/> */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentFunctionCode: state.adminCompetency.currentFunctionCode,
  };
}

export default connect(mapStateToProps)(Competency);
