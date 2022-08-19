// 判断是否IE浏览器
window.app = {}
window.app.isIE = function () {
    const {userAgent} = window.navigator;
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; //判断是否IE<11浏览器
    const isEdge = userAgent.indexOf('Edge') > -1 && !isIE; //判断是否IE的Edge浏览器
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
    return isIE || isEdge || isIE11;
}
// 返回rsa加密结果
window.app.rsaString = function (source) {
    return source;
};