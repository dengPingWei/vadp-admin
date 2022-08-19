import React, {Component} from 'react';
import {Row, Col} from '@vadp/ui';
import ListView from './components/ListView';
import Search from './components/Search';
import UserModal from './components/UserModal';
import AllocationModal from './components/AllocationModal';
import ImportModal from './components/ImportModal';
import styles from './index.less';
import {connect} from 'dva';
import actions from '../../shared/actions'

class AdminUserPage extends Component {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
	}
  render() {
    return (
      <div className={styles.adminUser}>
        {/* ss */}
        <Search/>
        <ListView/>
        <UserModal/>
        <ImportModal/>
        <AllocationModal/>
      </div>
    );
  }
}
export default connect(state => state)(AdminUserPage);
