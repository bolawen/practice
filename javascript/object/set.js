function omit(obj, keys) {
    const newObj = {};
    
    for (let key in obj) {
        if (!keys.includes(key)) {
            newObj[key] = obj[key];
        }
    }
    
    return newObj;
}

var object = { 'a': 1, 'b': '2', 'c': 3 };
var result = omit(object, ['a', 'c']);
console.log(result);