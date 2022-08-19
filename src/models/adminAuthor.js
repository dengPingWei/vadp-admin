/**
 * Created by huangzhangshu on 2018/4/17
 */
import {message} from '@vadp/ui';
import cloneDeep from 'lodash/cloneDeep';
import {
  fetchAuthorRoles,
  fetchDomainAll,
  fetchMods,
  fetchCopys,
  fetchAuthorMenus,
  fetchAuthorResource,
  fetchAuthorUsers,
  fetchAuthorUsersPage,
  saveAuthor,
  fetchAuthorUserTable,
  fetchAuthorResourceByRole,
  saveAuthorByRole,
  fetchAuthorUserTableByRole, fetchUnits,
} from '../services/api';
import AuthorTypes from '../common/AuthorTypes';

// Warn if overriding existing method
if (Array.prototype.equals){
  console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
    return false;
  // compare lengths - can save a lot of time
  if (this.length != array.length)
    return false;
  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i]))
        return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

const initialSearchValue = {
  user: [],
  unit: [],
  mods: [],
  copys: [],
  userValue: '',
  unitValue: '',
  modValue: '',
  copyValue: '',
  authorMenus: [],
  selectedRowKeys: [],
  authorResource: [],
  expandedRowKeys: [],
  userPageSize: 100,
  userPageNum: 1,
  userRecordCount: 0,
  userSearchKey: '',
  selectedValue: '',
  userFetching: false,
};

const initialTableSearchValue = {
  user: [],
  unit: [],
  mods: [],
  copys: [],
  userValue: '',
  unitValue: '',
  modValue: '',
  copyValue: '',
  authorMenus: [],
  tableSize: 'small',
  expandedRowKeys: [],
  userPageSize: 100,
  userPageNum: 1,
  userRecordCount: 0,
  userSearchKey: '',
  selectedValue: '',
  userFetching: false,
};

const initialRoleSearchValue = {
  roles: [],
  unit: [],
  mods: [],
  copys: [],
  userValue: '',
  unitValue: '',
  modValue: '',
  copyValue: '',
  authorMenus: [],
  selectedRowKeys: [],
  authorResource: [],
};

const initialRoleTableSearchValue = {
  roles: [],
  unit: [],
  mods: [],
  copys: [],
  userValue: '',
  unitValue: '',
  modValue: '',
  copyValue: '',
  authorMenus: [],
  tableSize: 'small',
}

const initialState = {
  searchValue: cloneDeep(initialSearchValue),
  tableSearchValue: cloneDeep(initialTableSearchValue),
  roleSearchValue: cloneDeep(initialRoleSearchValue),
  roleTableSearchValue: cloneDeep(initialRoleTableSearchValue),
  pageNum: 1,
  pageSize: 100,
  recordCount: 0,
  userPageNum: 1,
  userPageSize: 100,
  userRecordCount: 0,
  rolePageNum: 1,
  rolePageSize: 100,
  roleRecordCount: 0,
}

