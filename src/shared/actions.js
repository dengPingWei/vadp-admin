
// src/const/micro/actions.js 封装一下到时候引入使用方便
function emptyAction() {
  // 警告：提示当前使用的是空 Action
  console.warn('Current execute action is empty!')
}

class Actions {
  // 默认值为空 Action
  actions = {
      onGlobalStateChange: emptyAction,
      setGlobalState: emptyAction
  }

  // 设置 actions
  setActions(actions) {
      this.actions = actions
  }

  // 映射监听
  onGlobalStateChange(...args) {
      return this.actions.onGlobalStateChange(...args)
  }

  // 映射设置
  setGlobalState(...args) {
      return this.actions.setGlobalState(...args)
  }
}

const actions = new Actions()
export default actions
