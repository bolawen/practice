let activeSandboxCount = 0;
let currentRunningApp = null;
const globalVariableWhiteList = [];

function nextTick(cb) {
  Promise.resolve().then(cb);
}

function clearCurrentRunningApp() {
  currentRunningApp = null;
}

function setCurrentRunningApp(appInstance) {
  currentRunningApp = appInstance;
}

function getCurrentRunningApp() {
  return currentRunningApp;
}

function createFakeWindow(globalContext, speedy) {
  const fakeWindow = {};
  const propertiesWithGetter = new Map();

  Object.getOwnPropertyNames(globalContext)
    .filter((p) => {
      const descriptor = Object.getOwnPropertyDescriptor(globalContext, p);
      return !descriptor?.configurable;
    })
    .forEach((p) => {
      const descriptor = Object.getOwnPropertyDescriptor(globalContext, p);
      if (descriptor) {
        const hasGetter = Object.prototype.hasOwnProperty.call(
          descriptor,
          "get"
        );

        if (
          p === "top" ||
          p === "parent" ||
          p === "self" ||
          p === "window" ||
          (p === "document" && speedy)
        ) {
          descriptor.configurable = true;
          if (!hasGetter) {
            descriptor.writable = true;
          }
        }

        if (hasGetter) propertiesWithGetter.set(p, true);

        Object.defineProperty(fakeWindow, p, Object.freeze(descriptor));
      }
    });

  return {
    fakeWindow,
    propertiesWithGetter,
  };
}

class ProxySandbox {
  constructor(name, globalContext = window, opts) {
    this.name = name;
    this.type = "ProxySandbox";
    this.sandboxRunning = true;
    this.updatedValueSet = new Set();
    this.globalContext = globalContext;

    const { speedy } = opts || {};

    const { fakeWindow } = createFakeWindow(globalContext, !!speedy);

    this.proxy = new Proxy(fakeWindow, {
      set: (target, p, value) => {
        if (this.sandboxRunning) {
          this.registerRunningApp();

          if (
            typeof p === "string" &&
            globalVariableWhiteList.indexOf(p) !== -1
          ) {
            this.globalWhitelistPrevDescriptor[p] =
              Object.getOwnPropertyDescriptor(globalContext, p);
            globalContext[p] = value;
          } else {
            if (!target.hasOwnProperty(p) && globalContext.hasOwnProperty(p)) {
              const descriptor = Object.getOwnPropertyDescriptor(
                globalContext,
                p
              );
              const { writable, configurable, enumerable, set } = descriptor;
              if (writable || set) {
                Object.defineProperty(target, p, {
                  configurable,
                  enumerable,
                  writable: true,
                  value,
                });
              }
            } else {
              target[p] = value;
            }
          }

          this.updatedValueSet.add(p);
        }

        return true;
      },

      get: (target, p) => {
        this.registerRunningApp();

        if (["window", "self", "globalThis"].includes(p)) {
          return this.proxy;
        }

        if (["top", "parent"].includes(p)) {
          return globalContext[p];
        }

        if (p in target) {
          return target[p];
        }

        if (p in globalContext) {
          return globalContext[p];
        }

        return undefined;
      },

      has: (target, p) => {
        return p in target || p in globalContext;
      },

      deleteProperty: (target, p) => {
        this.registerRunningApp();
        if (target.hasOwnProperty(p)) {
          delete target[p];
          this.updatedValueSet.delete(p);
        }

        return true;
      },
    });
    activeSandboxCount++;
  }

  registerRunningApp() {
    if (this.sandboxRunning) {
      const currentRunningApp = getCurrentRunningApp();
      if (!currentRunningApp || currentRunningApp.name !== this.name) {
        setCurrentRunningApp({ name: this.name, window: this.proxy });
      }
      nextTick(clearCurrentRunningApp);
    }
  }

  active() {
    if (!this.sandboxRunning) activeSandboxCount++;
    this.sandboxRunning = true;
  }

  inactive() {
    if (--activeSandboxCount === 0) {
      Object.keys(this.globalWhitelistPrevDescriptor).forEach((p) => {
        const descriptor = this.globalWhitelistPrevDescriptor[p];
        if (descriptor) {
          Object.defineProperty(this.globalContext, p, descriptor);
        } else {
          delete this.globalContext[p];
        }
      });
    }

    this.sandboxRunning = false;
  }
}

const sandBox1 = new ProxySandbox("sandBox1");
const sandBox2 = new ProxySandbox("sandBox2");

sandBox1.active();
sandBox1.proxy.a = "哈哈";
console.log("window.a", window.a);
console.log("sandBox1.proxy.a", sandBox1.proxy.a);
console.log("sandBox2.proxy.a", sandBox2.proxy.a);

sandBox2.active();
sandBox2.proxy.a = "哈哈修改";
console.log("window.a", window.a);
console.log("sandBox1.proxy.a", sandBox1.proxy.a);
console.log("sandBox2.proxy.a", sandBox2.proxy.a);
