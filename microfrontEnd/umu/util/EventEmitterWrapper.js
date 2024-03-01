import mitt from './mitt.js';

class EventEmitterWrapper {
  $$emitter;
  $$eventsMap = new Map();

  constructor() {
    this.$$emitter = mitt(this.$$eventsMap);
  }

  on(event, handler) {
    this.$$emitter.on(event, handler);
  }

  off(event, handler) {
    this.$$emitter.off(event, handler);
  }

  emit(event, ...args) {
    console.log("event",event)
    console.log("this.$$emitter",this.$$emitter)
    this.$$emitter.emit(event, ...args);
    return this.eventListenersCount(event) > 0;
  }

  once(event, handler) {
    const onceHandler = eventData => {
      handler(eventData);
      this.off(event, onceHandler);
    };

    return this.on(event, onceHandler);
  }

  listenerCount(event) {
    return this.eventListenersCount(event);
  }

  eventListenersCount(event) {
    return this.$$eventsMap.has(event) ? this.$$eventsMap.get(event).length : 0;
  }
}

export default EventEmitterWrapper;
