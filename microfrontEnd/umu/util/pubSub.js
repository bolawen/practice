export default class PubSub {
  constructor() {
    this.events = {};
  }
  subscribe(event, fn) {
    if (Array.isArray(event)) {
      event.forEach(e => {
        this.subscribe(e, fn);
      });
    } else {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(fn);
    }
  }
  unsubscribe(event, fn) {
    if (Array.isArray(event)) {
      event.forEach(e => {
        this.unsubscribe(e, fn);
      });
    }
    const cbs = this.events[event];
    if (!cbs) {
      return;
    }
    if (!fn) {
      this.events[event] = null;
    }
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
  }
  publish(event, ...args) {
    let cbs = this.events[event];
    if (cbs) {
      cbs.forEach(cb => {
        cb.apply(this, args);
      });
    }
  }
  subScribeOnce(event, fn) {
    function on() {
      this.unsubscribe(event, on);
      fn.apply(this, arguments);
    }
    this.subscribe(event, on);
  }
}
