import http from "../utils/http";

/**
 * Created by huangzhangshu on 2018/3/26
 * URL列表
 */

export default {
  ADMIN_MENU_LIST: 'api/admin/menu/list',  // 菜单列
  ADMIN_MENU_CREATE: 'api/admin/menu/create',  // 创建 修改菜单
  ADMIN_MENU_DELETE: 'api/admin/menu/delete',   // 删除菜单
  ADMIN_MENU_BUTTONS: 'api/buttons',   // 获取菜单可用按钮
  ADMIN_MENU_BUTTONS_DEFINED: 'api/buttons/defined',   // 获取菜单按钮
  ADMIN_MENU_SAVE_BUTTONS: 'api/saveOrUpdateButtons',   // 保存菜单按钮
  ADMIN_MENU_DELETE_BUTTONS: 'api/deleteButtons',   // 删除菜单按钮
  ADMIN_DOMAIN_LIST: 'api/admin/domain/list',  // 组织列表
  ADMIN_DOMAIN_LISTS: 'api/admin/domain/lists',  // 组织列表
  ADMIN_DOMAIN_CREATE: 'api/admin/domain/create',  // 创建组织
  ADMIN_DOMAIN_UPDATE: 'api/admin/domain/update',  // 修改组织
  ADMIN_DOMAIN_DELETE: 'api/admin/domain/delete',  // 删除组织
  ADMIN_ROLE_LIST: 'api/admin/role/list',  // 角色列表
  ADMIN_ROLE_FIND: 'api/admin/role/',  // 获取角色信息
  ADMIN_ROLE_SEARCH: 'api/admin/role/search',  // 查询角色信息
  ADMIN_ROLE_FIND_USERS: 'api/admin/role/users/',  // 获取角色下用户
  ADMIN_ROLE_FIND_DETAIL: 'api/admin/role/detail/',  // 获取角色信息
  ADMIN_ROLE_CREATE: 'api/admin/role/create',  // 创建角色
  ADMIN_ROLE_DELETE: 'api/admin/role/delete',  // 删除角色
  ADMIN_USER_LIST: 'api/admin/user/list',  // 用户列
  ADMIN_USER_SEARCH: '/api/admin/user/search',  // search用户
  ADMIN_USER_FIND: 'api/admin/user/',  // 获取用户信息
  ADMIN_USER_FIND_ROLES: 'api/admin/user/roles',  // 获取用户角色
  ADMIN_USER_FIND_ROLES_2: 'api/admin/user/roles/',  // 获取用户角色
  ADMIN_USER_ALLOCATION: 'api/admin/user/allocation',
  ADMIN_USER_CREATE: 'api/admin/user/create',   // 创建用户
  ADMIN_USER_UPDATE: 'api/admin/user/update',   // 更新用户
  ADMIN_USER_DELETE: 'api/admin/user/delete',  // 删除列表
  ADMIN_USER_REMOVE_ROLE: 'api/admin/user/remove/role', // 删除用户关联的角色
  ADMIN_USER_REMOVE_ROLES: 'api/admin/user/remove/roles', // 批量删除用户关联的角色
  ADMIN_USER_AVATAR: 'api/admin/saveUserImg',  // 上传用户头像
  ADMIN_USER_RESET: 'api/admin/user/reset/password',  // 重置密码
  ADMIN_USER_FIND_UNIT: 'api/admin/user/unit/',  // 获取用户组织列表
  ADMIN_USER_FIND_SEARCH: 'api/admin/user/search/',  // search用户
  ADMIN_USER_UP_CODE_LIST: 'api/admin/user/getUpCodeList',
  ADMIN_USER_IMPORT: 'api/admin/user/importUser',
  ADMIN_USER_IMPORT_ROLE: 'api/admin/user/importUserRole',
  ADMIN_USER_EXPORT: 'api/admin/user/exportUserExcel',
  ADMIN_USER_DEPARTMENTS: 'api/admin/dept/list',
  ADMIN_CODELIST: 'api/codelist',
  ADMIN_DICTINMAP: 'api/dict/dictinmap',
  ADMIN_Region: 'api/dict/selectRegion',
  ADMIN_MENUS_APPS: 'api/allapps',
  ADMIN_MENUS: 'api/menus/',
  ADMIN_MODS: 'api/admin/author/mods',
  ADMIN_COPYS: 'api/admin/author/copys',
  ADMIN_UNIT_COPYS: 'api/sysset/copybycompcode',
  ADMIN_AUTHOR_MENUS: 'api/admin/author/menus',
  ADMIN_AUTHOR_RESOURCE: 'api/admin/author/resource',
  ADMIN_AUTHOR_RESOURCE_ROLE: 'api/admin/author/resource/role',
  ADMIN_AUTHOR_USERS: 'api/admin/author/users',
  ADMIN_AUTHOR_USERS_PAGE: 'api/admin/author/usersPage',
  ADMIN_AUTHOR_ROLES: 'api/admin/author/roles',
  ADMIN_AUTHOR_SAVE: 'api/admin/author/save',
  ADMIN_AUTHOR_SAVE_ROLE: 'api/admin/author/save/role',
  ADMIN_AUTHOR_QUERY: 'api/admin/author/query',
  ADMIN_AUTHOR_QUERY_ROLE: 'api/admin/author/query/role',
  ADMIN_ROLE_NEVER_USER: 'api/admin/role/never/users',
  // ADMIN_USER_BY_ROLE: 'api/admin/user/search',
  ADMIN_EMP_LIST: 'api/admin/user/emplist/',
  ADMIN_EMP_LIST_PAGE: 'api/admin/user/empListPage/',
  ADMIN_EMP: 'api/admin/user/emp/',
  ADMIN_BUTTON_USERS: 'api/admin/user/getFromSysUserPerm',
  ADMIN_BUTTON_ROLES: 'api/admin/author/roles',
  ADMIN_BUTTON_UNITS: 'api/admin/domain/getFromSysUserPermByUser',
  ADMIN_BUTTON_UNITS_ROLE: 'api/admin/domain/getUnitListByRole',
  ADMIN_BUTTON_COPYS: 'api/sysset/copysFromSysUserPerm',
  ADMIN_BUTTON_COPYS_ROLE: 'api/sysset/copysFromReourceByRole',
  ADMIN_BUTTON_MODS: 'api/getAppsFromSysUserPerm',
  ADMIN_BUTTON_MODS_ROLE: 'api/getAppsFromResourceRole',
  ADMIN_BUTTON_SOURCE: 'api/getMenusAndAuthorizeduttonsFromSysUserPerm',
  ADMIN_BUTTON_SOURCE_ROLE: 'api/getMenusAndAuthorizeduttonsRole',
  ADMIN_BUTTON_DEFINED_SOURCE: 'api/getMenusAndDefinedButtonsFromSysUserPerm',
  ADMIN_BUTTON_DEFINED_SOURCE_ROLE: 'api/getMenusAndDefinedButtonsRole',
  ADMIN_DOMAIN_LIST_SOURCE: 'api/organ/getTreeByOrgCode',
  ADMIN_DOMAIN_ADD_LIST_SOURCE: 'api/organ/getOrgByCode',
  ADMIN_UESR_FINDSYSPARA: 'api/dict/findSysPara',
  ADMIN_DOMAIN_DELETE_LIST_SOURCE: 'api/organ/deleteOrgByCode',
  ADMIN_DOMAIN_PUBLISH_LIST_SOURCE: 'api/organ/publishOrgan',
  ADMIN_DOMAIN_START_LIST_SOURCE: 'api/organ/start',
  ADMIN_DOMAIN_STOP_LIST_SOURCE: 'api/organ/stop',
  ADMIN_DOMAIN_SEARCH_LIST_SOURCE: 'api/organ/getTreeByOrgCode',
  ADMIN_DOMAIN_SAVEORUPDATE_LIST_SOURCE: 'api/organ/saveOrUpdate',
  ADMIN_DOMAIN_GETXMLJSON_LIST_SOURCE: 'api/organ/getxmljson',

  /** 组织职能关系 */
  ADMIN_COMPETENCY_ORGAN_LIST: 'api/organ/listbyorgcode',
  ADMIN_COMPETENCY_ORGAN_ORG: 'api/organ/getOrgByCode',
  ADMIN_COMPETENCY_ORGAN_FUNCTION: 'api/organ/function',
  ADMIN_COMPETENCY_ORGAN_SAVE_RELATION: 'api/organ/saveReleationList',
  ADMIN_COMPETENCY_ORGAN_FUNCTIONGROUPS: 'api/organ/functiongroups',
  /** 组织职能关系 */

  /** 业务委托关系 */
  ADMIN_ENTRUST_ORGAN_QUERY_MENU: 'api/business/querymenu',
  ADMIN_ENTRUST_BUSINESS_QUERY_LIST: 'api/business/querylist',
  ADMIN_ENTRUST_BUSINESS_SAVE: 'api/business/saveOrUpdate',
  ADMIN_ENTRUST_BUSINESS_DELETE: 'api/business/delete',
  /** 业务委托关系 */

  /** 部门业务关系 */
  ADMIN_TREE_ORGAN_QUERY_LIST: 'base/sysBusinessRelationScene/queryOrgan',
  ADMIN_TREE_DEPART_QUERY_LIST: 'base/sysBusinessRelationScene/querySysDeptTypeCheckBox',
  ADMIN_TREE_ENTITY_DEPT_QUERY_LIST: 'base/sysBusinessRelationScene/querySysDept',
  ADMIN_TREE_VIRTUAL_MEMBER_QUERY_LIST: 'base/sysBusinessRelationScene/querySysVirtualMember',
  ADMIN_TREE_SAVE: 'base/sysBusinessRelationScene/saveOrUpdateTree',
  ADMIN_TREE_SAVE_OR_UPDA: 'base/sysBusinessRelationScene/saveOrUpdateByTree',
  ADMIN_TREE_QUERY_RIGHT_TREE_LIST: 'base/sysBusinessRelationScene/querySysDeptVirtualTree',
  ADMIN_TREE_TREAT_GROUP_QUERY_LIST: 'base/sysBusinessRelationScene/querySysDiagnosisAndTreat',
  ADMIN_TREE_VIRTUAL_MEMBER_SAVE: 'base/sysBusinessRelationScene/saveOrUpdateMember',
  ADMIN_TREE_QUERY_CHECK_RULE: 'base/sysBusinessRelationScene/queryCheckRule',
  ADMIN_TREE_QUERY_SNOWID: 'base/sysBusinessRelationScene/getSnowId',
  ADMIN_TREE_VIRTUAL_MEMBER_DELETE: 'base/sysBusinessRelationScene/deleteMember',
  ADMIN_TREE_VIRTUAL_IMPORT_MEMBER_TREE: 'base/sysBusinessRelationScene/importVirtualMember',
  ADMIN_TREE_VIRTUAL_EXPORT_MEMBER_TREE: 'base/sysBusinessRelationScene/exportVirtualMember',
  // 获取生成ID
  ADMIN_TREE_MD_PK_GENERATE: 'api/md/pk/generateIds',
  ADMIN_QUERY_IS_EXIST_VIRTUAL_MEMBER: 'base/sysBusinessRelationScene/queryIsExistVirtualMember',

  /** 部门业务关系 */


  /** 业务权限(url,Bo_标识,方法授权)  */
  ADMIN_BUSI_API_LIST: 'api/admin/busi/list',  // 业务列表
  ADMIN_BUSI_API_SAVE_UPDATE: 'api/admin/busi/saveOrUpdate',  // 保存业务
  ADMIN_BUSI_API_DELETE: 'api/admin/busi/delete',   // 删除业务
  ADMIN_BUSI_API_SEARCH: 'api/admin/busi/search',  // search用户
  ADMIN_BUSI_API_ROLE_FIND: 'api/admin/busi/role',  // search用户

  /** 业务权限(url,Bo_标识,方法授权)  */
};
