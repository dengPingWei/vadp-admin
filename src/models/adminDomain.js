import {message} from '@vadp/ui';
import merge from 'lodash/merge';
import {
  fetchDomainAll,
  postDomainUpdate,
  deleteDomains,
  fetchCodelist,
  fetchTreeList,
  fetchAddTreeList,
  fetchDictinmap,
  fetchSearchTreeList,
  fetchStartTreeList,
  fetchXmlJsonList,
  fetchStopTreeList,
  fetchSaveOrUpdataTreeList,
  fetchDeleteTreeList,
  fetchPublishTreeList,
  fetchRegion,
  fetchCompetencyFunctionGroups,
} from '../services/api';
import CodeTypes from '../common/CodeTypes';
import event from '../utils/event';

/**
 * reducers
 */
const initState = {
  loading: false,
  content: [],
  treeList: [],
  menuList: [],
  functionList: [],
  editList: {},
  provinceData: [],
  cityData: [],
  townData: [],
  hospattr: [],
  hosplevel: [],
  xmlJsonList: [],
  currentItem: {},
  modalVisible: false,
  modalTitleType: '组织机构新增',
  modalType: 'create',
  currentUnit: {},
  codeList: {},
  isEditable: false,
  isUpdating: false,
  showModal: false,
  showModalOkButton: false,
  isAddGroupModel: false,
  orgcode: '',
  isEnabled: '',
  functionGroups: [],
};

