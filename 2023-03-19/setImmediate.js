function canUsePostMessage() {
  let postMessageIsAsynchronous = true;
  let oldOnMessage = window.onmessage;
  window.onmessage = function () {
    postMessageIsAsynchronous = false;
  };
  window.postMessage("", "*");
  window.onmessage = oldOnMessage;
  return postMessageIsAsynchronous;
}

function simulateByPostMessage() {
  let messagePrefix = "setImmediate$" + Math.random() + "$";
  let onGlobalMessage = function (event) {
    if (
      event.source === global &&
      typeof event.data === "string" &&
      event.data.indexOf(messagePrefix) === 0
    ) {
      runIfPresent(+event.data.slice(messagePrefix.length));
    }
  };

  if (window.addEventListener) {
    window.addEventListener("message", onGlobalMessage, false);
  } else {
    window.attachEvent("onmessage", onGlobalMessage);
  }

  registerImmediate = function (handle) {
    global.postMessage(messagePrefix + handle, "*");
  };
}
