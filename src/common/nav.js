// import {BasicLayout} from '@vadp/layouts';

import {
  DomainPage,
  UserPage,
  MenuPage,
  RolePage,
  RulePage,
  QueryPage,
  AuthorRoleQuery,
  AuthorRolePage,
  ButtonPage,
  AuthorBusiPage,
  RoleButtonPage,
  Competency,
  Entrust,
  // Tree
} from '../routes';
export function getNavData() {
  return [
    {
      name: '组织机构',
      path: '/domains',
      component: DomainPage,
    },
    {
      name: '组织职能关系',
      path: '/competency',
      component: Competency,
    },
    {
      name: '业务委托关系',
      path: '/entrust',
      component: Entrust,
    },
    {
      name: '用户管理',
      path: '/users',
      component: UserPage,
    },
    {
      name: '角色管理',
      path: '/roles',
      component: RolePage,
    },
    {
      name: '功能管理',
      path: '/menus',
      component: MenuPage,
    },

    // 权限管理

    // {
    //   name: '权限管理',
    //   path: '/author',
    //   children: [
        {
          name: '用户权限',
          path: '/author/user/page',
          component: RulePage,
        },
        {
          name: '用户按钮权限',
          path: '/author/button/page',
          component: ButtonPage,
        },
        {
          name: '角色按钮权限',
          path: '/author/button/rolepage',
          component: RoleButtonPage,
        },
        {
          name: '用户权限查询',
          path: '/author/user/query',
          component: QueryPage,
        },
        {
          name: '角色权限',
          path: '/author/role/page',
          component: AuthorRolePage,
        },
        {
          name: '角色权限查询',
          path: '/author/role/query',
          component: AuthorRoleQuery,
        },
        {
          name: '业务权限',
          path: '/author/busi/page',
          component: AuthorBusiPage,
        },
    //   ],
    // },
  ];
}
