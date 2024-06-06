function set(obj, path, value) {
    let currentObj = obj;
    
    for (const key of path) {
        if (typeof currentObj !== "object" || currentObj === null) {
            return;
        }
        
        if (!(key in currentObj)) {
            currentObj[key] = {};
        }
        
        currentObj = currentObj[key];
    }
    
    currentObj = value;
}