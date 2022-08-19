/**
 * Created by huangzhangshu on 2019/11/28
 */
import React, {Component} from 'react';
import {Button, Checkbox, Tree, Title, message} from '@vadp/ui';
import {List,} from 'antd';
import {connect} from 'dva';
import styles from './index.less';
// console.log(Button,'ListListListListListListList')
const {Item} = List;
const {TreeNode} = Tree;

// 显示组件
class Content extends Component {

  checkUnit = (checked, code) => {
    const {selectUnitKeys, dispatch} = this.props;
    selectUnitKeys[code] = checked;
    dispatch({type: 'adminCompetency/update', payload: {selectUnitKeys: {...selectUnitKeys}}});
  }

  getTreeByKey = (key = '', list = [], resultList = []) => {
    for (const item of list) {
      if (item.code === key) {
        resultList.push(item);
      } else if (item.children && item.children.length) {
        this.getTreeByKey(key, item.children, resultList);
      }
    }
    return resultList;
  }

  onCheck = (checkedKeys) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/update', payload: {selectTreeKeys: checkedKeys.checked}});
  }

  onExpand = (expandedKeys) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/update', payload: {expandedKeys}});
  }

  onSelect = (selectedKeys) => {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/update', payload: {selectedKeys}});
  }

  onDrop = (info) => {
    const {trees, dispatch} = this.props;
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.code === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...trees];
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
    dispatch({type: 'adminCompetency/update', payload: {trees: data}});
  }

  moveToRight = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/moveToRight'});
  }

  moveToRightAll = () => {
    const {dispatch, units, selectUnitKeys} = this.props;
    for (const unit of units) selectUnitKeys[unit.code] = true;
    dispatch({type: 'adminCompetency/update', payload: {selectUnitKeys}});
    dispatch({type: 'adminCompetency/moveToRight'});
    dispatch({type: 'adminCompetency', payload: {selectUnitKeys: []}});
  }

  moveToLeft = () => {
    const {dispatch, selectTreeKeys = [], trees = []} = this.props;
    for (const key of selectTreeKeys) {
      const resultList = this.getTreeByKey(key, trees);
      const moveTree = resultList && resultList.length ? resultList[0] : {};
      if (moveTree.children && moveTree.children.length) {
        let hasNotCheckChildrenCount = 0;
        for (const child of moveTree.children) {
          if (selectTreeKeys.indexOf(child.code) !== -1) hasNotCheckChildrenCount += 1;
        }
        if (hasNotCheckChildrenCount !== moveTree.children.length) {
          message.warn('需要左移的机构存在下级成员，请将下级成员移走或选中一并左移，再执行该操作');
          return;
        }
      }
    }
    dispatch({type: 'adminCompetency/moveToLeft'});
  }

  moveToLeftAll = () => {
    const {dispatch} = this.props;
    dispatch({type: 'adminCompetency/moveToLeft', payload: {type: 'all'}});
    dispatch({type: 'adminCompetency/update', payload: {expandKeys: [], selectedKeys: []}});
  }

  renderList = () => {
    const {units = [], selectUnitKeys} = this.props;
    return (
      <List
        locale={{emptyText: ''}}
        className={styles.list}
        bordered
        split={false}
        dataSource={units}
        renderItem={item => (
          <Item>
            <Checkbox
              checked={selectUnitKeys[item.code]}
              onChange={(event) => this.checkUnit(event.target.checked, item.code)}/>
            <span>{item.name}</span>
          </Item>
        )}
      />
    );
  }

  renderTreeNodes = data => data.map((item) => {
    if (item.children && item.children.length) {
      return (
        <TreeNode title={item.name} key={item.code} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode key={item.code} title={item.name} {...item} />;
  });

  render() {
    const {units, trees, selectTreeKeys, expandedKeys, currentFunctionTitle} = this.props;
    const buttonStyle = {width: 100};
    const systemStyle = trees.length === 0 ? {justifyContent: 'center'} : {};
    // eslint-disable-next-line no-undef
    const emptyStyle = app.isIE() ? {left: '50%'} : {};
    return (
      <div className={styles.competencyContent}>
        <div className={styles.container}>
          <div className={styles.unit}>
            <Title text={currentFunctionTitle}/>
            <div className={styles.unitContainer}>
              {this.renderList()}
              {units.length === 0 && <span className={styles.emptyText} style={emptyStyle}>暂无数据</span>}
            </div>
          </div>
          <div className={styles.middle}>
            <Button type="primary" style={buttonStyle} onClick={this.moveToRight}>{'>'}</Button>
            <Button type="primary" style={buttonStyle} onClick={this.moveToLeft}>{'<'}</Button>
            <Button type="primary" style={buttonStyle} onClick={this.moveToRightAll}>{'>>'}</Button>
            <Button type="primary" style={buttonStyle} onClick={this.moveToLeftAll}>{'<<'}</Button>
          </div>
          <div className={styles.system}> 
            <Title text={currentFunctionTitle}/>
            <div className={styles.systemContainer} style={systemStyle}>
              <Tree
                checkStrictly
                defaultExpandAll
                checkable
                draggable
                blockNode
                expandedKeys={expandedKeys}
                onDrop={this.onDrop}
                checkedKeys={selectTreeKeys}
                onExpand={this.onExpand}
                onCheck={this.onCheck}
                onSelect={this.onSelect}
              >
                {this.renderTreeNodes(trees)}
              </Tree>
              {trees.length === 0 && <span className={styles.emptyText}>暂无数据</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    trees: state.adminCompetency.trees,
    units: state.adminCompetency.units,
    selectUnitKeys: state.adminCompetency.selectUnitKeys,
    selectTreeKeys: state.adminCompetency.selectTreeKeys,
    expandedKeys: state.adminCompetency.expandedKeys,
    currentFunctionTitle: state.adminCompetency.currentFunctionTitle,
  };
}

export default connect(mapStateToProps)(Content);
