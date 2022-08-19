import merge from 'lodash/merge';
import {message} from '@vadp/ui';
import cloneDeep from 'lodash/cloneDeep';

import {arrayToTree} from '../utils';

import {
  fetchMenuAll,
  postMenuCreate,
  patchMenuCreate,
  deleteMenus,
  fetchMenus,
  fetchButtons,
  fetchDefinedButtons,
  saveButtons,
  deleteButtons,
  fetchAppsForMenu,
  addMenu,
  updateMenu,
} from '../services/api';

/**
 * reducers
 */
const initState = {
  loading: false,
  content: [],
  menuTrees: [],
  apps: [],
  currentItem: {},
  buttons: [],
  buttonValues: [],
  modalVisible: false,
  menuModalVisible: false,
  modalType: 'create',
  menuCurrentApp: {},
  childrenCount: 0,
  // 是否新增根菜单
  addRootMenu: false,
};

export default {
  namespace: 'adminMenu',
  state: cloneDeep(initState),
  effects: {
    * findAll({payload}, {call, put}) {
      const menus = yield call(fetchMenuAll, payload);

      yield put({
        type: 'receiveMenus',
        payload: menus,
      });
    },

    * fetchMenu(_, {call, put, select}) {
      const menuCurrentApp = yield select(state => state.adminMenu.menuCurrentApp);
      const result = yield call(fetchMenus, menuCurrentApp.id || 'sysplatform');
      const menuTrees = arrayToTree(cloneDeep(result.menuList), 'id', 'parentId');
      yield put({
        type: 'receiveMenus',
        payload: {content: result.menuList, menuTrees},
      });
    },

    * fetchApps(_, {put, call}) {
      const {code, apps} = yield call(fetchAppsForMenu);
      if (code === 200) {
        yield put({type: 'updateState', payload: {apps: apps.filter(app => app.id !== null && app.id !== '')}});
      }
    },

    * fetchButtons({payload = {}}, {call, put, select}) {
      const {menuCurrentApp: {path, id}} = yield select(state => state.adminMenu);
      const {newMenuId} = payload;
      const flag = path === 'OES' ? '1' : '0';
      const params = {
        appId: id,
        menuId: newMenuId,
        flag,
      }
      const result = yield call(fetchButtons, params);
      const {code, buttonsList: buttons} = result;
      if (code === 200) {
        yield put({type: 'updateState', payload: {buttons}});
      }
    },

    * fetchDefinedButtons({payload}, {put, call}) {
      const {newMenuId} = payload;
      const params = {
        newMenuId,
      }
      const {code, buttonsList: buttonValues = []} = yield call(fetchDefinedButtons, params);
      if (code === 200) {
        buttonValues.sort((buttonA, buttonB) => {
          const {name: nameA} = buttonA;
          const {name: nameB} = buttonB;
          return Number(nameA) - Number(nameB);
        })
        yield put({type: 'updateState', payload: {buttonValues}});
      }
    },

    * saveButtons(_, {put, call, select}) {
      const {buttonValues, currentItem, menuCurrentApp} = yield select(state => state.adminMenu);
      const menus = [];
      if (buttonValues.length === 0) {
        message.warn('请先新增菜单功能');
        return;
      }
      let hasSameNameOrId = false;
      const nameValues = {};
      const buttonIdValues = {};
      for (const value of buttonValues) {
        const {buttonId, title} = value;
        // buttonIdValues[buttonId]
        if (nameValues[title]) {
          hasSameNameOrId = true;
          break;
        }
        nameValues[title] = true;
        buttonIdValues[buttonId] = true;
      }
      if (hasSameNameOrId) {
        message.warn('存在相同的菜单标题，请先删除或修改');
        return;
      }
      let index = 1;
      for (const value of buttonValues) {
        const {buttonId, title, id} = value;
        if (id) {
          // 存在id，属于编辑按钮信息
          menus.push({
            ...value,
            buttonId,
            title,
          });
        } else {
          // 不存在id，属于新增按钮信息
          // eslint-disable-next-line no-plusplus
          const dateString = (Date.now().toString() + index++);
          if (title) {
            menus.push({
              name: dateString,
              appId: menuCurrentApp.id,
              modCode: menuCurrentApp.id,
              isButton: '1',
              pageType: 'UNIEAP',
              buttonId,
              title,
              parentId: currentItem.id,
            });
          } else {
            message.warn('菜单标题不能为空');
            return;
          }
        }
      }
      const params = {
        menus,
        mod_code: menuCurrentApp.id,
        parent_id: currentItem.id,
      };
      const {code} = yield call(saveButtons, params);
      if (code === 200) {
        yield put({type: 'fetchDefinedButtons', payload: {newMenuId: currentItem.id}});
        message.success('保存成功');
      } else {
        message.error('保存失败');
      }
    },

    * deleteButtons({payload}, {put, call, select}) {
      const {currentItem, buttonValues} = yield select(state => state.adminMenu);
      const {button, index} = payload;
      const menus = [];
      menus.push(button);
      const {code, message: errorMessage} = yield call(deleteButtons, menus);
      if (code === 200) {
        buttonValues.splice(index, 1);
        yield put({type: 'updateState', payload: {buttonValues}});
        yield put({type: 'fetchDefinedButtons', payload: {newMenuId: currentItem.id}});
        message.success('删除成功');
      } else {
        message.error(errorMessage);
      }
    },

    * update({payload}, {call, put}) {
      const {item, modalType} = payload;
      if (item.isDefault) {
        item.isDefault = 1;
      } else {
        item.isDefault = 0;
      }
      const params = {
        domain: item.domainId,
        page: 1,
      };
      if (modalType === 'create') {
        yield call(postMenuCreate, item);
      } else {
        yield call(patchMenuCreate, item);
      }
      yield put({type: 'findAll', payload: params});
    },
    * deleteBatch({payload}, {call, put}) {
      yield put({type: 'requestMenus'});
      yield call(deleteMenus, payload);
      yield put({type: 'findAll', payload: 1});
    },

    * addMenu({payload}, {call, put}) {
      const {menus = []} = payload;
      const {code, message: resultMessage} = yield call(addMenu, menus);
      if (code === 200) {
        message.success(resultMessage);
        yield put({type: 'updateState', payload: {menuModalVisible: false}});
        const delay = (ms) => new Promise((resolve) => {
          setTimeout(resolve, ms);
        })
        yield call(delay, 2000);
        yield put({type: 'fetchMenu'});
        yield put({type: 'coreLayout/update', payload: {isFetchMenus: false}});
        yield put({type: 'coreLayout/fetchAppMenus'});
      } else {
        message.error(resultMessage);
      }
    },

    * updateMenu({payload}, {call, put}) {
      const {menus = []} = payload;
      const {code, message: resultMessage} = yield call(updateMenu, menus);
      if (code === 200) {
        message.success(resultMessage);
        const delay = (ms) => new Promise((resolve) => {
          setTimeout(resolve, ms);
        })
        yield call(delay, 2000);
        yield put({type: 'fetchMenu'});
        yield put({type: 'coreLayout/update', payload: {isFetchMenus: false}});
        yield put({type: 'coreLayout/fetchAppMenus'});
      } else {
        message.error(resultMessage);
      }
    }
  },
  reducers: {
    requestMenus(state) {
      return merge({}, state, {loading: true});
    },
    receiveMenus(state, {payload}) {
      return Object.assign({}, state, {loading: false}, payload);
    },
    showModal(state, {payload}) {
      return merge({}, state, payload, {modalVisible: true});
    },
    hideModal(state) {
      return merge({}, state, {modalVisible: false});
    },
    restoreState(state, {payload = {}}) {
      delete payload.currentItem;
      delete payload.menuModalVisible;
      delete payload.childrenCount;
      return {...state, ...payload};
    },
    updateMenuCurrentApp(state, {payload}) {
      return {...state, menuCurrentApp: payload};
    },
    updateState(state, {payload}) {
      return {...state, ...payload};
    },
    resetState() {
      return cloneDeep(initState);
    },
  },
};
