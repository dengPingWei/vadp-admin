import './public-path'
import './utils/windowApp';
import $ from 'jquery'
import dva from 'dva';
import { createBrowserHistory as createHistory } from 'history';
import 'antd/dist/antd.css';
import '@vadp/ui/lib/vadp-ui.css';
import './index.css';
import models from './models';
import dataAll from './utils/data';

import actions from './shared/actions'
window.$ = $
let originFn = document.body.appendChild.bind(document.body)
function render(props = {}) {
  const { container, router, clientType } = props;
  // 1. Initialize
  const app = dva({
      history: createHistory()
  });
  // 2. Plugins
  // app.use({});
  // 3. Model
  models.forEach((m) => {
    app.model(m);
  });
  // 4. Router
  app.router(require('./App').default);
  // 5. Start
  app.start('#root');
  // 改变子应用的弹窗popup的位置
  redirectPopup(container)
}
function redirectPopup(container) {
  // // 子应用中需要挂载到子应用的弹窗的className，用作标记
  // const addPopup = 'ant-select-dropdown'
  // const editPopup = 'ant-modal-root'
  // const whiteList = [addPopup, editPopup]
  
  // 保存原有document.body.appendChild方法
  let originFn = document.body.appendChild.bind(document.body)
  // // 重写appendChild方法
  document.body.appendChild = (dom) => {
    if(dom && window.__POWERED_BY_QIANKUN__) {
      container.querySelector('#root').appendChild(dom)
    } else {
      originFn(dom)
    }
  }
}
/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('react app bootstraped');
}
/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev, '变更后的状态');
    actions.setActions({ ...state })
    // props.setGlobalState({ ...state, age: 18, });
  });
  actions.setActions({ ...props.store })
  render(props)
  // const root = ReactDOM.createRoot(document.getElementById('root'))
}
/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
 export async function unmount(props) {
    console.log("ReactMicroApp unmount");  
    document.body.appendChild = originFn
    // ReactDOM.unmountComponentAtNode(
    //   props.container ? props.container.querySelector('#root') : document.getElementById('root'),
    // );
}
/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props) {
  console.log('update props', props);
}
if (!window.__POWERED_BY_QIANKUN__) {
  actions.setActions({ ...dataAll })
  render()
}
if (process.env.NODE_ENV === "development") {
    window["ReactApp2"] = {};
    window["ReactApp2"].bootstrap = bootstrap;
    window["ReactApp2"].mount = mount;
    window["ReactApp2"].unmount = unmount;
}