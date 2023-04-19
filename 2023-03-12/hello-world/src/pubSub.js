class PubSub {
  constructor() {
    this.events = {};
  }
  subscribe(event, fn) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
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
      event.forEach((e) => {
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
      cbs.forEach((cb) => {
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

const pubSub = new PubSub();

function handlerEventA(name) {
  console.log("handlerEventA", name);
}
function handlerEventB(name) {
  console.log("handlerEventB", name);
}
function handlerEventC(name) {
  console.log("handlerEventC", name);
}

pubSub.subscribe("eventA", handlerEventA);
pubSub.subscribe("eventB", handlerEventB);
pubSub.subScribeOnce(["eventA", "eventB"], handlerEventC);

pubSub.publish("eventA", "eventA - 哈哈");
pubSub.publish("eventA", "eventA - 嘻嘻");
pubSub.publish("eventB", "eventB - 哈哈");
pubSub.publish("eventB", "eventB - 嘻嘻");
