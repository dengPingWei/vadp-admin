import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import {message} from '@vadp/ui';

import {
  findRoleAll,
  findRole,
  postRoleCreate,
  patchRoleCreate,
  deleteRole,
  searchRole,
  getUsersByRole,
  findUserAll,
  fetchAllocation,
  fetchRoleNeverUser,
  removeRoleForUser,
  removeRolesForUser,
} from '../services/api';
import {filterRule, filterChinese} from '../utils';

/**
 * reducers
 */
const initState = {
  loading: false,
  content: [],
  currentItem: {},
  modalVisible: false,
  modalType: 'create',
  currentDomain: '',
  roleSearchKey: '',
  allocationSelectedRowKeys: [],
  allocationUserInRole: [],
  roleUsers: [],
  allocationModalVisible: false,
  allocationRole: {},
  editModalVisible: false,
  editRecord: {
    role: {},
    user: [],
  },
  allocationFilterValue: '-1',
  allocationUsers: [],
  allocationAllUsers: [],
  allocationSearchUserValue: '',
  modalRole: {},
  modalUsers: [],
  page: 1,
  userPageSize: 100,
  userPageNum: 1,
  userRecordCount: 0,
  pageSize: 100,
  pageNum: 1,
  recordCount: 0,
  searchRoleValue: '',
  searchRoleType: '0',
  allocationSearchType: '-1',
  allocationType: '',
  tableSize: 'small',
  deleteAccounts: [],
  checkboxHaveUser:false,
};

