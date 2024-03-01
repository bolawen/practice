import { HostRoot } from './workTags';
import { beginWork } from './beginWork';
import { throwException } from './fiberThrow';
import { completeWork } from './completeWork';
import { createWorkInProgress } from './fiber';
import { unwindWork } from './fiberUnwindWork';
import { resetHooksOnUnwind } from './fiberHooks';
import { Passive, HookHasEffect } from './hookEffectTags';
import { scheduleMicroTask } from '../react-dom/hostConfig';
import { MutationMask, NoFlags, PassiveMask } from './fiberFlags';
import { SuspenseException, getSuspenseThenable } from './thenable';
import { flushSyncCallbacks, scheduleSyncCallback } from './syncTaskQueue';

import {
  NoLane,
  SyncLane,
  mergeLanes,
  getNextLane,
  markRootFinished,
  markRootSuspended,
  lanesToSchedulerPriority
} from './fiberLanes';

import {
  commitLayoutEffects,
  commitMutationEffects,
  commitHookEffectListCreate,
  commitHookEffectListDestroy,
  commitHookEffectListUnmount
} from './commitWork';

import {
  unstable_cancelCallback,
  unstable_shouldYield as shouldYield,
  unstable_NormalPriority as NormalPriority,
  unstable_scheduleCallback as scheduleCallback
} from 'scheduler';

let workInProgress = null;
let rootDoesHasPassiveEffects = false;
let workInProgressRootRenderLane = NoLane;

const NotSuspended = 0;
const SuspendedOnData = 1;

let workInProgressThrownValue = null;
let workInProgressSuspendedReason = NotSuspended;

const RootInProgress = 0;
const RootInComplete = 1;
const RootCompleted = 2;
const RootDidNotComplete = 3;
let workInProgressRootExitStatus = RootInProgress;

function prepareFreshStack(root, lane) {
  root.finishedWork = null;
  root.finishedLane = NoLane;
  workInProgressRootRenderLane = lane;
  workInProgress = createWorkInProgress(root.current, {});

  workInProgressRootExitStatus = RootInProgress;
  workInProgressSuspendedReason = NotSuspended;
  workInProgressThrownValue = null;
}

function completeUnitOfWork(fiber) {
  let node = fiber;
  do {
    completeWork(node);

    const sibling = node.sibling;
    if (sibling) {
      workInProgress = sibling;
      return;
    }
    node = node.return;
    workInProgress = node;
  } while (node !== null);
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber, workInProgressRootRenderLane);
  fiber.memoizedProps = fiber.pendingProps;

  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    workInProgress = next;
  }
}

function flushPassiveEffects(pendingPassiveEffects) {
  let didFlushPassiveEffect = false;

  pendingPassiveEffects.unmount.forEach(effect => {
    didFlushPassiveEffect = true;
    commitHookEffectListUnmount(Passive, effect);
  });
  pendingPassiveEffects.unmount = [];
  pendingPassiveEffects.update.forEach(effect => {
    didFlushPassiveEffect = true;
    commitHookEffectListDestroy(Passive | HookHasEffect, effect);
  });
  pendingPassiveEffects.update.forEach(effect => {
    didFlushPassiveEffect = true;
    commitHookEffectListCreate(Passive | HookHasEffect, effect);
  });
  pendingPassiveEffects.update = [];
  flushSyncCallbacks();
  return didFlushPassiveEffect;
}

function commitRoot(root) {
  const finishedWork = root.finishedWork;

  if (finishedWork == null) {
    return;
  }

  const lane = root.finishedLane;

  if (lane === NoLane) {
    console.log('commitRoot root.finishedLane 不应该是 NoLane');
  }

  root.finishedWork = null;
  root.finishedLane = NoLane;
  markRootFinished(root, lane);

  if (
    (finishedWork.flags & PassiveMask) !== NoFlags ||
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHasPassiveEffects) {
      rootDoesHasPassiveEffects = true;
      scheduleCallback(NormalPriority, () => {
        flushPassiveEffects(root.pendingPassiveEffects);
        return;
      });
    }
  }
  /**
   * @description: 判断是否存在三个子阶段需要执行的操作
   */
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;

  if (rootHasEffect || subtreeHasEffects) {
    commitMutationEffects(finishedWork, root);
    root.current = finishedWork;
    commitLayoutEffects(finishedWork, root);
  } else {
    root.current = finishedWork;
  }

  rootDoesHasPassiveEffects = false;
  ensureRootIsScheduled(root);
}

function unwindUnitOfWork(unitOfWork) {
  let incompleteWork = unitOfWork;

  do {
    const next = unwindWork(incompleteWork);
    if (next !== null) {
      workInProgress = next;
      return;
    }

    const returnFiber = incompleteWork.return;
    if (returnFiber != null) {
      returnFiber.deletions = null;
    }

    incompleteWork = returnFiber;
  } while (incompleteWork !== null);

  workInProgress = null;
  workInProgressRootExitStatus = RootDidNotComplete;
}

function workLoopSync() {
  while (workInProgress != null) {
    performUnitOfWork(workInProgress);
  }
}

function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, lane) {
  // 1. 重置 FunctionComponent 的全局变量
  resetHooksOnUnwind();
  // 2. use 请求返回后重新触发更新 / ErrorBoundary 捕获错误
  throwException(root, thrownValue, lane);
  // 3. unwind 流程
  unwindUnitOfWork(unitOfWork);
}

