import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep'
import {message} from '@vadp/ui';

import {
  fetchUserForSearch, findUser, deleteUser, postRoleByUser, findEmp,
  fetchResetPassword, uploadAvatar, fetchUnitByAccount, postUserUpdate, findEmpListPage,
  fetchRoleByUser, searchUser, fetchDomainAll, fetchRoleByUser2, fetchUnits, findRoleAll,
  fetchUserFindSysPara, findUpCodeList, importUser, exportUser, importRole, findDept,
} from '../services/api';
import {filterRule} from '../utils';

/**
 * reducers
 */
const initState = {
  loading: false,
  content: [],
  roleContent: [],
  currentItem: {},
  modalVisible: false,
  allocationVisible: false,
  allocationRoles: [],
  allocationAllRoles: [],
  allocationSelectedRowKeys: [],
  initialAllocationSelectedRowKeys: [],
  allocationSelectedUsers: [],
  modalType: 'create',
  allocationType: 'single',
  allocationUpdateType: 0,
  uploadLoading: false,
  userSearchKey: '',
  userSelectedKey: '',
  domainSearchKey: '',
  tableSelectedList: [],
  createAvatar: '',
  modalUnits: [],
  empUsers: [],
  modalEmpUser: {},
  searchAccountValue: '',
  searchRoleValue: '',
  searchTypeValue: '',
  searchUnitValue: '',
  searchDeptValue: '',
  searchRoles: [],
  selectAllocationRows: [],
  pageNum: 1,
  pageSize: 100,
  paginationSize: 100,
  recordCount: 0,
  tableSize: 'small',
  updateRoleType: 'single',
  passwordDefault: true,
  upCodeList: [],
  importModalVisible: false,
  importType: '1',
  importUserType: '0',
  importFileList: [],
  importErrorList: [],
  empPageSize: 100,
  empPageNum: 1,
  empRecordCount: 0,
  empSearchKey: '',
  empSelectedValue: '',
  empFetching: false,
  exportLoading: false,
  importLoading: false,
  importRoleLoading: false,
  departmentList: [],
};

