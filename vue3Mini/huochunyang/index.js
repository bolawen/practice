import { watch } from './reactivity/watch';
import { effect } from './reactivity/effect';
import { computed } from './reactivity/computed';
import { patchProp } from './runtime-core/patchProp';
import { jobQueue, flushJob } from './reactivity/scheduler';
import { reactive } from './reactivity/reactive';

import {
  createRenderer,
  Text,
  Comment,
  Fragment,
  onMounted
} from './runtime-core/renderer';

// const data = {
//   a: 'hello world',
//   b: 0,
//   c: 1,
//   d: 1,
//   e: {
//     f: 1
//   }
// };

// const obj = reactive(data);

// setTimeout(() => {
//   obj.a = 'hello world 修改';
// }, 3000);

// effect(() => {
//   console.log(obj.a);
// });

// setTimeout(() => {
//   obj.b++;
// }, 2000);

// effect(() => {
//   console.log(obj.b);
// });
/**
 * @description: 嵌套的 effecdt
 */

// effect(() => {
//   effect(() => {
//     console.log('内层', obj.b);
//   });
//   console.log('外层', obj.a);
// });

// obj.a = 'hello world 修改';

/**
 * @description: 避免无限递归循环
 */

// effect(() => {
//   obj.c++;
// });

/**
 * @description: 调度器调度执行 控制 副作用函数的执行顺序
 */

// effect(
//   () => {
//     console.log(obj.c);
//   },
//   {
//     scheduler(fn) {
//       setTimeout(fn);
//     }
//   }
// );

// obj.c++;
// console.log('obj.c 结束');

/**
 * @description: 调度器调度执行 控制 副作用函数执行的次数, 可以去除过渡状态，只关心最终结果
 */
// effect(
//   () => {
//     console.log(obj.d);
//   },
//   {
//     scheduler(fn) {
//       jobQueue.add(fn);
//       flushJob();
//     }
//   }
// );

// obj.d++;
// obj.d++;
// obj.d++;

/**
 * @description: computed 访问值；多次访问值； 修改依赖响应式数据, 再次多次访问值
 * @param {*} computed
 */
// const computedA = computed(() => {
//   return obj.b + obj.c;
// });

// console.log(computedA.value);
// console.log(computedA.value);
// console.log(computedA.value);

// obj.b = 4;

// console.log(computedA.value);
// console.log(computedA.value);

/**
 * @description: 在副作用函数中访问读取 computed 值, 此时, 依赖的响应式数据发生变更
 * @param {*} computed
 */
// const computedB = computed(() => {
//   return obj.b + obj.c;
// });

// effect(() => {
//   console.log(computedB.value);
// });

// obj.b++;

/**
 * @description: watch 监听响应式数据
 */
// watch(obj, (newValue, oldValue) => {
//   console.log(newValue.c, oldValue.c);
// });

// obj.c++;

/**
 * @description: watch 监听 getter 函数
 */

// watch(
//   () => obj.c,
//   (newValue, oldValue) => {
//     console.log(newValue, oldValue);
//   }
// );

// obj.c++;

/**
 * @description: watch 立即执行回调函数
 */

// watch(
//   () => obj.c,
//   (newValue, oldValue) => {
//     console.log(newValue, oldValue);
//   },
//   {
//     immediate: true
//   }
// );

/**
 * @description: watch 回调函数执行时机
 */
// watch(
//   () => obj.c,
//   (newValue, oldValue) => {
//     console.log(newValue, oldValue);
//   },
//   {
//     flush: 'sync' // ‘pre’ | 'post' | 'sync'
//   }
// );

// obj.c++;

/**
 * @description: watch 竞态问题的处理（过期的副作用）
 *
 * 场景: 依次发送请求 A 和 B， 我们根据请求的发送顺序, 认为请求 B 是后发送的, 请求 B 的数据才是最新的， 请求 A 的返回数据应该视为过期的。
 */

// function request() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve();
//     }, 1000);
//   });
// }

