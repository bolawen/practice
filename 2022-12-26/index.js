/**
 * @description: get 方法
 * @param {*} object
 * @param {*} path : 可能是 "a.b.c" 也可能是 "a.b[2].c"
 * @param {*} defaultValue
 */
function get(object,path,defaultValue){
    const pathCopy = Array.isArray(path) ? path : path.replace(/\[(\d+)\]/,".$1").split(".");
    let result = object;
    for(let p of pathCopy){
        result = Object(result)[p];
        if(result == undefined){
            return defaultValue;
        }
    }
    return result;
}

const obj = {
    a: "属性a",
    b: {
        c: "属性c",
        d: {
            e: "属性e"
        }
    }
}

debugger
console.log(get(obj,"b.d.e","哈哈"))