import { SymbolPinia } from "./rootStore";
import { App, effectScope, markRaw, ref } from "vue";

export function createPinia() {
  // 创建一个 scope 独立空间
  const scope = effectScope(true);
  // run 方法的返回值就是回调函数 fn 的返回值
  const state = scope.run(() => ref({}));

  // 用 markRow 标记，防止 pinia 被再次的做响应式处理，不让它变成响应式的
  const pinia = markRaw({
    install(app: App) {
      pinia._a = app;
      app.provide(SymbolPinia, pinia);
    },
    state, // 记录 state
    _a: null, // 记录 app
    _e: scope, // 记录 effectScope
    _s: new Map(), // 记录所有的 store
  });

  return pinia;
}
