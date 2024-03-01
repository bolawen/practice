import { ShouldCapture } from './fiberFlags';
import { markRootPinged } from './fiberLanes';
import { getSuspenseHandler } from './suspenseContext';
import { markRootUpdated, ensureRootIsScheduled } from './workLoop';

function attachPingListener(root, wakeable, lane) {
  let pingCache = root.pingCache;
  let threadIDs;

  if (pingCache === null) {
    threadIDs = new Set();
    pingCache = root.pingCache = new WeakMap();
    pingCache.set(wakeable, threadIDs);
  } else {
    threadIDs = pingCache.get(wakeable);
    if (threadIDs == undefined) {
      threadIDs = new Set();
      pingCache.set(wakeable, threadIDs);
    }
  }

  if (!threadIDs.has(lane)) {
    threadIDs.add(lane);

    function ping() {
      if (pingCache !== null) {
        pingCache.delete(wakeable);
      }

      markRootPinged(root, lane);
      markRootUpdated(root, lane);
      ensureRootIsScheduled(root);
    }

    wakeable.then(ping, ping);
  }
}

export function throwException(root, value, lane) {
  // Error Boundary
  // thenable
  if (
    value !== null &&
    typeof value === 'object' &&
    typeof value.then === 'function'
  ) {
    const wakeable = value;
    const suspenseBoundary = getSuspenseHandler();
    if (suspenseBoundary) {
      suspenseBoundary.flags |= ShouldCapture;
    }

    attachPingListener(root, wakeable, lane);
  }
}
