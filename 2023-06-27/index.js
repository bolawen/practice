function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
var A = function A(a, b) {
    "use strict";
    _class_call_check(this, A);
    _define_property(this, "a", void 0);
    _define_property(this, "b", void 0);
    this.a = a;
    this.b = b;
};
var a = new A("哈哈", "嘻嘻");
console.log(a);
var B = function B(a, b) {
    "use strict";
    _class_call_check(this, B);
    _define_property(this, "a", void 0);
    _define_property(this, "b", void 0);
    this.a = a;
    this.b = b;
};
var b = new B("哈哈", "嘻嘻");
console.log(b);
var C = function C(a, b) {
    "use strict";
    _class_call_check(this, C);
    _define_property(this, "a", void 0);
    _define_property(this, "b", void 0);
    this.a = a;
    this.b = b;
};
var c = new C("哈哈", "嘻嘻");
console.log(c);
console.log(c.a);
var D = function D(a, b) {
    "use strict";
    _class_call_check(this, D);
    _define_property(this, "a", void 0);
    _define_property(this, "b", void 0);
    this.a = a;
    this.b = b;
};
var d = new D("哈哈", "嘻嘻");
console.log(d);
console.log(d.a);

