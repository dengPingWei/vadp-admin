import React, {Component} from 'react';
import {Tree} from '@vadp/ui';
import {connect} from 'dva';

import {getTreeNodeById} from '../../../utils/index';

const {TreeNode} = Tree;

// 展示并编辑菜单顺序
class ListView extends Component {

    onCheck = (checkedKeys) => {
        this.setState({checkedKeys});
    }

    onDrop = (info) => {
        const {menuTrees, dispatch} = this.props;
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        const dropMenu = info.dragNode.props.menu;

        const loop = (data, key, callback) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children, key, callback);
                }
            }
        };
        const data = [...menuTrees];

        // Find dragObject
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
                // where to insert 示例添加到头部，可以是随意位置
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
        dispatch({type: 'adminMenu/updateState', payload: {menuTrees: data}});
        let menus = [];
        let orderMenus = [];
        let orderNum = 0;
        if (dropMenu.parentId === '-1' || !dropMenu.parentId) {
            orderMenus = data;
        } else {
            const node = getTreeNodeById(data, dropMenu.parentId);
            if (node && node.children) orderMenus = node.children;
        }
        for (const {appId, parentId, description, icon, id, isLeaf, name, title, type, url = '', enabled} of orderMenus) {
            const menuOrder = orderNum++;
            menus.push({
                appId,
                parentId,
                description,
                icon,
                id,
                isLeaf,
                name,
                title,
                type,
                url: (type === 3 || type === 1) && url ? url.substring(url.indexOf('/#/')) : url,
                app: appId,
                parent: parentId,
                orderNum: String(menuOrder),
                order: String(menuOrder),
                isEnabled: enabled,
                page: url ? type === 2 || type === 4 ? (url || '').split('page=')[1] || '' : '' : '',
            })
        }
        dispatch({type: 'adminMenu/updateMenu', payload: {menus}});
    }


    handleSelect = (selectedKeys, {selectedNodes = []}) => {
        const {dispatch, onSelect} = this.props;
        const [{props: {childrenCount = 0}}] = selectedNodes;
        if (onSelect && selectedKeys.length > 0) {
            onSelect(selectedKeys[0]);
        }
        dispatch({type: 'adminMenu/updateState', payload: {childrenCount}});
    };

    render() {
        const {menuTrees, checkedKeys, onCheck} = this.props;

        const loop = (data) => data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode key={item.id} title={item.title} childrenCount={item.children.length} menu={item}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.id} title={item.title} chilrenCount={0} menu={item}/>;
        });
        return (
            <Tree
                width={280}
                // defaultExpandAll
                style={{marginTop: 30}}
                onSelect={this.handleSelect}
                checkable={false}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                draggable
                blockNode
                // showLine
                onDrop={this.onDrop}
                className="admin-menu-tree">
                {loop(menuTrees)}
            </Tree>
        );
    }
}

function mapStateToProps(state) {
    return {menuTrees: state.adminMenu.menuTrees};
}

export default connect(mapStateToProps)(ListView);

