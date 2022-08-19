/**
 * Created by huangzhangshu on 2018/4/24
 */

import CodeTypes from './CodeTypes';
import InputType from '../utils/InputType';
import {test} from '../utils';

// 分页参数
export const pageSizeOptions = [
  '5',
  '10',
  '20',
  '50',
  '100',
  '200',
]

// 计算分页参数
export function calcPageOptions(pageNum, pageSize, recordCount) {
  if (pageNum * pageSize > recordCount) {
    const intNum = Math.ceil(recordCount / pageSize);
    if (intNum === 1) {
      return {pageNum: 1, pageSize};
    } else {
      return {pageNum: intNum, pageSize};
    }
  } else {
    return {pageNum, pageSize};
  }
}

export const miniFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 19},
  },
}

export const searchFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 0},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}

export const halfFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

export const fullFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 20},
  },
}

export const roleColumns = [
  {
    field: 'roleCode',
    text: '角色编码',
    type: InputType.input,
    span: 8,
  }, {
    field: 'creationDate',
    text: '创建时间',
    type: InputType.input,
    span: 8,
  }, {
    field: 'lastUpdateDate',
    text: '修改时间',
    type: InputType.input,
    span: 8,
    className: 'rightItem',
  }, {
    field: 'name',
    text: '角色名称',
    errorMessage: '请输入描述',
    required: true,
    type: InputType.input,
    span: 8,
    maxlength: 16,
  }, {
    field: 'createdBy',
    text: '创建人',
    type: InputType.input,
    span: 8,
  }, {
    field: 'lastUpdatedBy',
    text: '修改人',
    type: InputType.input,
    span: 8,
    className: 'rightItem',
  },
  {
    field: 'roleAdminTypeName',
    text: '角色类型',
    type: InputType.input,
    span: 8,
  },
  {
    field: 'description',
    text: '角色描述',
    errorMessage: '请输入编码',
    required: false,
    type: InputType.textarea,
    span: 24,
    className: 'rightItem',
    autosize: {minRows: 1, maxRows: 6},
    maxlength: 120,
  },
]

export const unitColumns = [
  {
    isTitle: true,
    title: '单位信息',
  },
  {
    field: 'code',
    text: '编码',
    errorMessage: '请输入编码',
    required: true,
    type: InputType.input,
    span: 12,
  }, {
    field: 'name',
    text: '名称',
    errorMessage: '请输入名称',
    required: true,
    type: InputType.input,
    maxlength: '25',
    span: 12,
  }, {
    field: 'institutionTypeCode',
    text: '事业类别',
    nameField: 'codeName',
    valueField: 'codeValue',
    type: InputType.select,
    codeType: CodeTypes.institution_type_code,
    span: 12,
  }, {
    field: 'subjectionCode',
    text: '医院隶属',
    nameField: 'codeName',
    valueField: 'codeValue',
    type: InputType.select,
    codeType: CodeTypes.subjection_code,
    span: 12,
  },
  {
    field: 'hospAttrCode',
    text: '医院性质',
    type: InputType.select,
    nameField: 'hospAttrName',
    valueField: 'hospAttrCode',
    codeType: CodeTypes.hospattr,
    span: 12,
  }, {
    field: 'taxNo',
    text: '税务证号',
    type: InputType.input,
    maxlength: '20',
    span: 12,
  }, {
    field: 'hospLevelCode',
    text: '医院等级',
    type: InputType.select,
    nameField: 'hospLevelName',
    valueField: 'hospLevelCode',
    codeType: CodeTypes.hosplevel,
    span: 12,
  }, {
    field: 'accManager',
    text: '财务会计',
    type: InputType.input,
    maxlength: '40',
    span: 12,
  },
  {
    field: 'compLeader',
    text: '医院领导',
    type: InputType.input,
    maxlength: '40',
    span: 12,
  }, {
    field: 'compTypeCode',
    text: '单位类别',
    nameField: 'codeName',
    valueField: 'codeValue',
    type: InputType.select,
    codeType: CodeTypes.comp_type_code,
    span: 12,
  }, {
    field: 'compLevelCode',
    text: '单位级别',
    errorMessage: '请选择单位级别',
    required: true,
    nameField: 'codeName',
    valueField: 'codeValue',
    type: InputType.select,
    codeType: CodeTypes.compLevelCodes,
    span: 12,
  }, {
    field: 'isCount',
    text: '市或区县',
    errorMessage: '请选择市或区县',
    required: true,
    type: InputType.radio,
    defaultValue: '1',
    nameField: 'codeName',
    valueField: 'codeValue',
    codeType: CodeTypes.coreIsCount,
    options: [],
    span: 12,
  },
  {
    isTitle: true,
    title: '联系方式',
  },
  {
    field: 'prov',
    text: '省',
    type: InputType.select,
    nameField: 'cn',
    valueField: 'cd',
    codeType: CodeTypes.prov,
    span: 12,
  }, {
    field: 'city',
    text: '市',
    nameField: 'cn',
    valueField: 'cd',
    type: InputType.select,
    codeType: CodeTypes.city,
    span: 12,
  }, {
    field: 'adminArea',
    text: '县',
    nameField: 'cn',
    valueField: 'cd',
    type: InputType.select,
    codeType: CodeTypes.adminArea,
    span: 12,
  }, {
    field: 'postCode',
    text: '邮政编码',
    type: InputType.int,
    maxlength: '6',
    span: 12,
  },
  {
    field: 'linkman',
    text: '联系人',
    type: InputType.input,
    maxlength: '40',
    span: 12,
  }, {
    field: 'linkPhone',
    text: '联系电话',
    type: InputType.int,
    maxlength: '20',
    span: 12,
  }, {
    field: 'disEmail',
    text: 'Email',
    type: InputType.email,
    maxlength: '40',
    testType: 'email',
    span: 12,
  }, {
    field: 'budgetCode',
    text: '财政预算代码',
    type: InputType.email,
    maxlength: '40',
    testType: 'budgetCode',
    span: 12,
  }, {
    field: 'address',
    text: '详细地址',
    type: InputType.input,
    maxlength: '40',
    span: 24,
  },
  {
    field: 'description',
    text: '描述',
    type: InputType.textarea,
    span: 24,
    maxlength: '120',
  },
]

