function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments as any)
    }
  } as any
}

const say = once(function(content){
    console.log(content);
});

say("哈哈");
say("嘻嘻");