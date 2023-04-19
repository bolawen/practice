class EventBus {
  constructor() {
    this.events = {};
  }
  $on(event, fn) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        this.$on(e, fn);
      });
    } else {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(fn);
    }
  }
  $off(event, fn) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        this.$off(e, fn);
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
  $emit(event, ...args) {
    let cbs = this.events[event];
    if (cbs) {
      cbs.forEach((cb) => {
        cb.apply(this, args);
      });
    }
  }
  $once(event, fn) {
    function on() {
      this.$off(event, on);
      fn.apply(this, arguments);
    }
    this.$on(event, on);
  }
}

const eventBus = new EventBus();

function handlerEventA(name) {
  console.log("handlerEventA", name);
}
function handlerEventB(name) {
  console.log("handlerEventB", name);
}
function handlerEventC(name) {
  console.log("handlerEventC", name);
}

eventBus.$on("eventA", handlerEventA);
eventBus.$on("eventB", handlerEventB);
eventBus.$once(["eventA", "eventB"], handlerEventC);

eventBus.$emit("eventA", "eventA - 哈哈");
eventBus.$emit("eventA", "eventA - 嘻嘻");
eventBus.$emit("eventB", "eventB - 哈哈");
eventBus.$emit("eventB", "eventB - 嘻嘻");
