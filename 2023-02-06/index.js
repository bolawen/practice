class EventEmitter{
    static defaultMaxListeners = 10;

    constructor(){
        this.events = {};
    }
    
    on(type,listener,flag){
        if (!this.events) {
            this.events = Object.create(null)
        }
        if(this.events[type]){
            if(flag){
                this.events[type].unshift(listener);
            }else{
                this.events[type].push(listener);
            }
        }else{
            this.events[type] = [listener]
        }

        if(type !== "newListener"){
            this.emit("newListener",type);
        }
    }
    emit(type,...args){
        if(this.events[type]){
            this.events[type].forEach((fn)=>{
                fn.call(this,...args);
            });
        }
    }
    once(type,listener){
        const that = this;
        function only(){
            listener();
            that.removeListener(type,only);
        }
        only.origin = listener;
        that.on(type.only);
    }
    off(type,listener){
        if(this.events[type]){
            this.events[type] = this.events[type].filter(fn=>{
                return fn !== listener && fn.origin !== listener;
            });
        }
    }
}