// watch(
//   () => obj.c,
//   async (newValue, oldValue, onInvalidate) => {
//     let expired = false;
//     onInvalidate(() => {
//       expired = true;
//     });
//     await request();
//     if (!expired) {
//       console.log(newValue, oldValue);
//     }
//   }
// );

// obj.c++;

// setTimeout(() => {
//   obj.c++;
// }, 200);

/**
 * @description: 拦截 in 操作符
 */

// effect(() => {
//   console.log('a' in obj);
// });
// obj.a = 'hello world 修改';

/**
 * @description: 拦截 for……in 循环
 */

// effect(() => {
//   for (const key in obj) {
//     console.log(key);
//   }
// });

// obj.f = 2; // 新增属性
// // obj.b++; // 已有属性

/**
 * @description: 拦截 delete 操作
 */

// effect(() => {
//   for (const key in obj) {
//     console.log(key);
//   }
// });

// delete obj.c;

/**
 * @description: 深层响应和只读
 */

// effect(() => {
//   console.log(obj.e.f);
// });

// obj.c += 2;

/**
 * @description: 通过 array[1] = xx; 改变数组
 */

// const array = reactive([1]);

// effect(() => {
//   console.log(array.length);
// });

// array[1] = 2; // array.length 变为 2

/**
 * @description: 通过 array.length = xx 改变数组
 */

// const array = reactive([1, 2]);

// effect(() => {
//   console.log(array[0]);
// });

// array.length = 0;

/**
 * @description: 通过 for(const index in array) 遍历数组
 */

// const array = reactive([1, 2, 3]);
// effect(() => {
//   for (let index in array) {
//     console.log(index);
//   }
// });

// array[4] = '4';
// array.length = 2;

/**
 * @description: 通过 for(const item of array) 遍历数组
 */

// const array = reactive([1, 2, 3]);
// effect(() => {
//   for (let item of array) {
//     console.log(item);
//   }
// });

// array[4] = '4';
// array.length = 2;

/**
 * @description: 通过 includes() 查找数组元素
 */

// const obj = reactive({});
// const array = reactive([obj]);
// effect(() => {
//   console.log(array.includes(array[0]));
// });

// array[0] = 1;

// const obj = {};
// const array = reactive([obj]);
// effect(() => {
//   console.log(array.includes(obj));
// });

// array[0] = 1;

/**
 * @description: 通过 push() 添加元素
 */

// const array = reactive([1,2]);

// effect(()=>{
//   for(let item of array){
//     console.log(item)
//   }
// });

// array.push(3);

/**
 * @description: 通过 unshift() 添加元素
 */

// const array = reactive(['a','b','c']);

// effect(()=>{
//   for(let item of array){
//     console.log(item)
//   }
// });

// array.unshift('d');

/**
 * @description: 代理 Set 数据
 */

// const proxy = reactive(new Set([1, 2, 3]));
// console.log(proxy.size);
// proxy.delete(2);
// console.log(proxy.size);

/**
 * @description: 代理 Map 数据
 */

// const proxy = reactive(
//   new Map([
//     [1, 1],
//     [2, 2],
//     [3, 3]
//   ])
// );
// console.log(proxy.size);
// proxy.delete(2);
// console.log(proxy.size);

/**
 * @description: Set 响应
 */

// const set = reactive(new Set([1, 2, 3]));

// effect(() => {
//   console.log(set.size);
// });

// set.add(4);

/**
 * @description: Map 响应
 */

// const map = reactive(new Map());

// effect(() => {
//   console.log(map.size);
// });

// map.set([1, 1]);

/**
 * @description: Map 数据污染
 */

// const map = new Map();
// const proxy1 = reactive(map);
// const proxy2 = reactive(new Map());
// proxy1.set('proxy2', proxy2);

// effect(() => {
//   // 通过原始数据访问 proxy2
//   console.log(map.get('proxy2').size);
// });

// // 通过原始数据修改 proxy2
// map.get('proxy2').set([2, 2]);

/**
 * @description: Map forEach
 */

// const map = reactive(
//   new Map([
//     [1, 1],
//     [2, 2],
//     [3, 3]
//   ])
// );

