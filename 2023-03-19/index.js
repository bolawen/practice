let timeFunc;
let pending = false;
const callbacks = [];
let isUsingMicroTask = false;

function isNative(Ctor) {
  return typeof Ctor === "function" && /native code/.test(Ctor.toString());
}

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice();
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

function gracefulDemotionForTimeFunc() {
  if (typeof Promise !== "undefined" && isNative(Promise)) {
    isUsingMicroTask = true;
    const p = Promise.resolve();
    timeFunc = () => {
      p.then(flushCallbacks);
    };
  } else if (
    typeof MutationObserver !== "undefined" &&
    (isNative(MutationObserver) ||
      MutationObserver.toString() === "[object MutationObserverConstructor")
  ) {
    let counter = 1;
    isUsingMicroTask = true;
    const mutationObserver = new MutationObserver(flushCallbacks);
    const textNode = document.createTextNode(String(counter));
    mutationObserver.observe(textNode, {
      characterData: true,
    });
    timeFunc = () => {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
    timeFunc = () => {
      setImmediate(flushCallbacks);
    };
  } else {
    timeFunc = () => {
      setTimeout(flushCallbacks, 0);
    };
  }
}

function nextTick(callback, context) {
  let _resolve;
  callbacks.push(() => {
    if (callback) {
      try {
        callback.call(context);
      } catch (error) {
        console.log("Error");
      }
    } else if (_resolve) {
      _resolve(context);
    }
  });

  if (!pending) {
    pending = true;
    timeFunc();
  }

  if (!callback && typeof Promise !== "undefined") {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}

function task1() {
  console.log("task1");
}
function task2() {
  console.log("task2");
}

gracefulDemotionForTimeFunc();
nextTick(task1);
nextTick(task2);
