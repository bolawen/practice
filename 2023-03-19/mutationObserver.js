let timerFunc;
const callbacks = [];

function flushCallbacks() {
  const copies = callbacks.slice();
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

function buildTimerFunc() {
  let counter = 1;
  const mutationObserver = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  mutationObserver.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
}

function nextTick(callback, context) {
  callbacks.push(() => {
    if (callback) {
      try {
        callback.call(context);
      } catch (error) {
        console.log("Error");
      }
    }
  });
  timerFunc();
}

function task1() {
  console.log("task1");
}
function task2() {
  console.log("task2");
}

buildTimerFunc();
nextTick(task1);
nextTick(task2);