// effect(() => {
//   map.forEach(item => {
//     console.log(item);
//   });
// });

// map.set(4, 4);

/**
 * @description: Map for……of
 */

// const map = reactive(
//   new Map([
//     [1, 1],
//     [2, 2],
//     [3, 3]
//   ])
// );

// effect(() => {
//   for (const item of map) {
//     console.log(item);
//   }
// });

// map.set(4, 4);

/**
 * @description: Map entries 遍历
 */

// const map = reactive(
//   new Map([
//     [1, 1],
//     [2, 2],
//     [3, 3]
//   ])
// );

// effect(() => {
//   for (const [key, value] of map.entries()) {
//     console.log(key, value);
//   }
// });

// map.set(4, 4);

// /**
//  * @description: Map values 遍历
//  */

// const map = reactive(
//   new Map([
//     [1, 1],
//     [2, 2],
//     [3, 3]
//   ])
// );

// effect(() => {
//   for (const value of map.entries()) {
//     console.log(value);
//   }
// });

// map.set(4, 4);
// map.set(3, 3);

/**
 * @description: render 渲染器 渲染 Element
 */

// const renderOps = {
//   createElement(tag) {
//     return document.createElement(tag);
//   },
//   setElementText(el, text) {
//     el.textContent = text;
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor);
//   }
// };

// const renderer = createRenderer({ ...renderOps, patchProp });

// const data = reactive({ msg: 'Hello World' });

// effect(() => {
//   const vnode = {
//     type: 'div',
//     shapeFlag: 9,
//     props: {
//       id: 'id-div',
//       style: {
//         color: 'red'
//       },
//       class: 'class-div',
//       onClick: [
//         () => {
//           console.log('1');
//         },
//         () => {
//           console.log('2');
//         }
//       ]
//     },
//     children: [
//       {
//         type: 'h3',
//         shapeFlag: 9,
//         children: data.msg
//       }
//     ]
//   };

//   renderer.render(vnode, document.querySelector('#app'));
// });

// setTimeout(() => {
//   data.msg = 'Hello World 修改';
// }, 3000);

/**
 * @description: render 渲染器 渲染 Text
 */

// const renderOps = {
//   setText(el, text) {
//     el.nodeValue = text;
//   },
//   createText(text) {
//     return document.createTextNode(text);
//   },
//   createComment(comment) {
//     return document.createComment(comment);
//   },
//   createElement(tag) {
//     return document.createElement(tag);
//   },
//   setElementText(el, text) {
//     el.textContent = text;
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor);
//   }
// };

// const renderer = createRenderer({ ...renderOps, patchProp });

// const data = reactive({ msg: 'Hello World' });

// effect(() => {
//   const vnode = {
//     type: Text,
//     children: data.msg
//   };

//   renderer.render(vnode, document.querySelector('#app'));
// });

// setTimeout(() => {
//   data.msg = 'Hello World 修改';
// }, 3000);

/**
 * @description: render 渲染器 渲染 Comment
 */

// const renderOps = {
//   setText(el, text) {
//     el.nodeValue = text;
//   },
//   createText(text) {
//     return document.createTextNode(text);
//   },
//   createComment(comment) {
//     return document.createComment(comment);
//   },
//   createElement(tag) {
//     return document.createElement(tag);
//   },
//   setElementText(el, text) {
//     el.textContent = text;
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor);
//   }
// };

// const renderer = createRenderer({ ...renderOps, patchProp });

// const data = reactive({ msg: 'Hello World' });

// effect(() => {
//   const vnode = {
//     type: Comment,
//     children: data.msg
//   };

//   renderer.render(vnode, document.querySelector('#app'));
// });

// setTimeout(() => {
//   data.msg = 'Hello World 修改';
// }, 3000);

/**
 * @description: render 渲染器 Diff
 * n1: (a b) c
 * n2: (a b) d e
 */

// const renderOps = {
//   setText(el, text) {
//     el.nodeValue = text;
//   },
//   createText(text) {
//     return document.createTextNode(text);
//   },
//   createComment(comment) {
//     return document.createComment(comment);
//   },
//   createElement(tag) {
//     return document.createElement(tag);
//   },
//   setElementText(el, text) {
//     el.textContent = text;
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor);
//   }
// };

