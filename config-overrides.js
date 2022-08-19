module.exports = {
    webpack: (config) => {
        config.output.library = `ReactApp2`;
        config.output.libraryTarget = "umd";
        // config.jsonpFunction = `webpackJsonp_reactApp1`;
        config.output.globalObject = "windowJsonp_ReactApp2";
        return config
    },
    devServer: (configFunction) => {
        const config = configFunction;
        // 配置跨域请求头，解决开发环境的跨域问题
        config.headers = {
            "Access-Control-Allow-Origin": "*",
        };
        // 配置 history 模式
        config.historyApiFallback = true;
        config.hot = false;
        config.watchContentBase = false;
        config.liveReload = false;
        return config;
    },
}