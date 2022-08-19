import http from '../utils/http';
import UrlContacts from '../common/UrlContacts';

export async function fetchMenuAll(params) {
  return http.fetch(UrlContacts.ADMIN_MENU_LIST, params);
}

export async function postMenuCreate(params) {
  return http.post(UrlContacts.ADMIN_MENU_CREATE, params);
}

export async function patchMenuCreate(params) {
  return http.patch(UrlContacts.ADMIN_MENU_CREATE, params);
}

export async function deleteMenus(params) {
  return http.post(UrlContacts.ADMIN_MENU_DELETE, params);
}

export async function fetchDomainAll(params) {
  return http.fetch(UrlContacts.ADMIN_DOMAIN_LIST, params);
}

export async function fetchUnits(params) {
  return http.fetch(UrlContacts.ADMIN_DOMAIN_LISTS, params);
}

export async function postDomainCreate(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_CREATE, params);
}

export async function postDomainUpdate(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_UPDATE, params);
}

export async function deleteDomains(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_DELETE, params);
}

export async function findRoleAll(params) {
  return http.fetch(UrlContacts.ADMIN_ROLE_LIST, params);
}

export async function findRole(id) {
  return http.fetch(UrlContacts.ADMIN_ROLE_FIND.concat(id));
}

export async function findUserInRole(id) {
  return http.fetch(UrlContacts.ADMIN_ROLE_FIND_DETAIL.concat(id));
}

export async function postRoleCreate(params) {
  return http.post(UrlContacts.ADMIN_ROLE_CREATE, params);
}

export async function patchRoleCreate(params) {
  return http.patch(UrlContacts.ADMIN_ROLE_CREATE, params);
}

export async function deleteRole(params) {
  return http.post(UrlContacts.ADMIN_ROLE_DELETE, params);
}

export async function findUserAll(params) {
  return http.fetch(UrlContacts.ADMIN_USER_LIST, params);
}

export async function fetchUserForSearch(params) {
  return http.fetch(UrlContacts.ADMIN_USER_SEARCH, params);
}

export async function findUser(id) {
  return http.fetch(UrlContacts.ADMIN_USER_FIND.concat(id));
}

export async function fetchAllocation(params) {
  return http.post(UrlContacts.ADMIN_USER_ALLOCATION, params);
}

export async function postUserCreate(params) {
  return http.post(UrlContacts.ADMIN_USER_CREATE, params);
}

export async function postUserUpdate(params) {
  return http.post(UrlContacts.ADMIN_USER_UPDATE, params);
}

export async function searchUser(params) {
  return http.fetch(UrlContacts.ADMIN_USER_FIND_SEARCH, params);
}

export async function findUpCodeList(params = {}) {
  return http.fetch(UrlContacts.ADMIN_USER_UP_CODE_LIST, params);
}

export async function fetchRoleByUser(params) {
  return http.fetch(UrlContacts.ADMIN_USER_FIND_ROLES, params);
}

export async function fetchRoleByUser2(id) {
  return http.fetch(UrlContacts.ADMIN_USER_FIND_ROLES_2.concat(id));
}

export async function fetchRoleNeverUser(params) {
  return http.fetch(UrlContacts.ADMIN_ROLE_NEVER_USER, params);
}


export async function postRoleByUser(params) {
  return http.post(UrlContacts.ADMIN_USER_FIND_ROLES, params);
}

export async function patchUserCreate(params) {
  return http.patch(UrlContacts.ADMIN_USER_CREATE, params);
}

export async function deleteUser(params) {
  return http.post(UrlContacts.ADMIN_USER_DELETE, params);
}

export async function uploadAvatar(params) {
  return http.postForm(UrlContacts.ADMIN_USER_AVATAR, params);
}

export async function importUser(params) {
  return http.postForm(UrlContacts.ADMIN_USER_IMPORT, params);
}

export async function importRole(params) {
  return http.postForm(UrlContacts.ADMIN_USER_IMPORT_ROLE, params);
}

export async function exportUser(params) {
  return http.getBlob(UrlContacts.ADMIN_USER_EXPORT, params);
}

export async function findDept() {
  return http.fetch(UrlContacts.ADMIN_USER_DEPARTMENTS);
}

export async function fetchResetPassword(params) {
  return http.post(UrlContacts.ADMIN_USER_RESET, params);
}

export async function fetchUnitByAccount(account) {
  return http.fetch(UrlContacts.ADMIN_USER_FIND_UNIT.concat(account));
}

export async function fetchRoleByUserId(userId) {
  return http.fetch(UrlContacts.ADMIN_USER_FIND_ROLES.concat('/').concat(userId));
}

export async function findUserByRole(params) {
  return http.get(UrlContacts.allocationVisible, params);
}


export async function searchRole(params) {
  return http.fetch(UrlContacts.ADMIN_ROLE_SEARCH, params);
}

export async function getUsersByRole(roleId) {
  return http.fetch(UrlContacts.ADMIN_ROLE_FIND_USERS.concat(roleId));
}

export async function fetchCodelist(params) {
  return http.post(UrlContacts.ADMIN_CODELIST, params);
}