export default {
  namespace: 'adminDomain',
  state: {...initState},
  effects: {


    * fetchXmlJsonList({payload}, {call, put}) {
      const temparams = payload;
      const params = {codes: temparams};
      const response = yield call(fetchXmlJsonList, params);
      const {code} = response;
      const xmlJsonList = response.data;

      if (code === 200) {
        yield put({type: 'update', payload: {xmlJsonList}});
      } else {
        message.error(response.message);
      }
    },
    * fetchSaveOrUpdataTreeList({payload = {}, callback}, {call, put, select}) {
      const currentUnit = yield select(state => state.global.currentUnit);
      const treeList = yield select(state => state.adminDomain.treeList);
      const obj2 = payload;
      obj2.data.unit.orgcode = currentUnit.code;
      const params = obj2;

      const response = yield call(fetchSaveOrUpdataTreeList, params);
      const {code, result} = response;
      if (callback && typeof callback === 'function') {
        callback(response);//返回response中的该条信息详细数据
      }
      if (code === 200) {
        message.success(response.message);
        yield put({type: 'update', payload: {showModal: false}})

        if (!treeList || treeList.length === 0) {
          // 如果是首次新建组织
          yield put({type: 'global/setEnvForUnit', payload: {unit: payload.data.unit}});
        }
        yield put({type: 'findAll'});
        yield put({type: 'updateCurrentUnit', payload: payload.data.unit});
        yield put({type: 'global/fetchAndUpdateUnits'});
      } else {
        message.error(response.message);
        // yield put({type: 'update', payload: {showModal: false}})
      }
    },
    * startTreeList({payload = {}, callback}, {call, put}) {
      const temparams = payload;
      const params = {codes: temparams};
      const response = yield call(fetchStartTreeList, params);
      const {code, result} = response;
      if (callback && typeof callback === 'function') {
        callback(response);//返回response中的该条信息详细数据
      }
      if (code === 200) {
        message.success('启用成功');
        yield put({type: 'findAll'});
      } else {
        message.error(response.message);
      }
    },
    * stopTreeList({payload = {}, callback}, {call, put}) {
      const temparams = payload;
      const params = {codes: temparams};
      const response = yield call(fetchStopTreeList, params);
      const {code, result} = response;
      if (callback && typeof callback === 'function') {
        callback(response);//返回response中的该条信息详细数据
      }
      if (code === 200) {
        message.success('停用成功');
        yield put({type: 'findAll'});
      } else {
        message.error(response.message);
      }
    },
    * deleteTreeList({payload = {}, callback}, {call, put}) {
      const temparams = payload;
      const params = {orgcode: temparams};
      const response = yield call(fetchDeleteTreeList, params);
      const {code} = response;
      if (callback && typeof callback === 'function') {
        callback(response);//返回response中的该条信息详细数据
      }
      if (code === 200) {
        message.success(response.result || '删除成功');
        yield put({type: 'update', payload: {showModal: false}})
        yield put({type: 'fetchTreeList'});
        yield put({type: 'findAll'});
      } else {
        message.error(response.message);
      }
    },
    * publishTreeList({payload = {}, callback}, {call, put}) {
      const temparams = payload;
      const params = {orgcode: temparams};
      const response = yield call(fetchPublishTreeList, params);
      const {code} = response;
      if (callback && typeof callback === 'function') {
        callback(response);//返回response中的该条信息详细数据
      }
      if (code === 200) {
        message.success(response.result || '发布成功');
        yield put({type: 'update', payload: {showModal: false}})
        yield put({type: 'fetchTreeList'});
        yield put({type: 'findAll'});
      } else {
        message.error(response.message);
      }
    },

    * fetchAddTreeList({payload = {}, callback}, {call, put, select}) {
      // const currentUnit = yield select(state => state.global.currentUnit);
      const {orgcode} = payload;
      const params = {orgcode: orgcode};

      const response = yield call(fetchAddTreeList, params);
      // const functionList = response.function;
      const editList = response.upOrgUnit;
      if (response.code === 200) {

        // yield put({type: 'update', payload: {functionList}});
        yield put({type: 'update', payload: {editList}});

        if (callback && typeof callback === 'function') {
          callback(response.upOrgUnit);//返回response中的该条信息详细数据
        }
      } else {
        message.warning('获取信息失败')
      }

    },
    // * fetchDisplayDisabledTreeList({payload}, {call, put, select}) {
    //   const isEnabled = payload;
    //   const currentUnit = yield select(state => state.global.currentUnit);
    //   const params = {isEnabled: isEnabled,orgcode: currentUnit.code};
    //   const response = yield call(fetchSearchTreeList, params);
    //   if (response.code === 200) {
    //     const treeList = response.tree;
    //
    //     yield put({type: 'update', payload: {treeList}});
    //
    //   } else {
    //     message.error(response.message);
    //   }
    // },
    // * fetchSearchTreeList({payload}, {call, put, select}) {
    //   const orgcode = payload;
    //   const currentUnit = yield select(state => state.global.currentUnit);
    //   const params = {functioncode: orgcode,orgcode: currentUnit.code};
    //   const response = yield call(fetchSearchTreeList, params);
    //   if (response.code === 200) {
    //     const treeList = response.tree;
    //
    //     yield put({type: 'update', payload: {treeList}});
    //
    //   } else {
    //     message.error(response.message);
    //   }
    // },
    * fetchTreeList({payload = {}, callback}, {call, put, select}) {
      const type = payload;
      const currentUnit = yield select(state => state.global.currentUnit);
      const adminDomain = yield select(state => state.adminDomain);
      const {orgcode, isEnabled,} = adminDomain;
      const params = {
        functioncode: orgcode,
        isEnabled: isEnabled,
        orgcode: currentUnit.code
      };
      const response = yield call(fetchTreeList, params);
      if (callback && typeof callback === 'function') {
        callback(response);//返回response中的该条信息详细数据
      }
      if (response.code === 200) {
        const treeList = response.tree;
        if ((treeList.length === 0) && (type == '1')) {
          yield put({type: 'update', payload: {showModal: true}})
        } else {
          yield put({type: 'update', payload: {showModal: false}})
        }
        const menuList = response.menu;
        yield put({type: 'update', payload: {treeList}});
        yield put({type: 'update', payload: {menuList}});
      } else {
        message.error(response.message);
      }

    },
    * findAll({payload}, {call, put}) {
      const result = yield call(fetchDomainAll);
      yield put({type: 'receiveDomains', payload: {content: result.units}});
      yield put({type: 'global/updateSettingUnit', payload: {units: result.units}});
    },
    * fetchCodelist(_, {call, put}) {
      const params = {
        codetypes: [CodeTypes.compLevelCodes, CodeTypes.institution_type_code,
          CodeTypes.subjection_code, CodeTypes.comp_type_code, CodeTypes.coreIsCount],
      }
      const result = yield call(fetchCodelist, params);

      yield put({
        type: 'updateCodeList',
        payload: result.list,
      });
    },
    * fetchDict(_, {call, put}) {
      const result = yield call(fetchDictinmap);

      const hospattr = result.hospattr;
      const hosplevel = result.hosplevel;
      yield put({type: 'update', payload: {hospattr}});
      yield put({type: 'update', payload: {hosplevel}});
    },
    * fetchRegion({payload}, {call, put}) {
      const result = yield call(fetchRegion, payload);
      const {type} = payload;
      const provinceData = result;
      yield put({type: 'update', payload: {provinceData}});
      // yield put({
      //   type: 'updateCodeList',
      //   payload: {[type]: result},
      // });

    },

    * fetchRegionCity({payload = {}, callback}, {call, put}) {
      const result = yield call(fetchRegion, payload);
      const {type} = payload;
      const cityData = result;
      yield put({type: 'update', payload: {cityData}});
      //   if (callback && typeof callback === 'function'){
      //     callback(cityData);//返回response中的该条信息详细数据
      //   }
      // else{
      //   message.warning('获取信息失败')
      //  }

    },
    * fetchRegionTown({payload = {}, callback}, {call, put}) {
      const result = yield call(fetchRegion, payload);
      const {type} = payload;
      const townData = result;
      yield put({type: 'update', payload: {townData}});
      //   if (callback && typeof callback === 'function'){
      //     callback(cityData);//返回response中的该条信息详细数据
      //   }
      // else{
      //   message.warning('获取信息失败')
      //  }

    },
    * updateDomain({payload}, {call, put, select}) {
      const currentUnit = yield select(state => state.adminDomain.currentUnit);
      const content = yield select(state => state.adminDomain.content);
      const isUpdating = yield select(state => state.adminDomain.isUpdating);
      const {currentUnit: globalUnit} = yield select(state => state.global);
      if (isUpdating) return;
      let params = {...payload};
      if (currentUnit.id) params = {...currentUnit, ...payload};
      yield put({type: 'update', payload: {isUpdating: true}});
      const response = yield call(postDomainUpdate, params);
      const {code, result} = response;
      if (code === 200) {
        const successMessage = currentUnit.id ? '保存成功' : '添加成功';
        message.success(successMessage);
        if (!content || content.length === 0) {
          // 如果是首次新建组织
          yield put({type: 'global/setEnvForUnit', payload: {unit: payload}});
        } else if (!globalUnit.id) {
          // 如果是首次新建组织
          yield put({type: 'global/setEnvForUnit', payload: {unit: payload}});
        }
        yield put({type: 'findAll'});
        yield put({type: 'updateCurrentUnit', payload: result});
        yield put({type: 'global/fetchAndUpdateUnits'});
      } else {
        message.error(response.message);
      }
      yield put({type: 'update', payload: {isUpdating: false, loading: false}});
    },

    * deleteBatch(_, {call, put, select}) {
      const currentUnit = yield select(state => state.adminDomain.currentUnit);
      const content = yield select(state => state.adminDomain.content);
      const params = [currentUnit];
      yield put({type: 'requestDomains'});
      const response = yield call(deleteDomains, params);
      if (response.code === 200) {
        message.success('删除成功');
        let nextUnit = {};
        for (let i = 0; i < content.length; i++) {
          if (content[i].id === currentUnit.id) {
            if (content[i + 1]) nextUnit = content[i + 1];
          }
        }
        yield put({type: 'updateCurrentUnit', payload: nextUnit});
        if (!nextUnit.id) {
          yield put({type: 'update', payload: {isEditable: false}});
          event.emit('DOMAIN_FORM_RESET');
        }
        yield put({type: 'findAll'});
        yield put({type: 'global/fetchAndUpdateUnits'});
      } else {
        message.error(response.message);
      }
    },

    * fetchCompetencyFunctionGroups(_, {call, put}) {
      const {code, result} = yield call(fetchCompetencyFunctionGroups);
      if (code === 200) {
        yield put({type: 'update', payload: {functionGroups: result}});
      }
    },
  },
  reducers: {
    requestDomains(state) {
      return merge({}, state, {loading: true});
    },
    hideLoading(state) {
      return merge({}, state, {loading: false});
    },
    receiveDomains(state, {payload}) {
      return Object.assign({}, state, {loading: false}, payload);
    },
    showModal(state, {payload}) {
      return merge({}, state, payload, {modalVisible: false});
    },
    showModalTitle(state, {payload}) {
      return merge({}, state, payload, {modalTitleType: '组织机构新增'});
    },
    showModalOkButton(state, {payload}) {
      return Object.assign({}, state, payload, {isDisabled: false});
    },

    hideModal(state) {
      return merge({}, state, {modalVisible: true});
    },
    updateCurrentUnit(state, {payload}) {
      return {...state, currentUnit: {...payload}};
    },
    updateCodeList(state, {payload}) {
      const {codeList} = state;
      return {...state, codeList: {...codeList, ...payload}};
    },
    updateRegion(state, {payload}) {
      const {type, result} = payload;
      // eslint-disable-next-line no-undef
      const tempRegion = {...region};
      tempRegion[type] = result;
      return {state, region: tempRegion};
    },
    update(state, {payload}) {
      return {...state, ...payload};
    },
  },
};