function handleThrow(root, thrownValue) {
  if (thrownValue === SuspenseException) {
    thrownValue = getSuspenseThenable();
    workInProgressSuspendedReason = SuspendedOnData;
  }

  workInProgressThrownValue = thrownValue;
}

function workLoopConcurrent() {
  while (workInProgress != null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

/**
 * @description: 防止进入死循环
 */
let retries = 0;

function renderRoot(root, lane, shouldTimesSlice) {
  if (workInProgressRootRenderLane !== lane) {
    prepareFreshStack(root, lane);
  }

  do {
    try {
      if (
        workInProgressSuspendedReason !== NotSuspended &&
        workInProgress !== null
      ) {
        const thrownValue = workInProgressThrownValue;
        workInProgressSuspendedReason = NotSuspended;
        workInProgressThrownValue = null;
        throwAndUnwindWorkLoop(root, workInProgress, thrownValue, lane);
      }

      shouldTimesSlice ? workLoopConcurrent() : workLoopSync();
      break;
    } catch (e) {
      console.log('workLoop renderRoot 发生错误', e);

      retries++;

      if (retries > 20) {
        console.log('此时已经进入死循环，不再执行 workLoop');
        break;
      }

      handleThrow(root, e);
    }
  } while (true);

  if (workInProgressRootExitStatus !== RootInProgress) {
    return workInProgressRootExitStatus;
  }

  if (shouldTimesSlice && workInProgress !== null) {
    return RootInComplete;
  }

  if (!shouldTimesSlice && workInProgress !== null) {
    console.log('renderRoot 结束之后 workInProgress 不应该存在');
  }

  return RootCompleted;
}

/**
 * @description: 并发更新
 */
export function performConcurrentWorkOnRoot(root, didTimeout) {
  const currentCallback = root.callbackNode;
  const didFlushPassiveEffect = flushPassiveEffects(root.pendingPassiveEffects);

  if (didFlushPassiveEffect) {
    if (root.callbackNode !== currentCallback) {
      return null;
    }
  }

  const lane = getNextLane(root);
  const currentCallbackNode = root.callbackNode;

  if (lane === NoLane) {
    return null;
  }
  const needSync = lane === SyncLane || didTimeout;
  const exitStatus = renderRoot(root, lane, !needSync);

  switch (exitStatus) {
    case RootInComplete:
      if (root.callbackNode !== currentCallbackNode) {
        return null;
      }
      return performConcurrentWorkOnRoot.bind(null, root);
    case RootCompleted:
      const finishedWork = root.current.alternate;
      root.finishedWork = finishedWork;
      root.finishedLane = lane;
      workInProgressRootRenderLane = NoLane;
      commitRoot(root);
      break;
    case RootDidNotComplete:
      workInProgressRootRenderLane = NoLane;
      markRootSuspended(root, lane);
      ensureRootIsScheduled(root);
      break;
    default:
      console.log('performConcurrentWorkOnRoot 未实现的逻辑');
      break;
  }
}

/**
 * @description: 同步更新
 * @param {*} root
 * @param {*} lane
 */
export function performSyncWorkOnRoot(root) {
  const nextLane = getNextLane(root);

  if (nextLane !== SyncLane) {
    ensureRootIsScheduled(root);
    return;
  }

  const exitStatus = renderRoot(root, nextLane, false);

  switch (exitStatus) {
    case RootCompleted:
      const finishedWork = root.current.alternate;
      root.finishedWork = finishedWork;
      root.finishedLane = nextLane;
      workInProgressRootRenderLane = NoLane;
      commitRoot(root);
      break;
    case RootDidNotComplete:
      workInProgressRootRenderLane = NoLane;
      markRootSuspended(root, nextLane);
      ensureRootIsScheduled(root);
      break;
    default:
      console.log('performSyncWorkOnRoot 未实现的逻辑');
      break;
  }
}

export function markUpdateLaneFromFiberToRoot(fiber, lane) {
  let node = fiber;
  let parent = node.return;
  while (parent !== null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    const alternate = parent.alternate;
    if (alternate != null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }

    node = parent;
    parent = node.return;
  }

  if (node.tag === HostRoot) {
    return node.stateNode;
  }

  return null;
}

export function markRootUpdated(root, lane) {
  root.pendingLanes = mergeLanes(root.pendingLanes, lane);
}

export function ensureRootIsScheduled(root) {
  const updateLane = getNextLane(root);
  const existingCallback = root.callbackNode;

  if (updateLane === NoLane) {
    if (existingCallback !== null) {
      unstable_cancelCallback(existingCallback);
    }
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }

  const currentPriority = updateLane;
  const prevPriority = root.callbackPriority;

  if (currentPriority === prevPriority) {
    return;
  }

  if (existingCallback !== null) {
    unstable_cancelCallback(existingCallback);
  }

  let newCallbackNode = null;

  if (updateLane === SyncLane) {
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
    scheduleMicroTask(flushSyncCallbacks);
  } else {
    const schedulerPriority = lanesToSchedulerPriority(updateLane);
    newCallbackNode = scheduleCallback(
      schedulerPriority,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }

  root.callbackNode = newCallbackNode;
  root.callbackPriority = currentPriority;
}

export function scheduleUpdateOnFiber(fiber, lane) {
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  markRootUpdated(root, lane);
  ensureRootIsScheduled(root);
}
