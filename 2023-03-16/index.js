"use strict";
function once(fn) {
    var called = false;
    return function () {
        if (!called) {
            called = true;
            fn.apply(this, arguments);
        }
    };
}
var pay = once(function (money) {
    console.log("\u652F\u4ED8\u4E86 ".concat(money, " RMB"));
});
pay(5);
pay(10);