export async function fetchDictinmap() {
  return http.fetch(UrlContacts.ADMIN_DICTINMAP);
}

export async function fetchRegion(params) {
  return http.fetch(UrlContacts.ADMIN_Region, params);
}

export async function fetchAppsForMenu() {
  return http.fetch(UrlContacts.ADMIN_MENUS_APPS);
}

export async function queryAppList() {
  return http.fetch('api/apps/');
}

export async function addMenu(params) {
  return http.post('api/admin/menu/add', params);
}

export async function updateMenu(params) {
  return http.post('api/admin/menu/update', params);
}

export async function fetchMenus(appId) {
  return http.fetch(UrlContacts.ADMIN_MENUS.concat(appId));
}

export async function fetchMods(params) {
  return http.fetch(UrlContacts.ADMIN_MODS, params);
}

export async function fetchCopys(params) {
  return http.fetch(UrlContacts.ADMIN_UNIT_COPYS, params);
}

export async function fetchAuthorMenus(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_MENUS, params);
}

export async function fetchAuthorResource(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_RESOURCE, params);
}

export async function fetchAuthorResourceByRole(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_RESOURCE_ROLE, params);
}

export async function fetchAuthorUsers(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_USERS, params);
}

export async function fetchAuthorUsersPage(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_USERS_PAGE, params);
}

export async function fetchAuthorRoles(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_ROLES, params);
}

export async function saveAuthor(params) {
  return http.post(UrlContacts.ADMIN_AUTHOR_SAVE, params);
}

export async function saveAuthorByRole(params) {
  return http.post(UrlContacts.ADMIN_AUTHOR_SAVE_ROLE, params);
}

export async function fetchAuthorUserTable(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_QUERY, params);
}

export async function fetchAuthorUserTableByRole(params) {
  return http.fetch(UrlContacts.ADMIN_AUTHOR_QUERY_ROLE, params);
}

export async function findEmpList(compCode) {
  return http.fetch(UrlContacts.ADMIN_EMP_LIST.concat(compCode));
}

export async function findEmpListPage(params = {}) {
  return http.fetch(UrlContacts.ADMIN_EMP_LIST_PAGE, params);
}

export async function findEmp(empCode) {
  return http.fetch(UrlContacts.ADMIN_EMP.concat(empCode));
}

export async function removeRoleForUser(params) {
  return http.post(UrlContacts.ADMIN_USER_REMOVE_ROLE, params);
}

export async function removeRolesForUser(params) {
  return http.post(UrlContacts.ADMIN_USER_REMOVE_ROLES, params);
}

export async function fetchButtons(params) {
  return http.fetch(UrlContacts.ADMIN_MENU_BUTTONS, params);
}

export async function fetchDefinedButtons(params) {
  return http.fetch(UrlContacts.ADMIN_MENU_BUTTONS_DEFINED, params);
}

export async function saveButtons(params) {
  return http.post(UrlContacts.ADMIN_MENU_SAVE_BUTTONS, params);
}

export async function deleteButtons(params) {
  return http.post(UrlContacts.ADMIN_MENU_DELETE_BUTTONS, params);
}

export async function fetchAuthorForUser() {
  return http.get(UrlContacts.ADMIN_BUTTON_USERS);
}

export async function fetchAuthorForRole(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_ROLES, params);
}

export async function fetchAuthorForUnit(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_UNITS, params);
}

export async function fetchAuthorForUnitByRole(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_UNITS_ROLE, params);
}

export async function fetchAuthorForCopy(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_COPYS, params);
}

export async function fetchAuthorForCopyByRole(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_COPYS_ROLE, params);
}

export async function fetchAuthorForMod(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_MODS, params);
}

export async function fetchAuthorForModByRole(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_MODS_ROLE, params);
}

export async function fetchButtonSource(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_SOURCE, params);
}

export async function fetchButtonSourceByRole(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_SOURCE_ROLE, params);
}

export async function fetchButtonDefinedSource(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_DEFINED_SOURCE, params);
}

export async function fetchButtonDefinedSourceByRole(params) {
  return http.get(UrlContacts.ADMIN_BUTTON_DEFINED_SOURCE_ROLE, params);
}

export async function fetchTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_LIST_SOURCE, params);
}

export async function fetchAddTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_ADD_LIST_SOURCE, params);
}

export async function fetchUserFindSysPara(params) {
  return http.get(UrlContacts.ADMIN_UESR_FINDSYSPARA, params);
}

export async function fetchDeleteTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_DELETE_LIST_SOURCE, params);
}

export async function fetchPublishTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_PUBLISH_LIST_SOURCE, params);
}
export async function fetchStartTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_START_LIST_SOURCE, params);
}

export async function fetchStopTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_STOP_LIST_SOURCE, params);
}

export async function fetchSearchTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_SEARCH_LIST_SOURCE, params);
}

export async function fetchSaveOrUpdataTreeList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_SAVEORUPDATE_LIST_SOURCE, params);
}

export async function fetchXmlJsonList(params) {
  return http.post(UrlContacts.ADMIN_DOMAIN_GETXMLJSON_LIST_SOURCE, params);
}

