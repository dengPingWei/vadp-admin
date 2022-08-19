/**
 * created by wangzhenqiang
 * url/bo_标识/方法名搜索
 */
import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Button, Select, Input} from '@vadp/ui';
import {Field} from '../common/BusiApiContacts';
import styles from '../style/Search.less';

const SelectOption = Select.Option;

class BusiApiSearch extends PureComponent {

  // 搜索url  Bo_标识
  onBusiApiChange = (value) => {
    this.handleUpdateSearchValue({searchBusiApiValue: value});
  }

  // 匹配大小写
  onFilterOption = (input, option) => {
    if (!option.props.children || !input) return false;
    const {spell = ''} = option.props;
    return option.props.children
        .toLowerCase().indexOf(input.toLowerCase()) >= 0
      || spell.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  handleSearch = () => {
    const {searchBusiApiValue, dispatch} = this.props;
    dispatch({type: 'adminBusi/updatePageInfo', payload: {pageNum: 1, busiPageNum: 1}});
    dispatch({type: 'adminBusi/updateState', payload: {pageNum: 1, recordCount: 0}});
    dispatch({type: 'adminBusi/searchBusis', payload: {searchBusiApiValue}});
  }

  handleUpdateSearchValue = (data) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminBusi/updateSearchValue', payload: data});
  }


  render() {
    const {searchBusiApiValue } = this.props;
    const buttonStyle = {height: '30px'};
    return (
      <div className={styles.busiSearch}>
        <div className={styles.inputContainer}>
          <div>
            <span className={styles.searchLabel}>{Field.BUSI_API_NAME}</span>
            <Input
              className={styles.autoComplete}
              value={searchBusiApiValue}
              onChange={(e) => this.onBusiApiChange(e.target.value)}/>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            className="portal-admin-add-btn"
            style={buttonStyle}
            // icon="search"
            onClick={this.handleSearch}
          >{Field.SEARCH}</Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchBusiApiValue: state.adminBusi.searchBusiApiValue,
    currentUser: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(BusiApiSearch);
