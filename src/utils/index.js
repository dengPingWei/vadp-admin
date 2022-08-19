import lodash from 'lodash';


export const sortMenu = (sourceObj = {}, targetObj = {}) => {
    return Number(sourceObj.orderNum || 0) - Number(targetObj.orderNum || 0);
    // return Number(targetObj.orderNum || 0) - Number(sourceObj.orderNum || 0);
};

// 数据排序
export const sortTree = (trees = [], children = 'children') => {
    trees.sort(sortMenu);
    for (const childItem of trees) {
        sortTree(childItem.children || []);
    }
    return trees;
};

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
const arrayToTree = (array, id = 'id', pid = 'pid', children = 'children') => {
    let data = lodash.cloneDeep(array)
    let result = []
    let hash = {}
    data.forEach((item, index) => {
        hash[data[index][id]] = data[index]
    })

    data.forEach((item) => {
        let hashVP = hash[item[pid]]
        if (hashVP) {
            !hashVP[children] && (hashVP[children] = [])
            hashVP[children].push(item)
        } else {
            result.push(item)
        }
    })
    result = sortTree(result);
    return result;
};


const wrapAvatar = (url = '') => {
    if (!url) return '';
    let wrapUrl = url;
    if (wrapUrl[0] !== '/') wrapUrl = wrapUrl.concat('/');
    const servletRoot = localStorage.getItem('static_path') || '';
    return servletRoot.concat(wrapUrl);
}

export const wrapUrlByContextPath = (url = '') => {
    if (!url) return '';
    let wrapUrl = url;
    if (wrapUrl[0] !== '/') wrapUrl = wrapUrl.concat('/');
    const servletRoot = window.REACT_APP_CONFIG ? window.REACT_APP_CONFIG.contextPath || '' : '';
    return servletRoot.concat(wrapUrl);
}

/**
 * 封装image url
 * @param imageUrl
 */
const wrapImage = (imageUrl) => {
    if (!imageUrl) return null;
    const host = ''; //window.location.origin;
    return host.concat('/cors/', imageUrl);
}

/**
 * 校验数据.editorconfig
 .eslintrc
 * @param value
 * @param type
 */
const test = (value, type) => {
    if (!value || !type) return 'pass';
    if (type === 'Email' || type === 'email') {
        const emailReg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if (!emailReg.test(value)) return '请输入正确的邮箱格式';
    } else if (type === 'mobile') {
        const mobileReg = /^(13+\d{9})|(159+\d{8})|(153+\d{8})$/;
        if (!mobileReg.test(value)) return '请输入正确的手机号码';
    }
    return 'pass';
}

/**
 * 校验是否有特殊字符
 * @param str
 * @returns {boolean}
 */
const filterRule = (str = '') => {
    // (\_) 暂时去掉下划线过滤
    const containSpecial = RegExp(/[(\ )(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\-)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\,)(\.)(\/)(\<)(\>)(\?)(\)]+/);
    return containSpecial.test(str);
}

const filterChinese = (str = '') => {
    return escape(str).indexOf("%u") >= 0;
}

const getTreeNodeById = (trees = [], id) => {
    if (!trees || !id) return {};
    for (const tree of trees) {
        if (tree.id === id) return tree;
        if (tree.children) {
            const findResult = getTreeNodeById(tree.children, id);
            if(findResult) return findResult;
        }
    }
}

export {arrayToTree, wrapImage, wrapAvatar, test, filterRule, filterChinese, getTreeNodeById};
