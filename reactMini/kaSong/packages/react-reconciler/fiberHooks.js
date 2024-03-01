import internals from 'shared/internals.js';
import { trackUsedThenable } from './thenable';
import { PassiveEffect } from './fiberFlags.js';
import { scheduleUpdateOnFiber } from './workLoop';
import { Passive, HookHasEffect } from './hookEffectTags.js';
import { REACT_CONTEXT_TYPE } from '../shared/ReactSymbols.js';
import { markWorkInProgressReceiveUpdate } from './beginWork.js';
import { readContext as readContextOrigin } from './fiberContext.js';
import {
  basicStateReducer,
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue
} from './updateQueue.js';
import {
  NoLane,
  NoLanes,
  mergeLanes,
  removeLanes,
  requestUpdateLane
} from './fiberLanes.js';

let renderLane = NoLane;
/**
 * @description: 当前正在渲染的 Fiber
 */
let currentlyRenderingFiber = null;
/**
 * @description: 当前正在处理的 Hook
 */
let workInProgressHook = null;

/**
 * @description: 当前正在使用的 Hook
 */
let currentHook = null;

const { currentDispatcher, currentBatchConfig } = internals;

function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null || nextDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(prevDeps[i], nextDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}

function readContext(context) {
  const consumer = currentlyRenderingFiber;
  return readContextOrigin(consumer, context);
}

function mountWorkInProgressHook() {
  const hook = {
    next: null,
    baseQueue: null,
    baseState: null,
    updateQueue: null,
    memoizedState: null
  };

  if (workInProgressHook == null) {
    if (currentlyRenderingFiber == null) {
      throw new Error('请在函数组件内调用 Hook');
    } else {
      workInProgressHook = hook;
      currentlyRenderingFiber.memoizedState = workInProgressHook;
    }
  } else {
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }
  return workInProgressHook;
}

function updateWorkInProgressHook() {
  let nextCurrentHook = null;

  if (currentHook == null) {
    const current = currentlyRenderingFiber?.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook == null) {
    /**
     * @description: nextCurrentHook 为 null
     * 之前: u1 u2 u3
     * 现在: u1 u2 u3 u4
     * 原因:
     * 1. if(){ u4 } => u4 放在了 If 语句中
     */
    throw new Error('本次执行时的 Hook 比上次执行时多');
  }

  currentHook = nextCurrentHook;

  const newHook = {
    next: null,
    baseState: currentHook.baseQueue,
    baseQueue: currentHook.baseState,
    updateQueue: currentHook.updateQueue,
    memoizedState: currentHook.memoizedState
  };

  if (workInProgressHook == null) {
    if (currentlyRenderingFiber == null) {
      throw new Error('请在函数组件内调用 Hook');
    } else {
      workInProgressHook = newHook;
      currentlyRenderingFiber.memoizedState = workInProgressHook;
    }
  } else {
    workInProgressHook.next = newHook;
    workInProgressHook = newHook;
  }
  return workInProgressHook;
}

function createFCUpdateQueue() {
  const updateQueue = createUpdateQueue();
  updateQueue.lastEffect = null;
  return updateQueue;
}

/**
 * @description: dispatchSetState
 * @param {*} fiber dispatchSetState.bind 时已经传入
 * @param {*} updateQueue dispatchSetState.bind 时已经传入
 * @param {*} action : setState(value) || setValue(()=> value) 中的 value 或者 ()=> value
 */
function dispatchSetState(fiber, updateQueue, action) {
  const lane = requestUpdateLane();
  const update = createUpdate(action, lane);

  // eagerState 策略
  const current = fiber.alternate;
  if (
    fiber.lanes === NoLanes &&
    (current == null || current.lanes === NoLanes)
  ) {
    const currentState = updateQueue.lastRenderedState;
    const eagerState = basicStateReducer(currentState, action);
    update.hasEagerState = true;
    update.eagerState = eagerState;

    if (Object.is(currentState, eagerState)) {
      enqueueUpdate(updateQueue, update, fiber, NoLane);
      console.log('命中 eagerState 策略', fiber);
      return;
    }
  }

  enqueueUpdate(updateQueue, update, fiber, lane);
  scheduleUpdateOnFiber(fiber, lane);
}

function mountState(initialState) {
  const hook = mountWorkInProgressHook();

  let memoizedState;

  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }

  const queue = createFCUpdateQueue();
  hook.updateQueue = queue;
  hook.baseState = memoizedState;
  hook.memoizedState = memoizedState;

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;
  queue.lastRenderedState = memoizedState;

  return [memoizedState, dispatch];
}

