import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep'
import {message} from '@vadp/ui';

import {
  fetchTreeOrganQueryList,
  fetchTreeDepartQueryList,
  fetchTreeEntityDeptQueryList,
  fetchTreeVirtualMemberQueryList,
  fetchTreeQueryTreatGroupList,
  fetchTreeSave,
  saveOrUpdateByTree,
  fetchTreeQueryRightTreeList,
  fetchTreeVirtualMemberSave,
  fetchQueryCheckRule,
  fetchQuerySnowId,
  deleteVirtualMember,
  importVirtualTree,
  exportVirtualTree,
  fetchGetNodeIdList,
  queryIsExistVirtualMember,
} from '../services/api';

function filterTree(node = {}, nodeKeys = []) {
  const {id} = node;
  for (const key of nodeKeys) {
    if (key === id) {
      return false;
    }
  }
  return true;
}
function filterRightTree(node = {}, nodeKeys = []) {
  const {id} = node;
  for (const key of nodeKeys) {
    if (key === String(id)) {
      return false;
    }
  }
  return true;
}
function moveNodeByCode(entityDeptTrees = [], selectedKeys = []) {
  for (let i = entityDeptTrees.length - 1; i >= 0; i--) {
    const node = entityDeptTrees[i];
    for (const key of selectedKeys) {
      if (key === String(node.id)) entityDeptTrees.splice(i, 1);
      if (node.children && node.children.length) moveNodeByCode(node.children, selectedKeys);
    }
  }
}
function entityDeptMoveNodeByCode(entityDeptTrees = [], selectedKeys = []) {
  for (let i = entityDeptTrees.length - 1; i >= 0; i--) {
    const node = entityDeptTrees[i];
    for (const key of selectedKeys) {
      // if (key === node.code) entityDeptTrees.splice(i, 1);
      // if (node.children && node.children.length) entityDeptMoveNodeByCode(node.children, selectedKeys);
    }
  }
}
function getNodeByCode(nodeList = [], code = '', result = []) {
  for (const node of nodeList) {
      if (String(node.id) === code) {
        result.push({...node, children: []});
      } else if (node.children && node.children.length) {
        getNodeByCode(node.children, code, result);
      }

  }
}
function getEntityDeptNodeByCode(nodeList = [], code = '', result = []) {
  for (let i = nodeList.length - 1; i >= 0; i--) {
    const node = nodeList[i];
      if (node.code === code) {
        result.push({...node, children: []});
      } else if (node.children && node.children.length) {
        getEntityDeptNodeByCode(node.children, code, result);
      }
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
function getRightTreeExpandCode(nodeList = [], expandedRightKeys = []) {
  for (const node of nodeList) {
    if (node.children && node.children.length) {
      expandedRightKeys.push(node.code);
      getRightTreeExpandCode(node.children, expandedRightKeys);
    }
  }
}
function getTreeByCode(rightTrees = [], code = '', resultList = []) {
  for (const tree of rightTrees) {
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
  departmentList: [],
  organList: [],
  currentFunctionCode: '',
  currentFunctionTitle: '',
  units: [],
  treatGroupUnits: [],
  virtualMembersUnits: [],
  entityDeptTrees: [],
  rightTrees: [],
  selectUnitKeys: {},
  selectTreeKeys: [],
  selectRightTreeKeys: [],
  expandedKeys: [],
  expandedRightKeys: [],
  selectedKeys: [],
  nodeType: '1',
  compCode: '',
  num: '',
  typeCode: '',
  codeOrName: '',
  snowId: '',
  rightTreeCodeOrName: '',
  checkRules: [],

  sceneCode:-2,
  validationRules:[],
  category:'1', //1:实体部门，2:虚拟成员，3：诊疗组
  entityDepartmentList:[],
  virtualMemberList:[],
  treatmentList:[],

  virtualTree:[],

  currentEntityDepartmentElementList:[],
  importModalVisible: false,
  importFileList: [],
  importErrorList: [],
  importLoading: false,
  exportLoading: false,
}
export default {
  namespace: 'adminTree',
  state: {...initialState},
  effects: {
   
    * queryIsExistVirtualMember({payload,callback}, {call, put, select}) {
      let formData = new FormData();
      formData.append('memberCode', payload.memberCode);
      formData.append('sceneCode', payload.sceneCode);
      const res = yield call(queryIsExistVirtualMember, formData);
      if (callback && typeof callback === 'function'){
        callback(res);
      }
    },
    * fetchGetNodeIdList({payload,callback}, {call, put, select}) {
        const {tableName1,generateNum, tableName2 = ''} = payload;
        const params = {
          tableName1: tableName1,
          generateNum: generateNum,
        };
        if(tableName2) {
          params.tableName2 = tableName2
        }
        const res = yield call(fetchGetNodeIdList, params);
        if (callback && typeof callback === 'function'){
          callback(res);
        }
      },
    * fetchOrganList(_, {call, put}) {
       const {code, data: organList} = yield call(fetchTreeOrganQueryList);
       if (code === 200) {
          yield put({type: 'update', payload: {organList}});
        }
      },
    * fetchDepartList(_, {call, put}) {
        const {code, data: departmentList} = yield call(fetchTreeDepartQueryList);
        if (code === 200) {
        yield put({type: 'update', payload: {departmentList}});
        }
      },
    * fetchEntityDeptList({payload,callback}, {call, put, select}) {
      const {hospital,departmentType,enable,searchText} = payload;
      const params = {
        compCode: hospital,
        typeCode: departmentType,
        codeOrName: searchText,
        isStop:enable ? '0' : '1'
      };
      const {code, data} = yield call(fetchTreeEntityDeptQueryList, params);
      if (code === 200) {
        const entityDepartmentList = data;

        let currentEntityDepartmentElementList = [];
        if(entityDepartmentList.length > 0){
          const loop = (data) => data.map((item) => {
            let objItem = {
              nodeId:item.nodeId.toString(),
              nodeType:item.nodeType,
              name:item.name,
              typeCode:item.typeCode,
              id:item.id,
              superId:item.superId,
              code: item.code,
              compCode: item.compCode,
              disableCheckbox: item.disableCheckbox,
              superCode:item.superCode,
              isStop: item.isStop,
            }
            currentEntityDepartmentElementList.push(objItem);
            if (item.children && item.children.length > 0)
              loop(item.children);
          });
          loop(entityDepartmentList);
        }
        yield put({type: 'update', payload: {entityDepartmentList,currentEntityDepartmentElementList}});
        if (callback && typeof callback === 'function'){
          callback(entityDepartmentList);//返回response中的该条信息详细数据
        }
      }
    },
    * fetchVirtualMemberList({payload = {},callback}, {call, put, select}) {
      const {hospital,departmentType,enable,searchText} = payload;
      const params = {
        compCode: hospital,
        typeCode: departmentType,
        codeOrName: searchText,
        isStop:enable ? '1' : '0'
      };
      const {code, data} = yield call(fetchTreeVirtualMemberQueryList, params);
      if (code === 200) {
        const virtualMemberList = data;
        yield put({type: 'update', payload: { virtualMemberList }});
      }
    },
    * fetchTreatGroupList({payload = {},callback}, {call, put, select}){
      const params = {
        codeOrName: ''
      };
      const {code, data} = yield call(fetchTreeQueryTreatGroupList, params);
      if (code === 200) {
        const  treatGroupUnits = data;
        const treatmentList = data;
        yield put({type: 'update', payload: { treatmentList,treatGroupUnits, selectUnitKeys: {}, selectTreeKeys: [],}});
      }
    },
    * fetchRightTreeList({payload,callback}, {call, put, select}) {
      const newSceneCode = payload.sceneCode;
      if(newSceneCode == '' || newSceneCode < 0){
        message.warning('未获取到场景编码，后续操作可能会失效！');
        //return;
      }
      yield put({type: 'update', payload: {newSceneCode}});
      const params = {
        sceneCode: newSceneCode,
        codeOrName: payload.searchText ? payload.searchText:'',//payload.searchText,
      }
      const res = yield call(fetchTreeQueryRightTreeList, params);
      if (res.code === 200) {
        if (callback && typeof callback === 'function'){
          callback(res);
        } else {
          const virtualTree = res.data;
          yield put({type: 'update', payload: {virtualTree}});
        } 
      }
    },

    * deleteVirtualMember({payload,callback}, {call, put, select}) {
      const newSceneCode = payload.sceneCode;
      if(newSceneCode == '' || newSceneCode < 0){
        message.warning('未获取到场景编码，后续操作可能会失效！');
        //return;
      }
     // yield put({type: 'update', payload: {newSceneCode}});
      const params = {
        sceneCode: newSceneCode,
        nodeId: payload.nodeId,
      }
      const data = yield call(deleteVirtualMember, params);
      if (data.code === 200) {
        const virtualTree = data.data;
        if (callback && typeof callback === 'function'){
          callback(data); //返回response中的该条信息详细数据
        } else {
          yield put({type: 'update', payload: {virtualTree}});
        }
       
      }
    },

    * fetchQueryCheckRule({payload = {},callback}, {call, put, select}) {
      const adminTree = yield select(state => state.adminTree);
      const {sceneCode} = adminTree;
      const params = {
        sceneCode: sceneCode,
      }
      const {code, data} = yield call(fetchQueryCheckRule, params);
      if (code === 200) {
        const validationRules = data;
        yield put({type: 'update', payload: {validationRules}});
      }
    },
    * fetchQuerySnowId({payload = {payload},callback}, {call, put, select}) {
      // const adminTree = yield select(state => state.adminTree);
      // const {rightTreeCodeOrName} = adminTree;
      const params = {
        num: payload.num,
      }
      // const {code, result} = yield call(fetchQuerySnowId, params);
      const data = yield call(fetchQuerySnowId, params);
      if (callback && typeof callback === 'function'){
        callback(data);//返回response中的该条信息详细数据
      }
      // if (code === 200) {
      //   const snowId = result.ids;
      //   yield put({type: 'update', payload: {snowId}});
      // }
    },

    * saveOrUpdateByTree({payload,callback}, {call, put, select}) {
      if(payload.sceneCode == '' || payload.sceneCode < 0){
        message.error('未获取到场景编码，不能保存！');
        return;
      }
      const params = {
        sceneCode: payload.sceneCode,
        data: payload.data,
        deleteDatas: payload.deleteDatas,
      }
      const response = yield call(saveOrUpdateByTree, params);
      if (callback && typeof callback === 'function'){
        callback(response);
      }
    },
    * fetchTreeSave({payload,callback}, {call, put, select}) {
      if(payload.sceneCode == '' || payload.sceneCode < 0){
        message.error('未获取到场景编码，不能保存！');
        return;
      }
      const params = {
        sceneCode: payload.sceneCode,
        data: payload.data,
      }
      const {code} = yield call(fetchTreeSave, params);
      if (code === 200) {
        message.success('保存成功');
      } else {
        message.error('保存失败');
      }
    },
    * fetchVirtualMemberSave({payload = {},callback}, {call, put, select}) {
      const params = {
        data: payload.hasOwnProperty('parameters') ? payload.parameters : null,
      }
      const response = yield call(fetchTreeVirtualMemberSave, params);
      // const {code} = response;
      // const errorMessage = response.message;
      // if (code === 200) {
      //   message.success('保存成功');
      //   // if(payload.criterion != undefined){
      //   //   const newPayload = payload.criterion;
      //   //   const criterionParams = {
      //   //     compCode: newPayload.hospital,
      //   //     typeCode: newPayload.departmentType,
      //   //   };
      //   //   const objVirtualMember = yield call(fetchTreeVirtualMemberQueryList, criterionParams);
      //   //   if (objVirtualMember.code === 200) {
      //   //     const virtualMemberList = objVirtualMember.data;
      //   //     yield put({type: 'update', payload: { virtualMemberList }});
      //   //   }
      //   // }
      // } else {
      //   message.error('保存失败,原因：'+errorMessage);
      // }
      if (callback && typeof callback === 'function'){
        callback(response);
      }
    },

    //wangzhenqiang 20200825
    * importVirtualTree({payload,callback}, {call, put, select}) {
      const {formData, uid} = payload;
      yield put({type: 'update', payload: {importLoading: true}});
      if (callback && typeof callback === 'function'){
        const response = yield call(importVirtualTree, formData);
        callback(response)
      } else {
        const {importFileList} = yield select(state => state.adminUser);
        const {code, result = {}, message: errorMessage} = yield call(importVirtualTree, formData);
        if (code === 200) {
          const {sucessNum = 0, failNum = 0, list = []} = result;
          message.success(`成功导入${sucessNum}条数据!`)
          for (const file of importFileList) {
            if (file.uid === uid) file.status = 'done';
          }
          yield put({type: 'update', payload: {importFileList: [...importFileList], importErrorList: []}});
          if (failNum !== 0) {
            yield put({type: 'update', payload: {importErrorList: list}});
          }
        } else {
          message.error(errorMessage || '导入虚拟成员失败!');
          const {list = []} = result;
          for (const file of importFileList) {
            if (file.uid === uid) file.status = 'error';
          }
          yield put({type: 'update', payload: {importErrorList: list, importFileList: [...importFileList]}});
        }
        yield put({type: 'update', payload: {importLoading: false}});
      }
    },

    * exportVirtualTree({payload}, {call, select, put}) {
      const params = {
        sceneCode: payload.sceneCode,
      }
      yield put({type: 'update', payload: {exportLoading: true}});
      const response = yield call(exportVirtualTree, params);
      const blob = new Blob([response], {type: 'application/vnd.ms-excel'});
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        window.navigator.msSaveOrOpenBlob(blob, 'sys_virtual_member.xlsx');
      } else {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'sys_virtual_member.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      yield put({type: 'update', payload: {exportLoading: false}});
    },
  },
  reducers: {
    entityDeptMoveToRight(state, {payload = {}}) {
      const {type} = payload;
      const {rightTrees, entityDeptTrees, selectTreeKeys, expandedKeys, selectedKeys,snowId} = state;
      const unitResult = [];
      const snowRow= snowId.split(",");
      let totalNum = snowRow.length;
      for (const key of selectTreeKeys) {
        for (let i = expandedKeys.length - 1; i >= 0; i--) {
          if (expandedKeys[i] === key) expandedKeys.splice(i, 1);
        }
        for (let i = selectedKeys.length - 1; i >= 0; i--) {
          if (selectedKeys[i] === key) selectedKeys.splice(i, 1);
        }
      }
        for (const key of selectTreeKeys) {
          getEntityDeptNodeByCode(entityDeptTrees, key, unitResult,snowRow,totalNum);
        }

      for (let i = unitResult.length - 1; i >= 0; i--) {
        unitResult[i].id = snowRow[i];
      }
      const treeResult = entityDeptTrees.filter((node) => {
        return filterTree(node, selectTreeKeys);
      });
      entityDeptMoveNodeByCode(entityDeptTrees, selectTreeKeys);
      // eslint-disable-next-line max-len
      return {
        ...state,
        rightTrees: [...rightTrees, ...unitResult],
        selectedKeys,
        expandedKeys,
        entityDeptTrees: [...treeResult],
        selectTreeKeys: [],
      };
    },
    entityDeptMoveToLeft(state, {payload = {}}) {
      const {type} = payload;
      const {nodeType,units, entityDeptTrees, selectTreeKeys, expandedKeys, selectedKeys} = state;
      const unitResult = [];
      for (const key of selectTreeKeys) {
        for (let i = expandedKeys.length - 1; i >= 0; i--) {
          if (expandedKeys[i] === key) expandedKeys.splice(i, 1);
        }
        for (let i = selectedKeys.length - 1; i >= 0; i--) {
          if (selectedKeys[i] === key) selectedKeys.splice(i, 1);
        }
      }
        for (const key of selectTreeKeys) {
          getNodeByCode(entityDeptTrees, key, unitResult);
        }
      const treeResult = entityDeptTrees.filter((node) => {
        return filterTree(node, selectTreeKeys);
      });
      moveNodeByCode(entityDeptTrees, selectTreeKeys);
      // eslint-disable-next-line max-len
      return {
        ...state,
        units: [...units, ...unitResult],
        selectedKeys,
        expandedKeys,
        entityDeptTrees: [...treeResult],
        selectTreeKeys: [],
      };
    },

    treatGroupMoveToRight(state) {
      const {treatGroupUnits:srcUnits,rightTrees,selectUnitKeys,selectTreeKeys,expandedRightKeys,snowId} = state;
      // const treatGroupUnits = [];
      let snowRow= snowId.split(",");
      let totalNum = snowRow.length;
      for (const unit of srcUnits) {
        const {code} = unit;
        if (selectUnitKeys[code]) {
          if (selectTreeKeys.length) {
            const result = getTreeByCode(rightTrees, selectTreeKeys[0]) || [];
            const tree = result.length ? result[0] : null;
            // eslint-disable-next-line no-throw-literal
            if (!tree) throw '没有找到对应的数据';
            if (!tree.children) tree.children = [];
            tree.children.push(unit);
            expandedRightKeys.push(tree.code);
          } else {
            totalNum --;
            unit.id = snowRow[totalNum];
            rightTrees.push(unit);
          }
          selectUnitKeys[code] = false;
        } else {
          // treatGroupUnits.push(unit);
        }
      }
      return {...state, rightTrees, selectUnitKeys, expandedRightKeys: Array.from(new Set(expandedRightKeys))};
    },
    treatGroupMoveToLeft(state, {payload = {}}) {
      const {type} = payload;
      const {treatGroupUnits, rightTrees, selectTreeKeys, expandedRightKeys, selectedKeys} = state;
      const unitResult = [];

      for (const key of selectTreeKeys) {
        for (let i = expandedRightKeys.length - 1; i >= 0; i--) {
          if (expandedRightKeys[i] === key) expandedRightKeys.splice(i, 1);
        }
        for (let i = selectTreeKeys.length - 1; i >= 0; i--) {
          if (selectTreeKeys[i] === key) selectTreeKeys.splice(i, 1);
        }
      }
        for (const key of selectTreeKeys) {
          getNodeByCode(rightTrees, key, unitResult);
        }

      const treeResult = treatGroupUnits.filter((node) => {
        return filterTree(node, selectTreeKeys);
      });
      moveNodeByCode(rightTrees, selectTreeKeys);
      // eslint-disable-next-line max-len
      return {
        ...state,
        treatGroupUnits: [...treatGroupUnits, ...unitResult],
        selectedKeys,
        selectTreeKeys,
        expandedRightKeys,
        rightTrees: [...treeResult],
        selectTreeKeys: [],
      };
    },

    virtualMembersMoveToRight(state) {
      const {virtualMembersUnits:srcUnits,rightTrees,selectUnitKeys,selectTreeKeys,expandedRightKeys,snowId} = state;
      let snowRow= snowId.split(",");
      let totalNum = snowRow.length;
      for (const unit of srcUnits) {
        const {code} = unit;
        if (selectUnitKeys[code]) {
          if (selectTreeKeys.length) {
            const result = getTreeByCode(rightTrees, selectTreeKeys[0]) || [];
            const tree = result.length ? result[0] : null;
            // eslint-disable-next-line no-throw-literal
            if (!tree) throw '没有找到对应的数据';
            if (!tree.children) tree.children = [];
            tree.children.push(unit);
            expandedRightKeys.push(tree.code);
          } else {
            totalNum --;
           unit.id = snowRow[totalNum];
            rightTrees.push(unit);

          }
          selectUnitKeys[code] = false;
        } else {
         // virtualMembersUnits.push(unit);
        }
      }
      return {...state, rightTrees, selectUnitKeys, expandedRightKeys: Array.from(new Set(expandedRightKeys))};
    },
    virtualMembersMoveToLeft(state, {payload = {}}) {
      const {type} = payload;
      const {virtualMembersUnits, rightTrees, selectTreeKeys, expandedRightKeys, selectedKeys} = state;
      const unitResult = [];

      for (const key of selectTreeKeys) {
        for (let i = expandedRightKeys.length - 1; i >= 0; i--) {
          if (expandedRightKeys[i] === key) expandedRightKeys.splice(i, 1);
        }
        for (let i = selectTreeKeys.length - 1; i >= 0; i--) {
          if (selectTreeKeys[i] === key) selectTreeKeys.splice(i, 1);
        }
      }
        for (const key of selectTreeKeys) {
          getNodeByCode(rightTrees, key, unitResult);
        }
      const treeResult = virtualMembersUnits.filter((node) => {
        return filterTree(node, selectTreeKeys);
      });
      moveNodeByCode(rightTrees, selectTreeKeys);
      // eslint-disable-next-line max-len
      return {
        ...state,
        virtualMembersUnits: [...virtualMembersUnits, ...unitResult],
        selectedKeys,
        selectTreeKeys,
        expandedRightKeys,
        rightTrees: [...treeResult],
        selectTreeKeys: [],
      };
    },

    moveToRight(state, {payload = {}}) {
      const {type} = payload;
      const {nodeType,rightTrees, entityDeptTrees, selectTreeKeys, expandedKeys, selectedKeys} = state;
      const unitResult = [];
      for (const key of selectTreeKeys) {
        for (let i = expandedKeys.length - 1; i >= 0; i--) {
          if (expandedKeys[i] === key) expandedKeys.splice(i, 1);
        }
        for (let i = selectedKeys.length - 1; i >= 0; i--) {
          if (selectedKeys[i] === key) selectedKeys.splice(i, 1);
        }
      }
        for (const key of selectTreeKeys) {
          getNodeByCode(rightTrees, key, unitResult);

        }

      const treeResult = rightTrees.filter((node) => {
        return filterRightTree(node, selectTreeKeys);
      });
      moveNodeByCode(rightTrees, selectTreeKeys);
      // eslint-disable-next-line max-len
      return {
        ...state,
        selectedKeys,
        expandedKeys,
        rightTrees: [...treeResult],
        selectTreeKeys: [],
      };
    },

    update(state, {payload = {}}) {
      return {...state, ...payload};
    },
  },
};