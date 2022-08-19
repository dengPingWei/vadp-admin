/**
 * Created by huangzhangshu on 2019/11/28
 */
import {message} from '@vadp/ui';
import {
  fetchCompetencyFunction,
  fetchCompetencyList,
  fetchCompetencySaveRelation,
} from '../services/api';

function filterTree(node = {}, nodeKeys = []) {
  const {code} = node;
  for (const key of nodeKeys) {
    if (key === code) {
      return false;
    }
  }
  return true;
}

function moveNodeByCode(trees = [], selectedKeys = []) {
  for (let i = trees.length - 1; i >= 0; i--) {
    const node = trees[i];
    for (const key of selectedKeys) {
      if (key === node.code) trees.splice(i, 1);
      if (node.children && node.children.length) moveNodeByCode(node.children, selectedKeys);
    }
  }
}

function getNodeByCode(nodeList = [], code = '', result = [], type = '') {
  for (const node of nodeList) {
    if (type === 'all') {
      result.push({...node, children: []});
      if (node.children && node.children.length) getNodeByCode(node.children, code, result, type);
    } else {
      if (node.code === code) {
        result.push({...node, children: []});
      } else if (node.children && node.children.length) {
        getNodeByCode(node.children, code, result);
      }
    }
  }
}

function getChildrenData(nodeList = [], parentCode = '', data = []) {
  for (const node of nodeList) {
    data.push({
      orgCode: node.code,
      orgName: node.name,
      isRoot: 0,
      refOrgCode: parentCode,
    });
    if (node.children && node.children.length) getChildrenData(node.children, node.code, data);
  }
}

function getExpandCode(nodeList = [], expandedKeys = []) {
  for (const node of nodeList) {
    if (node.children && node.children.length) {
      expandedKeys.push(node.code);
      getExpandCode(node.children, expandedKeys);
    }
  }
}

function getTreeByCode(trees = [], code = '', resultList = []) {
  for (const tree of trees) {
    if (tree.code === code) {
      resultList.push(tree);
    } else if (tree.children) {
      getTreeByCode(tree.children, code, resultList);
    }
  }
  return resultList;
}

const initialState = {
  functionList: [],
  currentFunctionCode: '',
  currentFunctionTitle: '',
  units: [],
  trees: [],
  selectUnitKeys: {},
  selectTreeKeys: [],
  expandedKeys: [],
  selectedKeys: [],
}

export default {
  namespace: 'adminCompetency',
  state: {...initialState},
  effects: {
    * fetchFunction(_, {call, put}) {
      const {code, data: functionList} = yield call(fetchCompetencyFunction);
      if (code === 200) {
        yield put({type: 'update', payload: {functionList}});
        if (functionList.length) {
          const firstFunction = functionList[0];
          yield put({
            type: 'update',
            payload: {currentFunctionCode: firstFunction.code, currentFunctionTitle: firstFunction.name},
          });
          yield put({type: 'fetchList', payload: {type: firstFunction.code}});
        }
      }
    },

    * fetchList({payload: {type}}, {call, put}) {
      const {code, data} = yield call(fetchCompetencyList, {type});
      if (code === 200) {
        const {releationsTree: trees, units} = data;
        const expandedKeys = [];
        for (const node of trees) {
          if (node.children && node.children.length) {
            expandedKeys.push(node.code);
            getExpandCode(node.children, expandedKeys);
          }
        }
        yield put({type: 'update', payload: {trees, units, selectUnitKeys: {}, selectTreeKeys: [], expandedKeys}});
      }
    },

    * saveRelation(_, {call, put, select}) {
      const {currentFunctionCode, trees} = yield select(state => state.adminCompetency);
      const data = [];
      for (const node of trees) {
        data.push({
          orgCode: node.code,
          orgName: node.name,
          isRoot: 1,
          refOrgCode: '',
        });
        if (node.children && node.children.length) getChildrenData(node.children, node.code, data);
      }
      const params = {
        type: currentFunctionCode,
        data: data.length === 0 ? null : data,
      }
      const {code} = yield call(fetchCompetencySaveRelation, params);
      if (code === 200) {
        message.success('保存成功');
      } else {
        message.error('保存失败');
      }
    },
  },
  reducers: {
    moveToRight(state) {
      const {units: srcUnits, trees, selectUnitKeys, selectedKeys, expandedKeys} = state;
      const units = [];
      for (const unit of srcUnits) {
        const {code} = unit;
        if (selectUnitKeys[code]) {
          if (selectedKeys.length) {
            const result = getTreeByCode(trees, selectedKeys[0]) || [];
            const tree = result.length ? result[0] : null;
            // eslint-disable-next-line no-throw-literal
            if (!tree) throw '没有找到对应的数据';
            if (!tree.children) tree.children = [];
            tree.children.push(unit);
            expandedKeys.push(tree.code);
          } else {
            trees.push(unit);
          }
          selectUnitKeys[code] = false;
        } else {
          units.push(unit);
        }
      }
      return {...state, units, trees, selectUnitKeys, expandedKeys: Array.from(new Set(expandedKeys))};
    },
    moveToLeft(state, {payload = {}}) {
      const {type} = payload;
      const {units, trees, selectTreeKeys, expandedKeys, selectedKeys} = state;
      const unitResult = [];
      for (const key of selectTreeKeys) {
        for (let i = expandedKeys.length - 1; i >= 0; i--) {
          if (expandedKeys[i] === key) expandedKeys.splice(i, 1);
        }
        for (let i = selectedKeys.length - 1; i >= 0; i--) {
          if (selectedKeys[i] === key) selectedKeys.splice(i, 1);
        }
      }
      if (type === 'all') {
        getNodeByCode(trees, '', unitResult, type);
      } else {
        for (const key of selectTreeKeys) {
          getNodeByCode(trees, key, unitResult);
        }
      }
      const treeResult = trees.filter((node) => {
        if (type === 'all') return false;
        return filterTree(node, selectTreeKeys);
      });
      moveNodeByCode(trees, selectTreeKeys);
      // eslint-disable-next-line max-len
      return {
        ...state,
        units: [...units, ...unitResult],
        selectedKeys,
        expandedKeys,
        trees: [...treeResult],
        selectTreeKeys: [],
      };
    },
    update(state, {payload = {}}) {
      return {...state, ...payload};
    },
  },
};
