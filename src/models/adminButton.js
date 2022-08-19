/**
 * Created by huangzhangshu on 2018/4/17
 */
import {message} from '@vadp/ui';
import cloneDeep from 'lodash/cloneDeep';
import {
  fetchAuthorForUser,
  fetchAuthorRoles,
  fetchAuthorForUnit,
  fetchDomainAll,
  fetchAuthorForCopy,
  fetchCopys,
  fetchAuthorForMod,
  fetchMods,
  fetchButtonSource,
  fetchButtonSourceByRole,
  fetchButtonDefinedSource,
  fetchButtonDefinedSourceByRole,
  saveAuthor,
  saveAuthorByRole, fetchUnits,
} from '../services/api';

const initialState = {
  users: [],
  mods: [],
  copys: [],
  units: [],
  dataSource: [],
  resource: [],
  resourceIds: [],
  selectedRowKeys: [],
  expandedRowKeys: [],
  userValue: '',
  unitValue: '',
  modValue: '',
  copyValue: '',
  filterValue: '',
  filterInputText: '',
  tableKey: Date.now().toString(),
};

export default {
  namespace: 'adminButton',
  state: {...initialState, roleState: {...initialState, roles: [], roleValue: ''}},
  effects: {

    * fetchUsers(_, {put, call}) {
      const {code, users} = yield call(fetchAuthorForUser);
      if (code === 200) {
        yield put({type: 'update', payload: {users}});
      }
    },

    * fetchRoles(_, {put, call, select}){
      const {currentUser: {account}} = yield select(state => state.user);
      const {code, result: roles} = yield call(fetchAuthorRoles, {account});
      if (code === 200) {
        yield put({type: 'updateRoleState', payload: {roles}});
      }
    },

    * fetchUnits(_, {put, call, select}) {
      const {userValue: userCode} = yield select(state => state.adminButton);
      const {code, units} = yield call(fetchAuthorForUnit, {userCode});
      if (code === 200) {
        yield put({type: 'update', payload: {units}});
      }
    },

    * fetchUnitsByRole(_, {put, call, select}) {
      const currentUnit = yield select(state => state.global.currentUnit);
      const currentUser = yield select(state => state.user.currentUser);
      let response = {};
      if (currentUser.account === 'admin') {
        response = yield call(fetchDomainAll);
      } else {
        const params = {
          code: currentUnit.code,
        };
        response = yield call(fetchUnits, params);
      }
      const {code, units} = response;
      if (code === 200) {
        yield put({type: 'updateRoleState', payload: {units}});
      }
    },

    * fetchCopys(_, {put, call, select}) {
      const {userValue: userCode, unitValue: compCode} = yield select(state => state.adminButton);
      const {code, result: copys} = yield call(fetchAuthorForCopy, {userCode, compCode});
      if (code === 200) {
        yield put({type: 'update', payload: {copys}});
      }
    },

    * fetchCopysByRole(_, {put, call, select}) {
      const {unitValue: compCode} = yield select(state => state.adminButton.roleState);
      const {code, result: copys} = yield call(fetchCopys, {compCode});
      if (code === 200) {
        yield put({type: 'updateRoleState', payload: {copys}});
      }
    },

    * fetchMods(_, {put, call, select}) {
      const {userValue: userCode = '', unitValue: compCode = '', copyValue: copyCode = ''} = yield select(state => state.adminButton);
      const {code, apps: mods} = yield call(fetchAuthorForMod, {userCode, compCode, copyCode});
      if (code === 200) {
        yield put({type: 'update', payload: {mods}});
      }
    },

    * fetchModsByRole(_, {put, call, select}) {
      const currentUser = yield select(state => state.user.currentUser);
      const {unitValue: compCode = '', copyValue: copyCode = ''} = yield select(state => state.adminButton.roleState);
      const params = {
        compCode,
        copyCode,
        account: currentUser.account || '',
      };
      const {code, mods} = yield call(fetchMods, params);
      if (code === 200) {
        yield put({type: 'updateRoleState', payload: {mods}});
      }
    },

    * fetchSource(_, {put, call, select}) {
      const {userValue: userCode, unitValue: compCode, copyValue: copyCode, modValue: modCode} = yield select(state => state.adminButton);
      const {code, authorMenus: resource} = yield call(fetchButtonSource, {userCode, compCode, copyCode, modCode});
      if (code === 200) {
        yield put({type: 'update', payload: {resource}});
        const selectedRowKeys = [];
        const resourceIds = [];
        for (const source of resource) {
          const {id} = source;
          selectedRowKeys.push(id);
          resourceIds.push(id);
        }
        yield put({type: 'update', payload: {selectedRowKeys, resourceIds}});
      }
    },

    * fetchSourceByRole(_, {put, call, select}) {
      const {roleValue: roleCode = '', unitValue: compCode = '', copyValue: copyCode = '', modValue: modCode = ''} = yield select(state => state.adminButton.roleState);
      const {code, authorMenus: resource} = yield call(fetchButtonSourceByRole, {roleCode, compCode, copyCode, modCode});
      if (code === 200) {
        yield put({type: 'updateRoleState', payload: {resource}});
        const selectedRowKeys = [];
        const resourceIds = [];
        for (const source of resource) {
          const {id} = source;
          selectedRowKeys.push(id);
          resourceIds.push(id);
        }
        yield put({type: 'updateRoleState', payload: {selectedRowKeys, resourceIds}});
      }
    },

    * fetchDefinedSource(_, {put, call, select}) {
      const {userValue: userCode, unitValue: compCode, copyValue: copyCode, modValue: modCode} = yield select(state => state.adminButton);
      const {code, authorMenus: dataSource} = yield call(fetchButtonDefinedSource, {
        userCode,
        compCode,
        copyCode,
        modCode,
      });
      if (code === 200) {
        const expandedRowKeys = [];
        for (const source of dataSource) {
          const {id} = source;
          expandedRowKeys.push(id);
        }
        yield put({type: 'update', payload: {dataSource, expandedRowKeys, tableKey: Date.now().toString(), filterValue: '', filterInputText: ''}});
        yield put({type: 'fetchSource'});
      }
    },

    * fetchDefinedSourceByRole(_, {put, call, select}) {
      const {roleValue: roleCode = '', unitValue: compCode = '', copyValue: copyCode = '', modValue: modCode = ''} = yield select(state => state.adminButton.roleState);
      const {code, authorMenus: dataSource} = yield call(fetchButtonDefinedSourceByRole, {
        roleCode,
        compCode,
        copyCode,
        modCode,
      });
      if (code === 200) {
        const expandedRowKeys = [];
        for (const source of dataSource) {
          const {id} = source;
          expandedRowKeys.push(id);
        }
        yield put({type: 'updateRoleState', payload: {dataSource, expandedRowKeys}});
        yield put({type: 'fetchSourceByRole'});
      }
    },

    * saveButton(_, {call, put, select}) {
      const {userValue, unitValue, copyValue, modValue, resourceIds, selectedRowKeys, mods} = yield select(state => state.adminButton);
      const addKeys = [];
      const delKeys = [];
      let addList = '';
      let delList = '';
      if (selectedRowKeys.sort().equals(resourceIds.sort())) {
        message.warn('数据项未发生变化');
        return;
      }
      for (const key of selectedRowKeys) {
        let isParent = false;
        for (const mod of mods) {
          if (key === mod.id) {
            isParent = true;
          }
        }
        if (isParent) continue;
        let isContain = false;
        for (const resource of resourceIds) {
          if (resource === key) isContain = true;
        }
        if (!isContain)
          addKeys.push(key);
      }
      for (const resource of resourceIds) {
        let isContain = false;
        for (const key of selectedRowKeys) {
          if (key === resource) isContain = true;
        }
        if (!isContain)
          delKeys.push(resource);
      }
      for (let i = 0; i < addKeys.length; i++) {
        addList = addList.concat(addKeys[i]);
        if (i !== addKeys.length - 1) addList = addList.concat(',');
      }
      for (let i = 0; i < delKeys.length; i++) {
        delList = delList.concat(delKeys[i]);
        if (i !== delKeys.length - 1) delList = delList.concat(',');
      }
      const params = {
        account: userValue,
        addList,
        delList,
        user_code: userValue,
        comp_code: unitValue,
        copy_code: copyValue,
        mod_code: modValue,
      };
      const {code, message: errorMessage} = yield call(saveAuthor, params);
      if (code === 200) {
        message.success('保存成功');
        yield put({type: 'fetchDefinedSource'});
      } else {
        message.error(errorMessage);
      }
    },

    * saveButtonByRole(_, {call, put, select}) {
      const {roleValue, unitValue, copyValue, modValue, resourceIds, selectedRowKeys, mods} = yield select(state => state.adminButton.roleState);
      const addKeys = [];
      const delKeys = [];
      let addList = '';
      let delList = '';
      if (selectedRowKeys.sort().equals(resourceIds.sort())) {
        message.warn('数据项未发生变化');
        return;
      }
      for (const key of selectedRowKeys) {
        let isParent = false;
        for (const mod of mods) {
          if (key === mod.id) {
            isParent = true;
          }
        }
        if (isParent) continue;
        let isContain = false;
        for (const resource of resourceIds) {
          if (resource === key) isContain = true;
        }
        if (!isContain) addKeys.push(key);
      }
      for (const resource of resourceIds) {
        let isContain = false;
        for (const key of selectedRowKeys) {
          if (key === resource) isContain = true;
        }
        if (!isContain) delKeys.push(resource);
      }
      for (let i = 0; i < addKeys.length; i++) {
        addList = addList.concat(addKeys[i]);
        if (i !== addKeys.length - 1) addList = addList.concat(',');
      }
      for (let i = 0; i < delKeys.length; i++) {
        delList = delList.concat(delKeys[i]);
        if (i !== delKeys.length - 1) delList = delList.concat(',');
      }
      const params = {
        // account: userValue,
        addList,
        delList,
        role_code: roleValue,
        comp_code: unitValue,
        copy_code: copyValue,
        mod_code: modValue,
      };
      const {code, message: errorMessage} = yield call(saveAuthorByRole, params);
      if (code === 200) {
        message.success('保存成功');
        yield put({type: 'fetchDefinedSourceByRole'});
      } else {
        message.error(errorMessage);
      }
    },
  },
  reducers: {
    resetState(state) {
      const {roleState} = state;
      return {...cloneDeep(initialState), roleState};
    },
    resetRoleState(state) {
      return {...state, roleState: {...initialState, roles: [], roleValue: ''}};
    },
    updateSearchValue(state, {payload}) {
      const {searchValue} = state;
      return {...state, searchValue: {...searchValue, ...payload}};
    },
    updateTableSearchValue(state, {payload}) {
      const {tableSearchValue} = state;
      return {...state, tableSearchValue: {...tableSearchValue, ...payload}};
    },
    updateRoleSearchValue(state, {payload}) {
      const {roleSearchValue} = state;
      return {...state, roleSearchValue: {...roleSearchValue, ...payload}};
    },
    updateRoleTableSearchValue(state, {payload}) {
      const {roleTableSearchValue} = state;
      return {...state, roleTableSearchValue: {...roleTableSearchValue, ...payload}};
    },
    updateAuthorMenu(state, {payload}) {
      return {...state, authorMenus: payload};
    },
    updateAuthorResource(state, {payload}) {
      return {...state, authorResource: payload};
    },
    updateKeys(state, {payload}) {
      return {...state, selectedRowKeys: payload};
    },
    updateRoleState(state, {payload = {}}){
      const {roleState} = state;
      return {...state, roleState: {...roleState, ...payload}};
    },
    update(state, {payload = {}}) {
      return {...state, ...payload};
    },
  },
};
