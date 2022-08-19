import React, {Component} from 'react';
import {Tree, Button} from '@vadp/ui';
import {arrayToTree} from '../../../utils/';

const TreeNode = Tree.TreeNode;

class AssignMenus extends Component {

  state = {
    checkedKeys: []
  };
  handleReset = () => {

  };
  handleCheck = (checkedKeys) => {
    this.setState({checkedKeys});
  };
  handleOk = () => {
    const {onCheck} = this.props;
    if (onCheck) {
      onCheck(this.state.checkedKeys);
    }
  };

  componentDidMount() {
    const {checkedKeys} = this.props;
    if (checkedKeys && checkedKeys.length > 0) {
      this.setState({checkedKeys: checkedKeys});
    }
  }

  render() {
    const {menu} = this.props;

    const menuTree = arrayToTree(menu, 'id', 'parentId');
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.id} title={item.name}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={item.name}/>;
    });
    return (
      <div style={{minHeight: 400, maxHeight: 600, overflow: 'auto'}}>
        <div style={{margin: 'auto auto'}}>
          <Button style={{marginRight: 8}} onClick={this.handleReset}>
            重制
          </Button>
          <Button type="primary" onClick={this.handleOk}>保存</Button>
        </div>
        <Tree
          defaultExpandAll
          checkable
          onCheck={this.handleCheck}
          checkedKeys={this.state.checkedKeys}
          showLine={true}
        >
          {loop(menuTree)}
        </Tree>
      </div>
    )
  }

}

export default AssignMenus;
