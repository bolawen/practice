class EventEmitter{
    constructor(){
        this.events = new Map();
    }
    on(event,handler){
        const handlers = this.events.get(event);
        const added = handlers && handlers.push(handler);
        if(!added){
            this.events.set(event,[handler]);
        }
    }
    off(event,handler){
        const handlers = this.events.get(event);
        if(handlers){
            handlers.splice(handlers.indexOf(handler) >>> 0,1);
        }
    }
    emit(event,...args){
        const handlers = this.events.get(event) || [];
        handlers.map((handler)=>{
            handler.call(this,...args);
        });
    }
    once(event,handler){
        const onceHandler = (...args)=>{
            handler.call(this,...args);
            this.off(event,onceHandler);
        };
        this.on(event,onceHandler);
    }
    listenerCount(event){
        return this.events.has(event) ? this.events.get(event).length : 0;
    }
}


const myEmitter = new EventEmitter();
myEmitter.on("event1", function (a, b) {
  console.log("event1-1",a, b,this);
});
myEmitter.on("event1", function (a, b) {
  console.log("event1-2",a, b,this);
});

myEmitter.emit("event1", "a 参数", "b 参数");
myEmitter.emit("event1", "a 参数", "b 参数");
console.log(myEmitter.listenerCount());