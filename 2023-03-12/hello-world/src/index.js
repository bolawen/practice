import Vue from "vue";

const getComponentName = (fileName) => {
  return fileName
    .split("/")
    .pop()
    .replace(/\.\w+$/, "");
};

export function autoGlobalRegister(path) {
  const requireComponent = require.context(path, false, /\w+\.(vue)$/);
  requireComponent.keys().forEach((fileName) => {
    const componentConfig = requireComponent(fileName);
    const componentName = getComponentName(fileName);
    Vue.component(componentName, componentConfig.default || componentConfig);
  });
}