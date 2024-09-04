function iter(obj, callbackFn) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop) || prop === "clearInterval") {
      callbackFn(prop);
    }
  }
}

class SnapshotSandbox {
  constructor(name) {
    this.name = name;
    this.modifyPropsMap = {};
    this.windowSnapshot = {};
    this.sandboxRunning = true;
    this.type = "SnapshotSandbox";
    this.deletePropsSet = new Set();
  }

  active() {
    this.windowSnapshot = {};

    iter(window, (prop) => {
      this.windowSnapshot[prop] = window[prop];
    });

    Object.keys(this.modifyPropsMap).forEach((p) => {
      window[p] = this.modifyPropsMap[p];
    });

    this.deletePropsSet.forEach((p) => {
      delete window[p];
    });

    this.sandboxRunning = true;
  }

  inactive() {
    this.modifyPropsMap = {};
    this.deletePropsSet.clear();

    iter(window, (prop) => {
      if (this.windowSnapshot[prop] !== window[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    });

    iter(this.windowSnapshot, (prop) => {
      if (!window.hasOwnProperty(prop)) {
        this.deletePropsSet.add(prop);
        window[prop] = this.windowSnapshot[prop];
      }
    });

    this.sandboxRunning = false;
  }
}

const snapshotSandBox = new SnapshotSandbox("bolawen");

// 激活应用时，记录 a 变量为 "哈哈"
snapshotSandBox.active();
window.a = "哈哈";
console.log(window.a);

// 应用失活时，尝试修改失活状态下的 a 变量， 正常来说失活状态下的 a 变量是不可修改的
snapshotSandBox.inactive();
window.a = "哈哈修改";
console.log(window.a);

// 激活应用时，测试 a 变量是否为 "哈哈"
snapshotSandBox.active();
console.log(window.a);
