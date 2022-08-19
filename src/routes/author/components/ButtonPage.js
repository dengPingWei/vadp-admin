/**
 * Created by huangzhangshu on 2018/4/17
 */
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import ButtonSearch from './ButtonSearch';
import ButtonTable from './ButtonTable';
import {ButtonColumns} from '../../../common/AdminContacts';
import styles from '../style/ButtonPage.less';
import actions from '../../../shared/actions'

class ButtonPage extends PureComponent {
  constructor(props){
		super(props)
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
  }
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminButton/fetchUsers'});
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminButton/resetState'});
  }

  render() {
    const {
      dispatch,
      searchValue,
      selectedRowKeys,
      dataSource,
      resource,
      currentUser,
    } = this.props;

    const searchProps = {
      dataSource,
      currentUser,
      searchColumns: ButtonColumns,
      searchValue,
      onSelect: (value) => {
        dispatch({type: 'adminButton/update', payload: value});
      },
      onSearch: () => {
        dispatch({type: 'adminButton/fetchDefinedSource'});
      },
      onSave: () => {
        dispatch({type: 'adminButton/saveButton'});
      },
    };

    const contentProps = {
      dataSource,
      selectedRowKeys,
      resource,
      updateKeys: (keys) => {
        dispatch({type: 'adminButton/update', payload: {selectedRowKeys: keys}});
      },
      update: (payload) => {
        dispatch({type: 'adminButton/update', payload});
      },
    }

    return (
      <div className={`animated fadeIn ${styles.buttonPage}`}>
        <ButtonSearch {...searchProps} />
        <ButtonTable {...contentProps}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    users: state.adminButton.users,
    dataSource: state.adminButton.dataSource,
    resource: state.adminButton.resource,
    selectedRowKeys: state.adminButton.selectedRowKeys,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(ButtonPage);
