let caf = (num: number) => clearTimeout(num);
let raf = (callback: FrameRequestCallback) => +setTimeout(callback, 16);

if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
  raf = (callback: FrameRequestCallback) =>
    window.requestAnimationFrame(callback);
  caf = (handle: number) => window.cancelAnimationFrame(handle);
}

let rafUUID = 0;
const rafIds = new Map();

function cleanup(id: number) {
  rafIds.delete(id);
}

const wrapperRaf = (callback, times = 1) => {
  rafUUID += 1;
  const id = rafUUID;

  function callRef(leftTimes) {
    if (leftTimes === 0) {
      cleanup(id);

      callback();
    } else {
      const realId = raf(() => {
        callRef(leftTimes - 1);
      });

      rafIds.set(id, realId);
    }
  }

  callRef(times);
  return id;
};

wrapperRaf.cancel = id => {
  const realId = rafIds.get(id);
  cleanup(id);
  return caf(realId);
};

export default wrapperRaf;
