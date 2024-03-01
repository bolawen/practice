import { mergeLanes, isSubsetOfLanes } from './fiberLanes.js';

export const createUpdate = (
  action,
  lane,
  hasEagerState = false,
  eagerState = null
) => {
  return {
    lane,
    action,
    next: null,
    hasEagerState,
    eagerState
  };
};

export const createUpdateQueue = () => {
  return {
    shared: {
      pending: null
    },
    dispatch: null
  };
};

export const enqueueUpdate = (updateQueue, update, fiber, lane) => {
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  updateQueue.shared.pending = update;

  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate;
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
};

export function basicStateReducer(state, action) {
  if (action instanceof Function) {
    return action(state);
  } else {
    return action;
  }
}

export const processUpdateQueue = (
  baseState,
  pendingUpdate,
  renderLane,
  onSkipUpdate
) => {
  const result = { baseState, baseQueue: null, memoizedState: baseState };

  if (pendingUpdate !== null) {
    let first = pendingUpdate.next;
    let pending = pendingUpdate.next;

    let newBaseState = baseState;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let newState = baseState;

    do {
      const updateLane = pending.lane;
      if (!isSubsetOfLanes(renderLane, updateLane)) {
        const clone = createUpdate(pending.action, pending.lane);
        onSkipUpdate?.(clone);

        if (newBaseQueueFirst === null) {
          newBaseQueueFirst = clone;
          newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast.next = clone;
          newBaseQueueLast = clone;
        }
      } else {
        if (newBaseQueueLast !== null) {
          const clone = createUpdate(pending.action, NoLane);
          newBaseQueueLast.next = clone;
          newBaseQueueLast = clone;
        }
        const action = pending.action;

        if (pending.hasEagerState) {
          newState = pending.eagerState;
        } else {
          newState = basicStateReducer(baseState, action);
        }
      }

      pending = pending.next;
    } while (pending !== first);

    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = newBaseQueueFirst;
    }

    result.memoizedState = newState;
    result.baseState = newBaseState;
    result.baseQueue = newBaseQueueLast;
  }

  return result;
};