export const ButtonColumns = [
  {
    field: 'user',
    text: '用户:',
    errorMessage: '请输入用户',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'account',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'copy',
    text: '账套:',
    required: false,
    span: 7,
    nameField: 'copyName',
    valueField: 'copyCode',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
];

export const RoleButtonColumns = [
  {
    field: 'role',
    text: '角色:',
    errorMessage: '请输入角色',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'roleCode',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'copy',
    text: '账套:',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
];

export const authorUserColumns = [
  {
    field: 'user',
    text: '用户:',
    errorMessage: '请输入用户',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'account',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'copy',
    text: '账套:',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
]

export const authorUserColumnsForVadp = [
  {
    field: 'user',
    text: '用户:',
    errorMessage: '请输入用户',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'account',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
  {
    field: 'search',
    span: 3,
    type: InputType.search,
  }
]

export const authorUserSearchColumns = [
  {
    field: 'user',
    text: '用户:',
    errorMessage: '请输入用户',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'account',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'copy',
    text: '账套:',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
]

export const authorUserSearchColumnsForVadp = [
  {
    field: 'user',
    text: '用户:',
    errorMessage: '请输入用户',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'account',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },{
    field: 'search',
    span: 3,
    type: InputType.search,
  }
]

export const authorRoleColumns = [
  {
    field: 'role',
    text: '角色:',
    errorMessage: '请输入角色',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'roleCode',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    valueField: 'code',
    nameField: 'name',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'copy',
    text: '账套:',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
]

export const authorRoleColumnsForVadp = [
  {
    field: 'role',
    text: '角色:',
    errorMessage: '请输入角色',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'roleCode',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    valueField: 'code',
    nameField: 'name',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: true,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }
]

export const authorRoleSearchColumns = [
  {
    field: 'role',
    text: '角色:',
    errorMessage: '请输入角色',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'roleCode',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    valueField: 'code',
    nameField: 'name',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'copy',
    text: '账套:',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'code',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'search',
    span: 3,
    type: InputType.search,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },
]


export const authorRoleSearchColumnsForVadp = [
  {
    field: 'role',
    text: '角色:',
    errorMessage: '请输入角色',
    required: true,
    span: 7,
    nameField: 'showName',
    valueField: 'roleCode',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'unit',
    text: '组织:',
    errorMessage: '请输入组织',
    required: true,
    span: 7,
    valueField: 'code',
    nameField: 'name',
    style: {width: 200},
    type: InputType.select,
  }, {
    field: 'mod',
    text: '系统:',
    errorMessage: '请输入系统',
    required: false,
    span: 7,
    nameField: 'name',
    valueField: 'id',
    style: {width: 200},
    type: InputType.select,
  },{
    field: 'search',
    span: 3,
    type: InputType.search,
  },
]
