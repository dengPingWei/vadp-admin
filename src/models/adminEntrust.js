/**
 * Created by huangzhangshu on 2019/12/4
 */
import {message as Message} from '@vadp/ui';
import cloneDeep from 'lodash/cloneDeep';
import {
  fetchEntrustMenu,
  fetchEntrustBusinessList,
  fetchEntrustBusinessDelete,
  fetchEntrustBusinessSave,
} from '../services/api';

const initialState = {
  entrustList: [],
  menuSelectedKeys: [],
  selectedKeys: [],
  editableKeys: [],
  tableList: [],
  pageSize: 10,
  paginationSize: 10,
  pageNum: 1,
  recordCount: 0,
  currentEntrust: {},
  deleteLoading: false,
  saveLoading: false,
}

export default {
  namespace: 'adminEntrust',
  state: cloneDeep(initialState),
  effects: {
    * fetchMenu(_, {call, put}) {
      const {code, data: entrustList} = yield call(fetchEntrustMenu);
      if (code === 200) {
        yield put({type: 'update', payload: {entrustList}});
      }
    },

    * fetchBusinessList(_, {call, put, select}) {
      const {currentEntrust, pageSize, pageNum} = yield select(state => state.adminEntrust);
      const {businessScenarioId} = currentEntrust;
      const {code, recordCount, result: tableList} = yield call(fetchEntrustBusinessList, {
        businessScenarioId,
        pageSize,
        pageNum,
      });
      if (code === 200) {
        if (tableList.length === 0 && pageNum > 1) {
          yield put({type: 'update', payload: {pageNum: pageNum - 1}});
          yield put({type: 'fetchBusinessList'});
        } else {
          yield put({type: 'update', payload: {recordCount, tableList}});
        }
      }
    },

    * fetchBusinessSave({payload = {}}, {call, put, select}) {
      const {fields} = payload;
      yield put({type: 'update', payload: {saveLoading: true}});
      const {currentEntrust, editableKeys} = yield select(state => state.adminEntrust);
      const {businessScenarioId, appId} = currentEntrust;
      const data = [];
      const fieldsKeys = Object.keys(fields);
      for (const key of editableKeys) {
        const saveOrUpdateData = {
          businessScenarioId,
          appId,
        };
        if (String(key).indexOf('NewSource') === -1) saveOrUpdateData.id = key;
        for (const fieldKey of fieldsKeys) {
          const keySplit = fieldKey.split('_') || [];
          if (keySplit.length === 2) {
            if (keySplit[0] === String(key)) saveOrUpdateData[keySplit[1]] = fields[fieldKey];
          }
        }
        data.push(saveOrUpdateData);
      }
      const {code, message} = yield call(fetchEntrustBusinessSave, {businessScenarioId, data});
      if (code === 200) {
        Message.success('保存成功');
        yield put({type: 'update', payload: {selectedKeys: [], editableKeys: []}});
        yield put({type: 'fetchBusinessList'});
      } else {
        Message.error(message || '保存失败');
      }
      yield put({type: 'update', payload: {saveLoading: false}});
    },

    * fetchBusinessDelete({payload = {}}, {call, put, select}) {
      yield put({type: 'update', payload: {deleteLoading: true}});
      const {selectedKeys, tableList, editableKeys} = yield select(state => state.adminEntrust);
      const addFilter = selectedKeys.filter(key => String(key).indexOf('NewSource') !== -1)
      const selectedKeysForFilter = selectedKeys.filter(key => String(key).indexOf('NewSource') === -1)
      let {ids = ''} = payload;
      if (!ids) {
        for (const key of selectedKeysForFilter) {
          if (ids) ids += ',';
          ids += key;
        }
      }
      if (!ids) {
        Message.success('删除成功');
        yield put({type: 'update', payload: {deleteLoading: false}});
        for (const id of addFilter) {
          for (let i = 0; i < tableList.length; i++) {
            if (tableList[i].id === id) tableList.splice(i, 1);
          }
          for (let i = 0; i < editableKeys.length; i++) {
            if (editableKeys[i] === id) editableKeys.splice(i, 1);
          }
        }
        yield put({type: 'update', payload: {tableList: [...tableList], editableKeys, selectedKeys: []}});
        return;
      }
      const {code} = yield call(fetchEntrustBusinessDelete, {ids});
      yield put({type: 'update', payload: {deleteLoading: false}});
      if (code === 200) {
        Message.success('删除成功');
        let deleteIds = [...ids];
        if (typeof ids === 'string') {
          deleteIds = ids.split(',');
        }
        const removeIds = [...addFilter, ...deleteIds];
        for (const id of removeIds) {
          for (let i = 0; i < tableList.length; i++) {
            if (String(tableList[i].id) === String(id)) tableList.splice(i, 1);
          }
          for (let i = 0; i < editableKeys.length; i++) {
            if (String(editableKeys[i]) === String(id)) editableKeys.splice(i, 1);
          }
        }
        yield put({type: 'update', payload: {tableList: [...tableList], editableKeys, selectedKeys: []}});
        // 删除成功后重新请求列表
        // yield put({type: 'fetchBusinessList'});
      } else {
        Message.error('删除失败');
      }
    },
  },
  reducers: {
    update(state, {payload}) {
      return {...state, ...payload};
    },
    recoverState() {
      return cloneDeep(initialState);
    },
  },
};