export async function fetchCompetencyList(params) {
  return http.post(UrlContacts.ADMIN_COMPETENCY_ORGAN_LIST, params);
}

export async function fetchCompetencyOrg(params) {
  return http.post(UrlContacts.ADMIN_COMPETENCY_ORGAN_ORG, params);
}

export async function fetchCompetencyFunction() {
  return http.post(UrlContacts.ADMIN_COMPETENCY_ORGAN_FUNCTION);
}

export async function fetchCompetencySaveRelation(params) {
  return http.post(UrlContacts.ADMIN_COMPETENCY_ORGAN_SAVE_RELATION, params);
}

export async function fetchCompetencyFunctionGroups() {
  return http.post(UrlContacts.ADMIN_COMPETENCY_ORGAN_FUNCTIONGROUPS);
}

/** 业务委托关系 */
export async function fetchEntrustMenu(params) {
  return http.post(UrlContacts.ADMIN_ENTRUST_ORGAN_QUERY_MENU, params);
}

export async function fetchEntrustBusinessList(params) {
  return http.get(UrlContacts.ADMIN_ENTRUST_BUSINESS_QUERY_LIST, params);
}

export async function fetchEntrustBusinessSave(params) {
  return http.post(UrlContacts.ADMIN_ENTRUST_BUSINESS_SAVE, params);
}

export async function fetchEntrustBusinessDelete(params) {
  return http.post(UrlContacts.ADMIN_ENTRUST_BUSINESS_DELETE, params);
}
export async function queryIsExistVirtualMember(params) {
  return http.postForm(UrlContacts.ADMIN_QUERY_IS_EXIST_VIRTUAL_MEMBER, params);
}

/** 业务委托关系 */

/** 部门业务关系 */
export async function fetchTreeOrganQueryList(params) {
  return http.post(UrlContacts.ADMIN_TREE_ORGAN_QUERY_LIST, params);
}
export async function fetchTreeDepartQueryList(params) {
  return http.post(UrlContacts.ADMIN_TREE_DEPART_QUERY_LIST, params);
}
export async function fetchTreeEntityDeptQueryList(params) {
  return http.post(UrlContacts.ADMIN_TREE_ENTITY_DEPT_QUERY_LIST, params);
}
export async function fetchTreeVirtualMemberQueryList(params) {
  return http.post(UrlContacts.ADMIN_TREE_VIRTUAL_MEMBER_QUERY_LIST, params);
}
export async function fetchTreeSave(params) {
  return http.post(UrlContacts.ADMIN_TREE_SAVE, params);
}
export async function saveOrUpdateByTree(params) {
  return http.post(UrlContacts.ADMIN_TREE_SAVE_OR_UPDA, params);
}
export async function fetchTreeQueryRightTreeList(params) {
  return http.post(UrlContacts.ADMIN_TREE_QUERY_RIGHT_TREE_LIST, params);
}
export async function fetchTreeQueryTreatGroupList(params) {
  return http.post(UrlContacts.ADMIN_TREE_TREAT_GROUP_QUERY_LIST, params);
}
export async function fetchTreeVirtualMemberSave(params) {
  return http.post(UrlContacts.ADMIN_TREE_VIRTUAL_MEMBER_SAVE, params);
}
export async function fetchQueryCheckRule(params) {
  return http.post(UrlContacts.ADMIN_TREE_QUERY_CHECK_RULE, params);
}
export async function fetchQuerySnowId(params) {
  return http.post(UrlContacts.ADMIN_TREE_QUERY_SNOWID, params);
}
export async function deleteVirtualMember(params) {
  return http.post(UrlContacts.ADMIN_TREE_VIRTUAL_MEMBER_DELETE, params);
}

export async function importVirtualTree(params) {
  return http.postForm(UrlContacts.ADMIN_TREE_VIRTUAL_IMPORT_MEMBER_TREE, params);
}

export async function exportVirtualTree(params) {
  return http.getBlob(UrlContacts.ADMIN_TREE_VIRTUAL_EXPORT_MEMBER_TREE, params);
}
export async function fetchGetNodeIdList(params) {
  return http.get(UrlContacts.ADMIN_TREE_MD_PK_GENERATE, params);
}
/** 部门业务关系 */


/** url,BO_标识,方法名业务授权 */

export async function findBusiApiAll(params) {
  return http.fetch(UrlContacts.ADMIN_BUSI_API_LIST, params);
}

export async function findRoleByMenuId(params) {
  return http.fetch(UrlContacts.ADMIN_BUSI_API_ROLE_FIND, params);
}

export async function postBusiApiSaveOrUpdate(params) {
  return http.post(UrlContacts.ADMIN_BUSI_API_SAVE_UPDATE, params);
}

export async function postBusiApiUpdate(params) {
  return http.post(UrlContacts.ADMIN_BUSI_API_UPDATE, params);
}

export async function deleteBusiApi(params) {
  return http.post(UrlContacts.ADMIN_BUSI_API_DELETE, params);
}

export async function searchBusiApi(params) {
  return http.fetch(UrlContacts.ADMIN_BUSI_API_SEARCH ,params);
}

/** url,BO_标识,方法名业务授权 */
