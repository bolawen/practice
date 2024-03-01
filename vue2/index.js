/**
 * @description: 响应式 Observer
 */


const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

methodsToPatch.forEach(
  method => {
    const original = arrayProto[method];
    def(arrayMethods,method,function mutator(...args){
      const result = original.apply(this,args);
      const ob = this.__ob__;
      let inserted = null;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        observeArray(inserted);
      }

      ob.dep.notify();
      return result;
    });
  }
);

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

class Observer {
  constructor(value) {
    this.dep = new Dep();
    def(value,'__ob__',this);

    if (Array.isArray(value)) {
      Object.setPrototypeOf(value, arrayMethods);
      observeArray(value);
    } else {
      for (const key in value) {
        defineReactive(value, key, value[key]);
      }
    }
  }
}

function observe(value) {
  if (typeof value !== 'object' || value == null) {
    return;
  }
  if(value && Object.hasOwnProperty.call(value,'__ob__')){
    return value.__ob__;
  }
  return new Observer(value);
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  let childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if(Dep.target){
        dep.depend();
        if(childOb){
          childOb.dep.depend();
        }
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) {
        return;
      }
      val = newVal;
      childOb = observe(newValue);
      dep.notify();
    }
  });
  return dep;
}

function observeArray(value) {
  value.forEach(item => {
    observe(item);
  });
}

function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return this[sourceKey][key];
    },
    set(value) {
      this[sourceKey][key] = value;
    }
  });
}

/**
 * @description: 响应式 Dep 类
 */
let depUid = 0;

class Dep {
  constructor() {
    this.id = depUid++;
    this.subs = [];
  }
  addSub(dep) {
    this.subs.push(dep);
  }
  notify() {
    this.subs.forEach(dep => dep.update());
  }
  depend(){
    if(Dep.target){
      Dep.target.addDep(this)
    }
  }
}

Dep.target = null;

const targetStack = []

function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}

function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

/**
 * @description: 响应式 Watcher 类
 */
let watcherUid = 0;

class Watcher {
  constructor(vm, expOrFn, cb,options,isRenderWatcher) {
    if(this.vm = vm && isRenderWatcher){
      vm._watcher = this;
    }
    this.cb = cb;
    this.newDeps = [];
    this.id = watcherUid++;
    this.depIds = new Set()
    this.newDepIds = new Set();
    this.getter = typeof expOrFn === 'function' ? expOrFn : ()=>{};
    this.value = this.get();
  }

  get(){
    pushTarget(this);
    const vm = this.vm;
    const value = this.getter.call(vm,vm);
    popTarget();
    return value;
  }

  addDep(dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  update() {
    this.run();
  }

  run(){
    this.get();
  }
}

/**
 * @description: 编译器 Compile
 */

function compile(vm){
  const template = vm.$options.template;
  const interpolationReg =  /\{\{(.*)\}\}/;
  const el = document.querySelector(vm.$options.el);
  
  const match = interpolationReg.exec(template);
  el.innerHTML = template.replace(interpolationReg,vm[match?.[1]])
}

/**
 * @description: Vue 类
 */

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? data() : data || {};
  const keys = Object.keys(data);

  let i = keys.length;
  while (i--) {
    const key = keys[i];
    proxy(vm, `_data`, key);
  }
  observe(data);
}

class Vue {
  constructor(options) {
    this.$options = options;

    initData(this);
    this.mount();
  }
  mount(){
    const vm = this;

    const updateComponent = ()=>{
      compile(vm);
    }

    new Watcher(
      vm,
      updateComponent,
      ()=>{},
      {},
      true 
    )
  }
}

const vue = new Vue({
  el: '#app',
  template: `{{d}}`,
  data() {
    return {
      a: 1,
      b: {
        c: "嘻嘻",
      },
      d: [1,2,3]
    };
  }
});

console.log("vue",vue)
setTimeout(()=>{
  vue.d.push(4)
},4000);