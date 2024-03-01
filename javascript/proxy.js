// const source = {
//   a: 1
// };

// const proxy = new Proxy(source, {
//   get(target, key, receiver) {
//     return Reflect.get(target, key, receiver);
//   },
//   set(target, key, value, receiver) {
//     return Reflect.set(target, key, value, receiver);
//   },
//   has(target, key) {
//     console.log('key', key);
//     return Reflect.has(target, key);
//   },
//   ownKeys(target) {
//     console.log('target', target);
//     return Reflect.ownKeys(target);
//   }
// });

// // console.log('b' in proxy);

// for (const key in proxy) {
// }

function defineReactive(obj,key,val){
  Object.defineProperty(obj,key,{
    enumerable: true,
    configurable: true,
    get(){
      console.log("get 拦截")
      return val;
    },
    set(newVal){
      console.log("set 拦截")
      val = newVal;
    }
  });
}

function observe(obj){
  for(let key in obj){
    defineReactive(obj,key,obj[key]);
  }
  return obj;
}


const obj = observe({
  a: 1,
  b: 2
});

obj.a;
obj.a = 2;
console.log(obj)
