function set(object, key, value){
    const pathRegExp = /[,\[\].]+?/;
    const keys = Array.isArray(path) ? path : path.split(pathRegExp).filter(Boolean);

    for(const key of keys.slice(0,-1)){
        if(!object[key]){
            object[key] = {};
        }
        object = object[key];
    }

    object[keys[keys.length-1]] = value;
}