function updateState() {
  const hook = updateWorkInProgressHook();

  const queue = hook.updateQueue;
  const baseState = hook.baseState;
  const pending = queue.shared.pending;

  const current = currentHook;
  let baseQueue = current.baseQueue;

  if (pending != null) {
    if (baseQueue != null) {
      const baseFirst = baseQueue.next;
      const pendingFirst = pending.next;
      baseQueue.next = pendingFirst;
      pending.next = baseFirst;
    }

    baseQueue = pending;
    current.baseQueue = pending;
    queue.shared.pending = null;
  }

  if (baseQueue !== null) {
    const prevState = hook.memoizedState;
    const {
      memoizedState,
      baseQueue: newBaseQueue,
      baseState: newBaseState
    } = processUpdateQueue(baseState, baseQueue, renderLane, update => {
      const skippedLane = update.lane;
      const fiber = currentlyRenderingFiber;
      fiber.lanes = mergeLanes(fiber.lanes, skippedLane);
    });

    if (!Object.is(prevState, memoizedState)) {
      markWorkInProgressReceiveUpdate();
    }

    hook.memoizedState = memoizedState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueue;
    queue.lastRenderedState = memoizedState;
  }

  return [hook.memoizedState, queue.dispatch];
}

function pushEffect(hookFlags, create, destroy, deps) {
  const effect = {
    deps,
    create,
    destroy,
    next: null,
    tag: hookFlags
  };

  const fiber = currentlyRenderingFiber;
  const updateQueue = fiber.updateQueue;
  if (updateQueue == null) {
    const updateQueue = createFCUpdateQueue();
    fiber.updateQueue = updateQueue;
    effect.next = effect;
    updateQueue.lastEffect = effect;
  } else {
    const lastEffect = updateQueue.lastEffect;
    if (lastEffect == null) {
      effect.next = effect;
      updateQueue.lastEffect = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      updateQueue.lastEffect = effect;
    }
  }
  return effect;
}

function mountEffect(create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= PassiveEffect;
  hook.memoizedState = pushEffect(
    Passive | HookHasEffect,
    create,
    undefined,
    nextDeps
  );
}

function updateEffect(create, deps) {
  let destroy;
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        hook.memoizedState = pushEffect(Passive, create, destroy, nextDeps);
        return;
      }
    }

    currentlyRenderingFiber.flags |= PassiveEffect;
    hook.memoizedState = pushEffect(
      Passive | HookHasEffect,
      create,
      destroy,
      nextDeps
    );
  }
}

function startTransition(setPending, callback) {
  setPending(true);
  const prevTransition = currentBatchConfig.transition;
  currentBatchConfig.transition = 1;
  callback();
  setPending(false);
  currentBatchConfig.transition = prevTransition;
}

function mountTransition() {
  const [isPending, setPending] = mountState(false);
  const hook = mountWorkInProgressHook();
  const start = startTransition.bind(null, setPending);
  hook.memoizedState = start;
  return [isPending, start];
}

function updateTransition() {
  const [isPending] = updateState();
  const hook = updateWorkInProgressHook();
  const start = hook.memoizedState;
  return [isPending, start];
}

function mountRef(initialValue) {
  const hook = mountWorkInProgressHook();
  const ref = { current: initialValue };
  hook.memoizedState = ref;
  return ref;
}

function updateRef() {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}

function use(useable) {
  if (useable !== null && typeof useable === 'object') {
    if (typeof useable.then === 'function') {
      const thenable = useable;
      return trackUsedThenable(thenable);
    } else if (useable.$$typeof === REACT_CONTEXT_TYPE) {
      const context = useable;
      return readContext(context);
    }
  }

  throw new Error('不支持的 use 参数' + useable);
}

function mountCallback(callback, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function updateCallback(callback, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;

  if (nextDeps !== null) {
    const prevDeps = prevState[1];
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      return prevState[0];
    }
  }

  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function mountMemo(nextCreate, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

function updateMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;

  if (nextDeps !== null) {
    const prevDeps = prevState[1];
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      return prevState[0];
    }
  }

  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

/**
 * @description: Mount 阶段 Hooks 实现
 */
const HooksDispatcherOnMount = {
  use,
  useRef: mountRef,
  useMemo: mountMemo,
  useState: mountState,
  useEffect: mountEffect,
  useContext: readContext,
  useCallback: mountCallback,
  useTransition: mountTransition
};

/**
 * @description: Update 阶段 Hooks 实现
 */
const HooksDispatcherOnUpdate = {
  use,
  useRef: updateRef,
  useMemo: updateMemo,
  useState: updateState,
  useEffect: updateEffect,
  useContext: readContext,
  useCallback: updateCallback,
  useTransition: updateTransition
};

export function renderWithHooks(workInProgress, Component, lane) {
  renderLane = lane;
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  const current = workInProgress.alternate;

  if (current !== null) {
    // update
    currentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    // mount
    currentDispatcher.current = HooksDispatcherOnMount;
  }

  const props = workInProgress.pendingProps;
  const children = Component(props);

  currentHook = null;
  renderLane = NoLane;
  workInProgressHook = null;
  currentlyRenderingFiber = null;

  return children;
}

export function resetHooksOnUnwind() {
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
}

export function bailoutHook(workInProgress, renderLane) {
  const current = workInProgress.alternate;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.flags &= ~PassiveEffect;
  current.lanes = removeLanes(current.lanes, renderLane);
}
