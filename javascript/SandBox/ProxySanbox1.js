class ProxySandbox {
    constructor() {
        this.fakeWindow = {};
        this.isRunning = false;
        this.proxy = new Proxy(this.fakeWindow, {
            get: (target, key) => {
                if (key === 'window' || key === 'self' || key === 'globalThis') {
                    return this.proxy;
                }
                return target[key] || window[key];
            },
            set: (target, key, value) => {
                if (this.isRunning) {
                    target[key] = value;
                    return true;
                }
                return false;
            },
            has: (target, key) => {
                return key in target || key in window;
            },
            deleteProperty: (target, key) => {
                if (this.isRunning) {
                    delete target[key];
                    return true;
                }
                return false;
            },
        });
    }

    active() {
        this.isRunning = true;
    }

    inactive() {
        this.isRunning = false;
    }
}

const sandBox1 = new ProxySandbox("sandBox1");
const sandBox2 = new ProxySandbox("sandBox2");

sandBox1.active();
sandBox1.proxy.a = "哈哈";
console.log("sandBox1.proxy.a", sandBox1.proxy.a);
console.log("sandBox2.proxy.a", sandBox2.proxy.a);

sandBox2.active();
sandBox2.proxy.a = "哈哈修改";
console.log("sandBox1.proxy.a", sandBox1.proxy.a);
console.log("sandBox2.proxy.a", sandBox2.proxy.a);