export default {
  namespace: 'adminUser',
  state: cloneDeep(initState),
  effects: {
    * searchForUser({payload}, {call, put}) {
      const user = yield call(fetchUserForSearch, payload);
      yield put({type: 'receiveUsers', payload: user});
    },

    * searchUsers({payload = {}}, {call, put, select}) {
      const adminUser = yield select(state => state.adminUser);
      const {pageNum, pageSize, searchAccountValue, searchRoleValue, searchTypeValue, searchUnitValue, searchDeptValue} = adminUser;
      const params = {
        account: searchAccountValue || '',
        roleCode: searchRoleValue || '',
        type: searchTypeValue || '',
        compCode: searchUnitValue || '',
        deptCode: searchDeptValue || '',
        pageNum,
        pageSize,
      };
      // console.log("&&&&&&&&&----------------------&&&&&&&&&&",searchUser,params)
      const {recordCount, result, code} = yield call(searchUser, params);
      // console.log("$$$$$$$$$$$",recordCount, result, code)
      if (code === 200) {
        if ((!result || !result.length) && pageNum > 1) {
          yield put({type: 'update', payload: {pageNum: pageNum - 1}});
          yield put({type: 'searchUsers'});
        } else {
          yield put({type: 'receiveUsers', payload: {content: result}});
          yield put({type: 'updatePageInfo', payload: {recordCount}});
        }
      }

    },

    * findDept(_, {call, put}) {
      const {code, depts: departmentList} = yield call(findDept);
      if (code === 200) {
        yield put({type: 'update', payload: {departmentList}});
      }
    },

    * findAllRole(_, {call, put}) {
      const params = {
        roleValue: '',
      }
      const response = yield call(findRoleAll, params);
      const {result, code} = response;
      if (code === 200) {
        yield put({type: 'update', payload: {roleContent: result}});
      }
    },

    * find({payload}, {call, put}) {
      const user = yield call(findUser, payload.account);
      yield put({
        type: 'showModal',
        payload: {modalType: 'update', currentItem: user.user},
      });
    },

    * findRoleShowAllocation({payload}, {call, put}) {
      yield put({
        type: 'showAllocationModal',
        // payload: 'batch',
      });
    },

    * findUpCodeList(_, {call, put}) {
      const {code, codeList: upCodeList = []} = yield call(findUpCodeList, {codetype: 'user_category'});
      if (code === 200) {
        yield put({type: 'update', payload: {upCodeList}});
      }
    },

    * updateRoles(_, {call, put, select}) {
      const adminUser = yield select(state => state.adminUser);
      const units = yield select(state => state.global.units);
      const { allocationSelectedUsers, allocationSelectedRowKeys = [], allocationAllRoles, updateRoleType, allocationUpdateType, allocationType } = adminUser;
      let updateRoles = [];
      allocationSelectedRowKeys.forEach((roleCode) => {
        const filterRole = allocationAllRoles.filter(({ roleCode: filterRoleCode }) => filterRoleCode === roleCode);
        updateRoles = updateRoles.concat(filterRole);
      });
      const roles = [];
      for (const role of updateRoles) {
        if (role.unitIds) {
          const newUnits = [];
          for (const id of role.unitIds) {
            for (const unit of units) {
              if (id === unit.id) {
                newUnits.push(unit);
              }
            }
          }
          role.roleUserUnits = newUnits;
          role.units = newUnits;
        }
        roles.push(role);
      }
      const params = {
        users: allocationSelectedUsers,
        roles,
        type: updateRoleType,
      };
      if (allocationType !== 'single') params.updateType = allocationUpdateType;
      const allocation = yield call(postRoleByUser, params);
      if (allocation.code === 200) {
        yield put({
          type: 'update',
          payload: {initialAllocationSelectedRowKeys: [], selectAllocationRows: [], allocationSelectedUsers: [], allocationUpdateType: 0}
        });
        message.success('分配角色成功');
      }
      yield put({type: 'searchUsers'});
    },

    * saveOrUpdate({payload}, {call, put, select}) {
      const {modalType, item} = payload;
      const adminUser = yield select(state => state.adminUser);
      const {createAvatar} = adminUser;
      const params = {
        ...item,
      };
      if (createAvatar.id) params.avatarId = createAvatar.id;
      if (filterRule(item.account)) {
        message.error('用户名不能包含特殊字符');
        return;
      }
      const response = yield call(postUserUpdate, params);
      if (response.code === 200) {
        // yield put({type: 'updateContent', payload: []});
        const successMessage = modalType === 'create' ? '新增用户成功' : '修改用户成功';
        yield put({type: 'hideModal'});
        yield put({type: 'update', payload: {modalEmpUser: {}}});
        message.success(successMessage);
        yield put({type: 'searchUsers'});
      } else {
        const failureMessage = modalType === 'create' ? '新增用户失败' : '修改用户失败';
        message.error(response.message || failureMessage);
      }
    },

    * updateUser({payload}, {call, put}) {
      const {user} = payload;
      const params = {
        ...user,
      };
      const response = yield call(postUserUpdate, params);
      if (response.code === 200) {
        yield put({type: 'global/update', payload: {settingUserVisible: false}});
        yield put({type: 'user/fetchCurrent'});
        yield put({
          type: 'global/update',
          payload: {
            settingUserVisible: false,
            settingUserAvatar: {},
            settingUserEditable: false,
            settingUserUploading: false,
          },
        });
        message.success('更新成功');
      } else {
        message.error(response.message || '更新失败');
      }
    },

    * deleteBatch({payload}, {call, put}) {
      const params = [...payload];
      yield put({type: 'requestUsers'});
      const response = yield call(deleteUser, params);
      const {code} = response;
      if (code === 200) {
        message.success('删除成功');
        yield put({type: 'searchUsers', payload: {searchByDelete: true}});
      } else {
        yield put({type: 'update', payload: {loading: false}});
        message.error(response.message);
      }
    },

    * uploadAvatar({payload}, {call, put}) {
      const response = yield call(uploadAvatar, payload);
      yield put({type: 'updateUploadLoading', payload: false});
      if (response.code === 200) {
        yield put({type: 'updateContent', payload: response.result});
      } else {
        message.error(response.message);
      }
    },

    * uploadUserAvatar({payload}, {call, put}) {
      const response = yield call(uploadAvatar, payload);
      yield put({type: 'global/update', payload: {settingUserUploading: false}});
      if (response.code === 200) {
        yield put({type: 'global/update', payload: {settingUserAvatar: response.result}});
      } else {
        message.error(response.message);
      }
    },

    * resetPassword({payload}, {call}) {
      const result = yield call(fetchResetPassword, {ids: payload});
      if (result.code === 200) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    },

    * findUnits(_, {call, put, select}) {
      const currentUnit = yield select(state => state.global.currentUnit);
      const currentUser = yield select(state => state.user.currentUser);
      let response = {};
      if (currentUser.account === 'admin') {
        response = yield call(fetchDomainAll);
      } else {
        const params = {
          code: currentUnit.code,
        }
        response = yield call(fetchUnits, params);
      }
      const {units, code} = response;
      if (code === 200) {
        yield put({type: 'updateUnits', payload: units});
        yield put({type: 'findEmpList', payload: {compCode: currentUnit.code}});
      }
    },

    * findUnit({payload}, {call, put}) {
      const result = yield call(fetchUnitByAccount, '1');
      yield put({
        type: 'updateUnits',
        payload: result.units,
      });
    },

    * findRole(_, {call, put}) {
      const response = yield call(fetchRoleByUser);
      const {roles} = response;
      for (const role of roles) {
        role.roleUserUnits = [];
        role.unitIds = [];
      }
      yield put({type: 'updateSearchRoles', payload: roles});
    },

    * findAllocationRole(_, {call, put, select}) {
      const {allocationSelectedUsers} = yield select(state => state.adminUser);
      const selectedUserType = allocationSelectedUsers.length > 0 ? allocationSelectedUsers[0].type : '0';
      const response = yield call(fetchRoleByUser);
      const {roles} = response;
      const filterRoles = [];
      for (const role of roles) {
        role.roleUserUnits = [];
        role.unitIds = [];
        if (selectedUserType === '0' && role.roleAdminType === 1) {
          filterRoles.push(role);
        } else if (selectedUserType === '1') {
          filterRoles.push(role);
        }
      }
      yield put({type: 'update', payload: {allocationAllRoles: filterRoles}});
    },

    * findEmpList({payload = {}}, {call, put, select}) {
      const {empPageSize, empPageNum, empUsers, empSearchKey} = yield select(state => state.adminUser);
      const {currentUnit = {}} = yield select(state => state.global);
      // eslint-disable-next-line prefer-const
      let {compCode, isReplace = false, selectedValue} = payload;
      if (!compCode) compCode = currentUnit.code;
      const params = {
        pageSize: empPageSize,
        pageNum: empPageNum,
        searchKey: empSearchKey,
        compCode,
      }
      if (selectedValue) params.selectedValue = selectedValue;
      yield put({type: 'update', payload: {empFetching: true}});
      const {result, recordCount, code} = yield call(findEmpListPage, params);
      if (code === 200) {
        const users = isReplace ? result : empUsers.concat(result);
        yield put({
          type: 'update',
          payload: {empUsers: users, empRecordCount: recordCount, empFetching: false},
        });
      }
    },

    * findEmp({payload}, {call, put}) {
      const {empCode} = payload;
      const response = yield call(findEmp, empCode);
      const {code, result} = response;
      if (code === 200) {
        yield put({type: 'update', payload: {modalEmpUser: result || {}}});
      } else {
        yield put({type: 'update', payload: {modalEmpUser: {}}});
      }
    },

    * saveOrUpdateRole({payload}, {call, put}) {
      const result = yield call(postRoleByUser, payload);
    },

    * findRoleByUser({payload}, {call, put, select}) {
      const searchRoles = yield select(state => state.adminUser.searchRoles);
      // yield put({type: 'showAllocationModal'});
      const {id} = payload;
      const response = yield call(fetchRoleByUser2, id);
      const {roles} = response;
      const keys = [];
      for (const role of roles) {
        keys.push(role.roleCode);
        for (const searchRole of searchRoles) {
          if (searchRole.roleCode === role.roleCode) {
            if(role.roleUserUnits && role.roleUserUnits!="undefinded"){
              searchRole.roleUserUnits = [...role.roleUserUnits];
              for (const unit of role.roleUserUnits) {
                searchRole.unitIds.push(unit.compId);
              }
            }
          }
        }
      }
      yield put({type: 'updateAllocationKeys', payload: keys});
      yield put({type: 'update', payload: {initialAllocationSelectedRowKeys: keys}});
      yield put({type: 'updateSearchRoles', payload: [...searchRoles]});
    },

    * reset(_, {put, select}) {
      const adminUser = yield select(state => state.adminUser);
      yield put({type: 'update', payload: {...adminUser}});
    },
    * fetchUserFindSysPara({payload}, {call, put}) {
      const params = {
        paraCode: '0132',
      }
      const res = yield call(fetchUserFindSysPara, params);
      if (res.code === 200 && res.sysPara && res.sysPara.paraValue === "是") {
        yield put({type: 'update', payload: {passwordDefault: false}});
      }
    },

    * importUser({payload}, {call, put, select}) {
      const {formData, uid} = payload;
      yield put({type: 'update', payload: {importLoading: true}});
      const {importFileList} = yield select(state => state.adminUser);
      const {code, result = {}, message: errorMessage} = yield call(importUser, formData);
      if (code === 200) {
        const {sucessNum = 0, failNum = 0, list = []} = result;
        message.success(`成功导入${sucessNum}条数据!`)
        for (const file of importFileList) {
          if (file.uid === uid) file.status = 'done';
        }
        yield put({type: 'update', payload: {importErrorList: [],importFileList: []}});
        yield put({type: 'searchUsers'});
        if (failNum !== 0) {
          yield put({type: 'update', payload: {importErrorList: list}});
        }
      } else {
        message.error(errorMessage || '导入用户失败!');
        const {list = []} = result;
        for (const file of importFileList) {
          if (file.uid === uid) file.status = 'error';
        }
        yield put({type: 'update', payload: {importErrorList: list,importFileList: []}});
      }
      yield put({type: 'update', payload: {importLoading: false}});
    },

    * importRole({payload}, {call, put, select}) {
      const {formData, uid} = payload;
      yield put({type: 'update', payload: {importRoleLoading: true}});
      const {importFileList} = yield select(state => state.adminUser);
      const {code, result = {}, message: errorMessage} = yield call(importRole, formData);
      if (code === 200) {
        const {sucessNum = 0, failNum = 0, list = []} = result;
        message.success(`成功导入${sucessNum}条数据!`)
        for (const file of importFileList) {
          if (file.uid === uid) file.status = 'done';
        }
        yield put({type: 'update', payload: {importFileList: [...importFileList], importErrorList: []}});
        yield put({type: 'searchUsers'});
        if (failNum !== 0) {
          yield put({type: 'update', payload: {importErrorList: list}});
        }
      } else {
        message.error(errorMessage || '导入用户角色失败!');
        const {list = []} = result;
        for (const file of importFileList) {
          if (file.uid === uid) file.status = 'error';
        }
        yield put({type: 'update', payload: {importErrorList: list, importFileList: [...importFileList]}});
      }
      yield put({type: 'update', payload: {importRoleLoading: false}});
    },

    * exportUser(_, {call, select, put}) {
      const {
        searchAccountValue, searchRoleValue, searchTypeValue,
      } = yield select(state => state.adminUser);
      const params = {
        account: searchAccountValue,
        roleCode: searchRoleValue,
        type: searchTypeValue,
      }
      yield put({type: 'update', payload: {exportLoading: true}});
      const response = yield call(exportUser, params);
      const blob = new Blob([response], {type: 'application/vnd.ms-excel'});
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        window.navigator.msSaveOrOpenBlob(blob, 'up_org_user.xlsx');
      } else {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'up_org_user.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      yield put({type: 'update', payload: {exportLoading: false}});
    },
  },
  reducers: {
    requestUsers(state,) {
      return merge({}, state, {loading: true});
    },
    receiveUsers(state, {payload}) {
      return Object.assign({}, state, {loading: false}, payload);
    },
    receiveAllocationRoles(state, {payload}) {
      return {
        ...state,
        allocationRoles: [...payload.content],
      };
    },
    showModal(state, {payload}) {
      const nextState = merge({}, state);
      nextState.currentItem = {};
      return merge({}, nextState, payload, {modalVisible: true});
    },
    showAllocationModal(state, {payload}) {
      return {...state, ...payload, allocationVisible: true};
    },
    hideModal(state) {
      return merge({}, state, {modalVisible: false});
    },
    hideAllocationModal(state) {
      return {...state, allocationVisible: false};
    },
    updateAllocationKeys(state, {payload}) {
      return {...state, allocationSelectedRowKeys: payload};
    },
    updateAllocationRows(state, {payload}) {
      return {...state, selectAllocationRows: payload};
    },
    updateAllocationUsers(state, {payload}) {
      const {allocationSelectedUsers, allocationType} = payload;
      let allocationSelectedRowKeys = [];
      if (allocationType === 'single') {
        allocationSelectedRowKeys = allocationSelectedUsers[0].roleIds;
      }
      return {...state, allocationSelectedUsers, allocationType, allocationSelectedRowKeys};
    },
    updateUploadLoading(state, {payload}) {
      return {...state, uploadLoading: payload};
    },
    updateContent(state, {payload}) {
      return {...state, createAvatar: payload};
    },
    updateCreateAvatar(state, {payload}) {
      return {...state, createAvatar: payload};
    },
    updateSearchKey(state, {payload}) {
      return {...state, ...payload};
    },
    updateUserSelectedKey(state, {payload}) {
      return {...state, userSelectedKey: payload};
    },
    updateTableSelectList(state, {payload}) {
      return {...state, tableSelectedList: payload};
    },
    updateUnits(state, {payload}) {
      return {...state, modalUnits: payload};
    },
    updateSearchValue(state, {payload}) {
      return {...state, ...payload};
    },
    updateSearchRoles(state, {payload}) {
      return {...state, searchRoles: [...payload]};
    },
    updatePageInfo(state, {payload}) {
      return {...state, ...payload};
    },
    updateColumnUnit(state, {payload}) {
      const {searchRoles} = state;
      for (const role of searchRoles) {
        if (role.roleCode === payload.roleCode) {
          role.unitIds = payload.unitIds;
        }
      }
      return {...state, searchRoles: [...searchRoles]};
    },
    update(state, {payload}) {
      return {...state, ...payload};
    },
    resetUnits(state) {
      const {searchRoles} = state;
      for (const role of searchRoles) {
        role.unitIds = [];
      }
      return {...state, searchRoles};
    },
    resetState() {
      return cloneDeep(initState);
    },
  },
};
