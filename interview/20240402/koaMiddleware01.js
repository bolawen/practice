function compose(middlewares){
    if(!Array.isArray(middlewares)){
        return new TypeError("middlewares 必须是一个函数数组");
    }
    for(const middleware of middlewares){
        if(typeof middleware !== "function"){
            return new TypeError("middleware 必须是一个函数");
        }
    }

    return function (context, next){
        let index = -1;

        function dispatch(i){
            if(i <= index){
                return Promise.reject("next() 函数不可以调用多次")
            }
            
            index = i;
            let fn = middlewares[index];

            if(index === middlewares.length){
                fn = next;
            }

            if(!fn){
                return Promise.reject();
            }

            try{
                return Promise.resolve(fn(context, dispatch.bind(null, i+1)));
            }catch(error){
                return Promise.reject(error);
            }
        }

        dispatch(0);
    }
}