// const renderer = createRenderer({ ...renderOps, patchProp });

// const oldData = ['a', 'b', 'c'];
// const vnode = {
//   type: 'div',
//   shapeFlag: 9,
//   children: oldData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
// };
// renderer.render(vnode, document.querySelector('#app'));

// setTimeout(() => {
//   const newData = ['a', 'b', 'd', 'e'];
//   const vnode = {
//     type: 'div',
//     shapeFlag: 9,
//     children: newData.map(item => ({
//       type: 'div',
//       shapeFlag: 9,
//       children: item
//     }))
//   };
//   renderer.render(vnode, document.querySelector('#app'));
// }, 3000);

/**
 * @description: render 渲染器 Diff
 * n1: a (b c)
 * n2: d e (b c)
 */

// const renderOps = {
//   setText(el, text) {
//     el.nodeValue = text;
//   },
//   createText(text) {
//     return document.createTextNode(text);
//   },
//   createComment(comment) {
//     return document.createComment(comment);
//   },
//   createElement(tag) {
//     return document.createElement(tag);
//   },
//   setElementText(el, text) {
//     el.textContent = text;
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor);
//   }
// };

// const renderer = createRenderer({ ...renderOps, patchProp });

// const oldData = ['a','b','c'];
// const vnode = {
//   type: 'div',
//   shapeFlag: 9,
//   children: oldData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
// };

// renderer.render(vnode, document.querySelector('#app'));

// setTimeout(() => {
//   const newData = ['d','e','b','c'];
//   const vnode = {
//     type: 'div',
//     shapeFlag: 9,
//     children: newData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
//   };

//   renderer.render(vnode, document.querySelector('#app'));
// }, 3000);

/**
 * @description: render 渲染器 Diff
 * n1: a b [c d e] f g
 * n2: a b [e d c h] f g
 */

// const renderOps = {
//   setText(el, text) {
//     el.nodeValue = text;
//   },
//   createText(text) {
//     return document.createTextNode(text);
//   },
//   createComment(comment) {
//     return document.createComment(comment);
//   },
//   createElement(tag) {
//     return document.createElement(tag);
//   },
//   setElementText(el, text) {
//     el.textContent = text;
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor);
//   }
// };

// const renderer = createRenderer({ ...renderOps, patchProp });

// const oldData = ['a','b','c','d','e','f','g'];
// const vnode = {
//   type: 'div',
//   shapeFlag: 9,
//   children: oldData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
// };

// renderer.render(vnode, document.querySelector('#app'));

// setTimeout(() => {
//   const newData = ['a','b','e','d','c','h','f','g'];
//   const vnode = {
//     type: 'div',
//     shapeFlag: 9,
//     children: newData.map(item => ({ type: 'div', shapeFlag: 9, children: item }))
//   };

//   renderer.render(vnode, document.querySelector('#app'));
// }, 3000);

// const map = reactive(new Map([[1,'嘻嘻'],[2,'哈哈']]));

// effect(()=>{
//   map.forEach((value,key)=>{
//     console.log(value,key)
//   });
// });

// map.set(3,'呵呵');

/**
 * @description: render 渲染器 Component
 */

const renderOps = {
  setText(el, text) {
    el.nodeValue = text;
  },
  createText(text) {
    return document.createTextNode(text);
  },
  createComment(comment) {
    return document.createComment(comment);
  },
  createElement(tag) {
    return document.createElement(tag);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  }
};

const renderer = createRenderer({ ...renderOps, patchProp });

const AppComponent = {
  name: 'AppComponent',
  setup() {
    onMounted(() => {
      console.log('setup onMounted');
    });
  },
  render() {
    return {
      type: 'div',
      shapeFlag: 9,
      children: '嘻嘻'
    };
  }
};

const vnode = {
  shapeFlag: 4,
  type: AppComponent
};

renderer.render(vnode, document.querySelector('#app'));