export default {
  namespace: 'adminAuthor',
  state: {...initialState},
  effects: {
    * fetchSearchUnit({payload}, {call, put, select}) {
      const currentUnit = yield select(state => state.global.currentUnit);
      const currentUser = yield select(state => state.user.currentUser);
      const {type} = payload;
      let response = {};
      if (currentUser.account === 'admin') {
        response = yield call(fetchDomainAll);
      } else {
        const params = {
          code: currentUnit.code,
        }
        response = yield call(fetchUnits, params);
      }
      const {code, units} = response;
      if (code === 200) {
        if (type === AuthorTypes.USER_AUTHOR) {
          yield put({type: 'updateSearchValue', payload: {unit: units}});
        } else if (type === AuthorTypes.USER_QUERY) {
          yield put({type: 'updateTableSearchValue', payload: {unit: units}});
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {unit: units}});
        } else if (type === AuthorTypes.ROLE_QUERY) {
          yield put({type: 'updateRoleTableSearchValue', payload: {unit: units}});
        }
      }

    },
    * fetchSearchMods({payload}, {call, put, select}) {
      const {type} = payload;
      const adminAuthor = yield select(state => state.adminAuthor);
      let {searchValue} = adminAuthor;
      if (type === AuthorTypes.USER_QUERY) {
        searchValue = adminAuthor.tableSearchValue;
      } else if (type === AuthorTypes.ROLE_AUTHOR) {
        searchValue = adminAuthor.roleSearchValue;
      } else if (type === AuthorTypes.ROLE_QUERY) {
        searchValue = adminAuthor.roleTableSearchValue;
      }
      const currentUser = yield select(state => state.user.currentUser);
      const params = {
        compCode: searchValue.unitValue || '',
        copyCode: searchValue.copyValue || '',
        account: currentUser.account || '',
      }
      const response = yield call(fetchMods, params);
      const {code, mods} = response;
      if (code === 200) {
        if (type === AuthorTypes.USER_AUTHOR) {
          yield put({type: 'updateSearchValue', payload: {mods}});
        } else if (type === AuthorTypes.USER_QUERY) {
          yield put({type: 'updateTableSearchValue', payload: {mods}});
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {mods}});
        } else if (type === AuthorTypes.ROLE_QUERY) {
          yield put({type: 'updateRoleTableSearchValue', payload: {mods}});
        }
      }

    },
    * fetchSearchCopys({payload}, {call, put}) {
      const {type, compCode} = payload;
      const params = {
        compCode,
      }
      const response = yield call(fetchCopys, params);
      const {code, result} = response;
      if (code === 200) {
        if (type === AuthorTypes.USER_AUTHOR) {
          yield put({type: 'updateSearchValue', payload: {copys: result}});
        } else if (type === AuthorTypes.USER_QUERY) {
          yield put({type: 'updateTableSearchValue', payload: {copys: result}});
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {copys: result}});
        } else if (type === AuthorTypes.ROLE_QUERY) {
          yield put({type: 'updateRoleTableSearchValue', payload: {copys: result}});
        }
      }
    },

    * fetchAuthorUsers({payload = {}}, {call, put, select}) {
      const {type, compCode, isReplace = false} = payload;
      const {currentUser} = yield select(state => state.user);
      const adminAuthor = yield select(state => state.adminAuthor);
      let userSearchValue = {};
      if (type === AuthorTypes.USER_AUTHOR) {
        userSearchValue = adminAuthor.searchValue;
        yield put({type: 'updateSearchValue', payload: {userFetching: true}});
      } else if (type === AuthorTypes.USER_QUERY) {
        userSearchValue = adminAuthor.tableSearchValue;
        yield put({type: 'updateTableSearchValue', payload: {userFetching: true}});
      }
      const {userPageNum, userPageSize, userSearchKey, selectedValue, user} = userSearchValue;
      const params = {
        account: currentUser.account,
        compCode,
        pageNum: userPageNum,
        pageSize: userPageSize,
        searchKey: userSearchKey,
        selectedValue,
      }
      const {code, result, recordCount} = yield call(fetchAuthorUsersPage, params);
      if (code === 200) {
        if (type === AuthorTypes.USER_AUTHOR) {
          const userResult = isReplace ? result : user.concat(result);
          yield put({
            type: 'updateSearchValue',
            payload: {user: userResult, userRecordCount: recordCount, userFetching: false},
          });
        } else if (type === AuthorTypes.USER_QUERY) {
          const userResult = isReplace ? result : user.concat(result);
          yield put({
            type: 'updateTableSearchValue',
            payload: {user: userResult, userRecordCount: recordCount, userFetching: false},
          });
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {user: result}});
        } else if (type === AuthorTypes.ROLE_QUERY) {
          yield put({type: 'updateRoleTableSearchValue', payload: {user: result}});
        }
      }
    },

    * fetchAuthorRoles({payload}, {call, put, select}) {
      const {type} = payload;
      const currentUser = yield select(state => state.user.currentUser);
      const params = {
        account: currentUser.account,
      }
      const response = yield call(fetchAuthorRoles, params);
      const {code, result} = response;
      if (code === 200) {
        if (type === AuthorTypes.USER_AUTHOR) {
          yield put({type: 'updateSearchValue', payload: {roles: result}});
        } else if (type === AuthorTypes.USER_QUERY) {
          yield put({type: 'updateTableSearchValue', payload: {roles: result}});
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {roles: result}});
        } else if (type === AuthorTypes.ROLE_QUERY) {
          yield put({type: 'updateRoleTableSearchValue', payload: {roles: result}});
        }
      }
    },

    * fetchAuthorMenus({payload}, {call, put, select}) {
      const {type} = payload;
      let searchValue;
      if (type === AuthorTypes.USER_AUTHOR) {
        searchValue = yield select(state => state.adminAuthor.searchValue);
      } else if (type === AuthorTypes.ROLE_AUTHOR) {
        searchValue = yield select(state => state.adminAuthor.roleSearchValue);
      }
      const {modValue, copyValue, unitValue, mods} = searchValue;
      let parentMod = {};
      for (const mod of mods) {
        if (mod.id === modValue) parentMod = mod;
      }
      const params = {
        mod: modValue || '',
        compCode: unitValue || '',
        copyCode: copyValue || '',
      }
      const response = yield call(fetchAuthorMenus, params);
      let {code, authorMenus} = response;
      authorMenus = authorMenus.filter(menu => menu.id !== undefined && menu.id.trim() !== '');
      const expandSet = new Set();
      for (const menu of authorMenus) {
        if (!menu.parentId || menu.parentId === -1 || menu.parentId === '-1') {
          menu.parentId = parentMod.id;
          expandSet.add(parentMod.id);
        }
        if (menu.parentId && menu.parentId !== -1 && menu.parentId !== '-1') {
          expandSet.add(menu.parentId);
        }
      }
      authorMenus.push({...parentMod, title: parentMod.name, parentId: ''});
      if (code === 200) {
        if (type === AuthorTypes.USER_AUTHOR) {
          yield put({type: 'updateSearchValue', payload: {authorMenus, expandedRowKeys: Array.from(expandSet)}});
          yield put({type: 'update', payload: {authorMenus}});
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {authorMenus, expandedRowKeys: Array.from(expandSet)}});
        }
        yield put({type: 'fetchAuthorResource', payload: {type}});
      }
    },

    * fetchAuthorResource({payload}, {call, put, select}) {
      const {type} = payload;
      let searchValue;
      if (type === AuthorTypes.USER_AUTHOR) {
        searchValue = yield select(state => state.adminAuthor.searchValue);
      } else if (type === AuthorTypes.ROLE_AUTHOR) {
        searchValue = yield select(state => state.adminAuthor.roleSearchValue);
      }
      // eslint-disable-next-line max-len
      const {modValue, copyValue, unitValue, userValue, roleValue, authorMenus: menus} = searchValue;
      let response = {};
      if (type === AuthorTypes.USER_AUTHOR) {
        const params = {
          mod: modValue || '',
          compCode: unitValue || '',
          copyCode: copyValue || '',
          account: userValue || '',
        }
        response = yield call(fetchAuthorResource, params);
      } else if (type === AuthorTypes.ROLE_AUTHOR) {
        const params = {
          mod: modValue || '',
          compCode: unitValue || '',
          copyCode: copyValue || '',
          roleCode: roleValue || '',
        }
        response = yield call(fetchAuthorResourceByRole, params);
      }
      const {code, resource = []} = response;
      if (code === 200) {
        const result = [];
        for (const menu of menus) {
          const {id} = menu;
          if (resource.indexOf(id) !== -1) {
            result.push(id);
          }
        }
        // if (result && result.length > 0) result.push(modValue);
        if (type === AuthorTypes.USER_AUTHOR) {
          yield put({type: 'updateSearchValue', payload: {authorResource: result}});
          yield put({type: 'updateSearchValue', payload: {selectedRowKeys: result}});
        } else if (type === AuthorTypes.ROLE_AUTHOR) {
          yield put({type: 'updateRoleSearchValue', payload: {authorResource: result}});
          yield put({type: 'updateRoleSearchValue', payload: {selectedRowKeys: result}});
        }
      }
    },

    * fetchUserTable(_, {call, put, select}) {
      const adminAuthor = yield select(state => state.adminAuthor);
      const {tableSearchValue} = adminAuthor;
      const {userPageSize, userPageNum} = adminAuthor;
      const {modValue, copyValue, unitValue, userValue} = tableSearchValue;
      const params = {
        mod: modValue || '',
        compCode: unitValue || '',
        copyCode: copyValue || '',
        account: userValue || '',
        pageSize: userPageSize,
        pageNum: userPageNum,
      }
      const response = yield call(fetchAuthorUserTable, params);
      const {code, result, recordCount} = response;
      if (code === 200) {
        yield put({type: 'updateTableSearchValue', payload: {authorMenus: result}});
        yield put({type: 'update', payload: {userRecordCount: recordCount}});
      }
    },

    * fetchRoleTable(_, {call, put, select}) {
      const adminAuthor = yield select(state => state.adminAuthor);
      const tableSearchValue = adminAuthor.roleTableSearchValue;
      const {rolePageSize, rolePageNum} = adminAuthor;
      const {modValue, copyValue, unitValue, roleValue} = tableSearchValue;
      const params = {
        mod: modValue || '',
        compCode: unitValue || '',
        copyCode: copyValue || '',
        roleCode: roleValue || '',
        pageSize: rolePageSize,
        pageNum: rolePageNum,
      }
      const response = yield call(fetchAuthorUserTableByRole, params);
      const {code, result, recordCount} = response;
      if (code === 200) {
        yield put({type: 'updateRoleTableSearchValue', payload: {authorMenus: result}});
        yield put({type: 'update', payload: {roleRecordCount: recordCount}});
      }
    },

    * saveAuthor({payload}, {call, put, select}) {
      const {type} = payload;
      let searchValue = {};
      const author = yield select(state => state.adminAuthor);
      if (type === AuthorTypes.USER_AUTHOR) {
        searchValue = author.searchValue;
      } else if (type === AuthorTypes.ROLE_AUTHOR) {
        searchValue = author.roleSearchValue;
      }
      const {selectedRowKeys, authorResource, mods, modValue} = searchValue;
      const addKeys = [];
      const delKeys = [];
      let addList = '';
      let delList = '';
      if (selectedRowKeys.sort().equals(authorResource.sort())) {
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
        for (const resource of authorResource) {
          if (resource === key) isContain = true;
        }
        if (!isContain)
          addKeys.push(key);
      }
      for (const resource of authorResource) {
        let isContain = false;
        for (const key of selectedRowKeys) {
          if (key === resource) isContain = true;
        }
        if (!isContain)
          delKeys.push(resource);
      }
      for (let i = 0; i < addKeys.length; i++) {
        if (i === 0) {
          addList = addList.concat(`${modValue},`);
        }
        addList = addList.concat(addKeys[i]);
        if (i !== addKeys.length - 1) addList = addList.concat(',');
      }
      for (let i = 0; i < delKeys.length; i++) {
        delList = delList.concat(delKeys[i]);
        if (i !== delKeys.length - 1) delList = delList.concat(',');
      }
      const params = {
        account: searchValue.userValue,
        addList,
        delList,
        role_code: searchValue.roleValue,
        user_code: searchValue.userValue,
        comp_code: searchValue.unitValue,
        copy_code: searchValue.copyValue,
        mod_code: searchValue.modValue,
      };
      let response = {};
      if (type === AuthorTypes.USER_AUTHOR) {
        response = yield call(saveAuthor, params);
      } else if (type === AuthorTypes.ROLE_AUTHOR) {
        response = yield call(saveAuthorByRole, params);
      }
      const {code} = response;
      if (code === 200) {
        message.success('保存成功');
        yield put({type: 'fetchAuthorResource', payload: {type}});
      } else {
        message.error(response.message);
      }
    },

  },
  reducers: {
    resetSearchValue(state) {
      return {...state, searchValue: cloneDeep(initialSearchValue)};
    },
    resetTableSearchValue(state) {
      // eslint-disable-next-line
      return {...state, tableSearchValue: cloneDeep(initialTableSearchValue), userRecordCount: 0, userPageNum: 1, userPageSize: 10};
    },
    resetRoleSearchValue(state) {
      return {...state, roleSearchValue: cloneDeep(initialRoleSearchValue)};
    },
    resetRoleTableSearchValue(state) {
      // eslint-disable-next-line
      return {...state, roleTableSearchValue: cloneDeep(initialRoleTableSearchValue),roleRecordCount: 0, rolePageNum: 1, rolePageSize: 10};
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
    update(state, {payload}) {
      return {...state, ...payload};
    },
  },
};
