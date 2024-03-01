let syncQueue = [];
let isFlushingSyncQueue = false;

export function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue) {
    isFlushingSyncQueue = true;
    try {
      syncQueue.forEach(callback => callback());
    } catch (error) {
    } finally {
      syncQueue = null;
      isFlushingSyncQueue = false;
    }
  }
}
