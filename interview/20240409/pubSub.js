class PubSub{
    constructor(){
        this.events = {};
    }

    on(event, fn){
        if(Array.isArray(event)){
            event.forEach(e=>{
                this.on(e,fn);
            });
        }else{
            if(!this.events[event]){
                this.events[event] = [];
            }
            this.events[event].push(fn);
        }
    }

    off(event,fn){
        if(Array.isArray(event)){
            event.forEach(e=>{
                this.off(e,fn);
            });
        }else{
            const cbs = this.events[event];
            if(!cbs){
                return;
            }
            if(!fn){
                this.events[event] = null;
            }
            let cb;
            let i = cbs.length;
            while(i--){
                cb = cbs[i];
                if(cb === fn){
                    cbs.splice(i,1);
                    break;
                }
            }
        }
    }

    emit(event,...args){
        const cbs = this.events[event];
        if(cbs){
            cbs.forEach((cb)=>{
                cb.apply(this, args);
            });
        }
    }

    once(event,fn){
        function on(){
            this.off(event,on);
            fn.apply(this, arguments);
        }
        this.on(event,on);        
    }

    once(event,fn){
        function on(){
            this.off(event,on);
            fn.apply(this, arguments);
        }
        this.on(event,on);
    }
}
