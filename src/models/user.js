import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep'
import {message} from '@vadp/ui';
/**
 * reducers
 */
const initState = {
  // currentUser:{
  //   account: "admin",
  //   accountEnabled: "T",
  //   accountLocked: "F",
  //   accountLockedReason: null,
  //   acctMonth: "08",
  //   acctYear: "2022",
  //   activeFlag: "T",
  //   avatar: null,
  //   avatarId: null,
  //   birthdate: null,
  //   category: "10",
  //   compCode: "1\r\n",
  //   compName: "AT望海医院",
  //   copyCode: "001",
  //   createdBy: null,
  //   creationDate: null,
  //   credentialsNumber: null,
  //   credentialsType: null,
  //   deletionDate: null,
  //   deptCode: null,
  //   deptId: null,
  //   deptName: null,
  //   description: "管理员",
  //   email: null,
  //   empCode: null,
  //   fax: null,
  //   homeAddress: null,
  //   homeTelephone: null,
  //   id: "admin",
  //   lastMod: "sys",
  //   lastUpdateDate: null,
  //   lastUpdatedBy: null,
  //   mobileTelephone: null,
  //   name: "admin",
  //   nationality: null,
  //   needUpdatePassword: null,
  //   officeTelephone: null,
  //   openDoubleFactor: null,
  //   passwordChangedDate: 1596095404693,
  //   passwordOutDate: false,
  //   roles: [],
  //   sex: null,
  //   showName: null,
  //   sjAccount: null,
  //   spell: null,
  //   ssoType: "未授权注册",
  //   type: "1",
  //   units: [],
  //   uuid: "63eb55479e2d487489a27ec683cfd074",
  //   vhVadpSso: "0",
  // },
  // forcePwChange: false,
  // list: [],
  // loading: false,
  // passwordCaseFlag: "否",
  // passwordFormVisible: false,
  // passwordLength: 8,
  // passwordMetacharacters: "",
  // passwordStrongFlag: "否",
};

export default {
  namespace: 'user',
  state: cloneDeep(initState),
  effects: {},
  reducers: {
    update(state, {payload}) {
      return {...state, ...payload};
    },
  },
};
