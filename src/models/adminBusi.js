import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep'
import {message} from '@vadp/ui';

import {
  findBusiApiAll, postBusiApiSaveOrUpdate, postBusiApiUpdate, deleteBusiApi, searchBusiApi, findRoleAll,findRoleByMenuId,
} from '../services/api';
import {filterRule} from '../utils';
import AuthorTypes from "../common/AuthorTypes";


/**
 * reducers
 */
const initState = {
  loading: false,
  busiApiContent: [],
  currentItem: {},
  modalVisible: false,
  modalType: 'create',
  busiSelectedKey: '',
  tableSelectedList: [],
  roleContent: [],
  roleSelectedContent: [],
  searchBusiApiValue: '',
  page: 1,
  busiPageSize: 100,
  busiPageNum: 1,
  busiRecordCount: 0,
  pageSize: 100,
  pageNum: 1,
  recordCount: 0,
  paginationSize: 100,
  tableSize: 'small',
  searchRoleValue: '',
  searchRoleType: '0',
};

export default {
  namespace: 'adminBusi',
  state: cloneDeep(initState),
  effects: {
    * searchBusis({payload = {}}, {call, put, select}) {
      const adminBusi = yield select(state => state.adminBusi);
      const {pageNum, pageSize, searchBusiApiValue} = adminBusi;
      const params = {
        url: searchBusiApiValue || '',
        pageNum,
        pageSize,
      };
      const {recordCount, result, code} = yield call(searchBusiApi, params);
      if (code === 200) {
        if ((!result || !result.length) && pageNum > 1) {
          yield put({type: 'update', payload: {pageNum: pageNum - 1}});
          yield put({type: 'searchBusis'});
        } else {
          yield put({type: 'receiveBusis', payload: {busiApiContent: result}});
          yield put({type: 'updatePageInfo', payload: {recordCount}});
        }
      }

    },

    * findAllBusi(_, {call, put, select}) {
      const adminBusi = yield select(state => state.adminBusi);
      const {searchRoleValue, searchRoleType} = adminBusi;
      const params = {
        roleValue: searchRoleValue,
        roleAdminType: searchRoleType,
      }

      const response = yield call(findBusiApiAll, params);
      const {result, code} = response;
      // if (code === 200) {
      //   yield put({type: 'update', payload: {busiApiContent: result}});
      // }

      if (code === 200) {
        yield put({type: 'receiveBusis', payload: {busiApiContent: result, recordCount: result.length}});
      } else {
        message.error('获取业务资源出现错误');
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

    * findRoleByMenuId({payload} ,{call, put,select}) {
       const params = {
          menuId: payload.id || '',
       };

      const response = yield call(findRoleByMenuId, params);
      const {result, code} = response;
      if (code === 200) {
        yield put({
          type: 'update',
          payload: {roleSelectedContent: result},
        });
      }

     },

    * find({payload}, {call, put}) {
      yield put({
        type: 'showModal',
        payload: {modalType: 'update',currentItem:payload},
      });
    },

    * saveOrUpdate({payload}, {call, put, select}) {
      const {data, modalType} = payload;
      const response = yield call(postBusiApiSaveOrUpdate, data);
      if (response.code === 200) {
        const successMessage = modalType === 'create' ? '新增业务成功' : '修改业务成功';
        yield put({type: 'hideModal'});
        message.success(successMessage);
        yield put({type: 'searchBusis'});
      } else {
        const failureMessage = modalType === 'create' ? '新增业务失败' : '修改业务失败';
        message.error(response.message || failureMessage);
      }
    },


    * deleteBatch({payload}, {call, put}) {
      const params = [...payload];
      yield put({type: 'requestBusiApis'});
      const response = yield call(deleteBusiApi, params);
      const {code} = response;
      if (code === 200) {
        message.success('删除成功');
        yield put({type: 'searchBusis'});
      } else {
        message.error(response.message);
      }
    },

    * reset(_, {put, select}) {
      const adminUser = yield select(state => state.adminUser);
      yield put({type: 'update', payload: {...adminUser}});
    },

  },
  reducers: {
    updateState(state, {payload = {}}) {
      return {...state, ...payload};
    },
    requestBusiApis(state,) {
      return merge({}, state, {loading: true});
    },
    receiveBusis(state, {payload}) {
      return Object.assign({}, state, {loading: false}, payload);
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

    updateContent(state, {payload}) {
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
    updateSearchValue(state, {payload}) {
      return {...state, ...payload};
    },
    updatePageInfo(state, {payload}) {
      return {...state, ...payload};
    },
    update(state, {payload}) {
      return {...state, ...payload};
    },

    resetState() {
      return cloneDeep(initState);
    },
  },
};