export default {
  namespace: 'adminRole',
  state: cloneDeep(initState),
  effects: {
    * findAll(_, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const {searchRoleValue, searchRoleType} = adminRole;
      const params = {
        roleValue: searchRoleValue,
        roleAdminType: searchRoleType,
      }
      const response = yield call(findRoleAll, params);
      const {result, code} = response;
      if (code === 200) {
        yield put({type: 'receiveRoles', payload: {content: result, recordCount: result.length}});
      } else {
        message.error('获取角色出现错误');
      }

    },
    * findUserAll(_, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const {
        userPageSize, userPageNum, allocationSearchType,
        allocationSearchUserValue, allocationUsers,
      } = adminRole;
      const params = {
        pageSize: userPageSize,
        pageNum: userPageNum,
        type: allocationSearchType,
        account: allocationSearchUserValue,
      };
      const response = yield call(findUserAll, params);
      const {result, recordCount} = response;
      for (const user of result) {
        for (const allocationUser of allocationUsers) {
          if (allocationUser.account === user.account) {
            if (!allocationUser.unitIds) allocationUser.unitIds = [];
            for (const unit of user.units) {
              allocationUser.unitIds.push(unit.id);
            }
          }
        }
      }
      yield put({type: 'updatePageInfo', payload: {userRecordCount: recordCount}});
      yield put({type: 'updateAllocationUsers', payload: result});
      yield put({type: 'updateAllocationAllUsers', payload: result});
    },
    * find({payload}, {call, put}) {
      const role = yield call(findRole, payload.id);
      yield put({
        type: 'showModal',
        payload: {modalType: 'update', currentItem: role},
      });
    },
    * findNeverUsers(_, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const {
        allocationRole, userPageSize, userPageNum, allocationUsers,
        allocationSearchUserValue, allocationSearchType,checkboxHaveUser
      } = adminRole;
      const params = {
        roleAdminType: allocationRole.roleAdminType,
        roleId: allocationRole.id,
        pageSize: userPageSize,
        pageNum: userPageNum,
        account: allocationSearchUserValue,
        name: allocationSearchUserValue,
        type: allocationSearchType,
        haveUserFlag:checkboxHaveUser,
      }
      const response = yield call(fetchRoleNeverUser, params);
      const {result, recordCount} = response;
      const filterResult = result;
      for (const user of result) {
        for (const allocationUser of allocationUsers) {
          if (allocationUser.account === user.account) {
            if (!allocationUser.unitIds) allocationUser.unitIds = [];
            for (const unit of user.units) {
              allocationUser.unitIds.push(unit.id);
            }
          }
        }
        // if (allocationRole.roleAdminType === 1) {
        //   if (user.type === '0') filterResult.push(user);
        // } else if (allocationRole.roleAdminType === 2) {
        //   if (user.type === '1') filterResult.push(user);
        // }
      }
      yield put({type: 'updatePageInfo', payload: {userRecordCount: recordCount}});
      yield put({type: 'updateAllocationUsers', payload: filterResult});
      yield put({type: 'updateAllocationAllUsers', payload: filterResult});
    },
    * searchRole(_, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const params = {
        key: adminRole.roleSearchKey,
      };
      const result = yield call(searchRole, params);
      yield put({
        type: 'receiveRoles',
        payload: {content: result.roles},
      });
    },

    * create({payload}, {call, put}) {
      if (filterRule(payload.roleCode)) {
        message.error('角色编码不能包含特殊字符!');
        return;
      }
      if (filterChinese(payload.roleCode)) {
        message.error('角色编码不能包含中文字符');
        return;
      }
      const response = yield call(postRoleCreate, payload);
      const {result, code} = response;
      if (code === 200) {
        message.success('新增角色成功');
        yield put({type: 'findAll'});
      } else {
        message.error(response.message);
      }
    },

    * update({payload}, {call, put, select}) {
      const {modalType, item} = payload;
      const adminRole = yield select(state => state.adminRole);
      const params = {
        domain: adminRole.currentDomain,
        page: 1,
      };
      yield call(postRoleCreate, item);
      const successMessage = modalType === 'create' ? '新增成功' : '修改成功';
      message.success(successMessage);
      yield put({
        type: 'findAll',
        payload: params,
      });
    },
    * save({payload}, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const {modalRole} = adminRole;
      const {name, description} = modalRole;
      if (!name) {
        message.warn('角色名称不能为空!');
        return;
      }
      // if (!description) {
      //   message.warn('角色描述不能为空!');
      //   return;
      // }
      yield call(patchRoleCreate, modalRole);
      yield put({type: 'findAll'});
      yield put({type: 'updateEditVisible', payload: {editModalVisible: false}});
      message.success('保存成功');
    },

    * delete({payload}, {call, put}) {
      const params = [...payload];
      const response = yield call(deleteRole, params);
      const {code} = response;
      if (code === 200) {
        message.success('删除角色成功');
        yield put({type: 'findAll'});
      } else {
        message.error(response.message);
      }
    },

    * deleteBatch({payload}, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const {content} = adminRole;
      yield put({
        type: 'requestRoles',
      });
      const params = [];
      const {Ids, domain} = payload;
      for (const id of Ids) {
        for (const role of content) {
          if (id === role.id) params.push(role);
        }
      }
      yield call(deleteRole, params);
      yield put({type: 'findAll'});
      message.success('删除成功');
    },
    * findUserByRole({payload}, {call, put, select}) {
      const {allocationSearchType} = yield select(state => state.adminRole);
      const result = yield call(getUsersByRole, payload.id);
      const allocationSelectedRowKeys = [];
      for (const user of result.users) {
        if (user.type === allocationSearchType)
          allocationSelectedRowKeys.push(user.account);
      }
      yield put({type: 'updateModalUser', payload: result.users});
      yield put({type: 'updateAllocationSelectedRowKeys', payload: allocationSelectedRowKeys});
    },

    * saveAllocation(_, {call, put, select}) {
      const adminRole = yield select(state => state.adminRole);
      const units = yield select(state => state.global.units);
      const {
        allocationSelectedRowKeys, allocationRole,
        allocationUsers,
      } = adminRole;
      const roles = [allocationRole];
      const users = [];
      for (const userKey of allocationSelectedRowKeys) {
        for (const user of allocationUsers) {
          if (user.account === userKey) {
            if (user.unitIds) {
              const newUnits = [];
              for (const id of user.unitIds) {
                for (const unit of units) {
                  if (id === unit.id) {
                    newUnits.push(unit);
                  }
                }
              }
              if (newUnits.length > 0)
                user.units = newUnits;
            }
            users.push(user);
          }
        }
      }
      const params = {
        accounts: allocationSelectedRowKeys,
        roles,
        users,
      }
      yield put({type: 'updateAllocationSelectedRowKeys', payload: []});
      const response = yield call(fetchAllocation, params);
      const {code} = response;
      if (code === 200) {
        message.success(response.message);
      } else {
        message.error('分配用户失败!');
      }
    },

    * removeRoleForUser({payload}, {call, put}) {
      const {account, role} = payload;
      const params = {
        account,
        roleId: role.id,
      };
      const response = yield call(removeRoleForUser, params);
      const {code} = response;
      if (code === 200) {
        yield put({type: 'findUserByRole', payload: role});
      } else {
        message.error(response.message);
      }
    },

    // 批量删除用户分配的角色
    * removeRolesForUser(_, {call, put, select}) {
      const {modalRole, deleteAccounts: accounts} = yield select(state => state.adminRole);
      const params = {
        accounts,
        roleId: modalRole.id,
      };
      if (accounts.length) {
        const response = yield call(removeRolesForUser, params);
        const {code} = response;
        if (code === 200) {
          yield put({type: 'save'});
          yield put({type: 'updateState', payload: {deleteAccounts: []}});
          yield put({type: 'findUserByRole', payload: modalRole});
        } else {
          message.error(response.message);
        }
      } else {
        yield put({type: 'save'});
      }
    },

    * reset(_, {put, select}) {
      const adminRole = yield select(state => state.adminRole);
      yield put({type: 'updatePageInfo', payload: {...adminRole}});
    },

  },
  reducers: {
    updateState(state, {payload = {}}) {
      return {...state, ...payload};
    },
    requestRoles(state) {
      return merge({}, state, {loading: true});
    },
    receiveRoles(state, {payload}) {
      return Object.assign({}, state, {loading: false}, payload);
    },
    showModal(state, {payload}) {
      const nextState = merge({}, state);
      nextState.currentItem = {};
      return merge({}, nextState, payload, {modalVisible: true});
    },
    hideModal(state) {
      return merge({}, state, {modalVisible: false});
    },
    switchDomain(state, {payload}) {
      return merge({}, state, {currentDomain: payload});
    },
    updateSearchValue(state, {payload}) {
      // 更新搜索条件
      return {...state, ...payload};
    },
    setEditRecord(state, {payload}) {
      return {...state, editRecord: {...payload}};
    },
    updateAllocationSelectedRowKeys(state, {payload}) {
      return {
        ...state,
        allocationSelectedRowKeys: [...payload],
      };
    },
    updateAllocationSelectedRowKeysByFilter(state, {payload}) {
      const {allocationFilterValue} = state;
      if (allocationFilterValue === payload) return state;
      const allocationUserInRole = [...state.allocationUserInRole];

      if (payload === '-1') {
        const allUsers = [...state.allocationAllUsers];
        for (const key of allocationUserInRole) removeWithoutCopy(allUsers, key);
        return {...state, allocationUsers: allUsers, allocationFilterValue: payload};
      } else {
        const allUsers = [...state.allocationAllUsers];
        removeWithoutType(allUsers, payload);
        return {
          ...state,
          allocationUsers: allUsers,
          allocationFilterValue: payload,
          allocationSelectedRowKeys: allocationUserInRole,
        };
      }
    },
    updateAllocationVisible(state, {payload}) {
      return {...state, allocationModalVisible: payload};
    },
    updateEditVisible(state, {payload}) {
      return {...state, ...payload};
    },
    updateEditRemark(state, {payload}) {
      const {editRecord} = state;
      editRecord.role.remark = payload;
      return {...state, editRecord: {...editRecord}};
    },
    updateEditName(state, {payload}) {
      const {editRecord} = state;
      editRecord.role.name = payload;
      return {...state, editRecord: {...editRecord}};
    },
    updateModalUser(state, {payload}) {
      return {...state, modalUsers: payload};
    },
    updateModalRole(state, {payload}) {
      return {...state, modalRole: {...state.modalRole, ...payload}};
    },
    updateAllocationUsers(state, {payload}) {
      return {...state, allocationUsers: payload};
    },
    updateAllocationAllUsers(state, {payload}) {
      return {...state, allocationAllUsers: payload};
    },
    updateAllocationUserInRole(state, {payload}) {
      return {...state, allocationUserInRole: payload};
    },
    setAllocationRole(state, {payload}) {
      return {...state, allocationRole: payload};
    },
    updatePageInfo(state, {payload}) {
      return {...state, ...payload};
    },
    updateAllocationSearchType(state, {payload}) {
      return {...state, allocationSearchType: payload};
    },
    updateAllocationSearchUserValue(state, {payload}) {
      return {...state, allocationSearchUserValue: payload};
    },
    updateCheckboxHaveUser(state, {payload}) {
      return {...state, checkboxHaveUser: payload};
    },
    updateColumnUnit(state, {payload}) {
      const {allocationUsers} = state;
      for (const user of allocationUsers) {
        if (user.account === payload.account) {
          user.unitIds = payload.unitIds;
        }
      }
      return {...state, allocationUsers: [...allocationUsers]};
    },
    resetState() {
      return cloneDeep(initState);
    },
  },
};

function removeWithoutCopy(arr, item) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const value = arr[i];
    if (value.account === item.account || value.account === item) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

function removeWithoutType(arr, item) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const value = arr[i];
    if (value.type !== item) {
      arr.splice(i, 1);
    }
  }
  return arr;
}
