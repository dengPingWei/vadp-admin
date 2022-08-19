import React, {Component} from 'react';
import {Row, Col} from '@vadp/ui';
import BusiListView from './components/BusiListView';
import Search from './components/BusiApiSearch';
import BusiModal from './components/BusiApiModal';

import styles from './index.less';
import {connect} from 'dva';
import actions from '../../shared/actions'

class AuthorBusiPage extends Component {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  render() {
    return (
      <div className={styles.adminUser}>
        <Search/>
        <BusiListView/>
        <BusiModal/>
      </div>
    );
  }
}
export default connect(state => state)(AuthorBusiPage);
