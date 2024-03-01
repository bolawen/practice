import {
  HostRoot,
  HostText,
  Fragment,
  HostComponent,
  ContextProvider,
  SuspenseComponent,
  FunctionComponent,
  OffscreenComponent,
  MemoComponent
} from './workTags';
import {
  prepareToReadContext,
  propagateContextChange,
  pushProvider
} from './fiberContext';
import { processUpdateQueue } from './updateQueue';
import { pushSuspenseHandler } from './suspenseContext';
import { NoLanes, includeSomeLanes } from './fiberLanes';
import { bailoutHook, renderWithHooks } from './fiberHooks';

import {
  cloneChildFibers,
  mountChildFibers,
  reconcileChildFibers
} from './childFiber';

import {
  Ref,
  NoFlags,
  Placement,
  DidCapture,
  ChildDeletion
} from './fiberFlags';

import {
  createWorkInProgress,
  createFiberFromFragment,
  createFiberFromOffscreen
} from './fiber';
import { shallowEqual } from '../shared/shallowEquals';

let didReceiveUpdate = false;

function markRef(current, workInprogress) {
  const ref = workInprogress.ref;

  if (
    (current == null && ref !== null) ||
    (current != null && current.ref != ref)
  ) {
    workInprogress.flags |= Ref;
  }
}

export function markWorkInProgressReceiveUpdate() {
  didReceiveUpdate = true;
}

function reconcileChildren(workInProgress, children) {
  const current = workInProgress.alternate;

  if (current !== null) {
    // update 阶段
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current?.child,
      children
    );
  } else {
    // mount 阶段
    workInProgress.child = mountChildFibers(workInProgress, null, children);
  }
}

function updateHostRoot(workInProgress, renderLane) {
  const baseState = workInProgress.memoizedState;
  const updateQueue = workInProgress.updateQueue;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;

  const prevChildren = workInProgress.memoizedState;

  const { memoizedState } = processUpdateQueue(baseState, pending, renderLane);
  workInProgress.memoizedState = memoizedState;

  const current = workInProgress.alternate;
  if (current !== null) {
    if (!current.memoizedState) {
      current.memoizedState = memoizedState;
    }
  }

  const nextChildren = workInProgress.memoizedState;

  if (prevChildren === nextChildren) {
    return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
  }

  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostComponent(workInProgress) {
  const nextProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;
  markRef(workInProgress.alternate, workInProgress);
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateFunctionComponent(workInProgress, Component, renderLane) {
  prepareToReadContext(workInProgress, renderLane);
  const nextChildren = renderWithHooks(workInProgress, Component, renderLane);
  const current = workInProgress.alternate;
  if (current != null && !didReceiveUpdate) {
    bailoutHook(workInProgress, renderLane);
    return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
  }
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateContextProvider(workInProgress, renderLane) {
  const providerType = workInProgress.type;
  const context = providerType._context;
  const newProps = workInProgress.pendingProps;
  const oldProps = workInProgress.memoizedProps;
  const newValue = newProps.value;

  pushProvider(context, newProps.value);

  if (oldProps !== null) {
    const oldValue = oldProps.value;
    if (
      Object.is(oldValue, newValue) &&
      oldProps.children === newProps.children
    ) {
      return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
    } else {
      propagateContextChange(workInProgress, context, renderLane);
    }
  }

  const nextChildren = newProps.children;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function updateFragment(workInProgress) {
  const nextChildren = workInProgress.pendingProps;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
  const primaryChildProps = {
    mode: 'visible',
    children: primaryChildren
  };

  const primaryChildFragment = createFiberFromOffscreen(primaryChildProps);
  workInProgress.child = primaryChildFragment;
  primaryChildFragment.return = workInProgress;
  return primaryChildFragment;
}

function mountSuspenseFallbackChildren(
  workInProgress,
  primaryChildren,
  fallbackChildren
) {
  const primaryChildProps = {
    mode: 'hidden',
    children: primaryChildren
  };

  const primaryChildFragment = createFiberFromOffscreen(primaryChildProps);
  const fallbackChildFragment = createFiberFromFragment(fallbackChildren, null);

  fallbackChildFragment.flags |= Placement;

  primaryChildFragment.return = workInProgress;
  fallbackChildFragment.return = workInProgress;
  primaryChildFragment.sibling = fallbackChildFragment;
  workInProgress.child = primaryChildFragment;

  return fallbackChildFragment;
}

function updateSuspensePrimaryChildren(workInProgress, primaryChildren) {
  const current = workInProgress.alternate;
  const currentPrimaryChildFragment = current.child;
  const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;

  const primaryChildProps = {
    mode: 'visible',
    children: primaryChildren
  };

  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    primaryChildProps
  );

  primaryChildFragment.return = workInProgress;
  primaryChildFragment.sibling = null;
  workInProgress.child = primaryChildFragment;

  if (currentFallbackChildFragment != null) {
    const deletions = workInProgress.deletions;
    if (deletions == null) {
      workInProgress.deletions = [currentFallbackChildFragment];
      workInProgress.flags |= ChildDeletion;
    } else {
      deletions.push(currentFallbackChildFragment);
    }
  }

  return primaryChildFragment;
}

function updateSuspenseFallbackChildren(
  workInProgress,
  primaryChildren,
  fallbackChildren
) {
  const current = workInProgress.alternate;
  const currentPrimaryChildFragment = current.child;
  const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;

  const primaryChildProps = {
    mode: 'hidden',
    children: primaryChildren
  };

  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    primaryChildProps
  );
  let fallbackChildFragment;

  if (currentFallbackChildFragment !== null) {
    fallbackChildFragment = createWorkInProgress(
      currentFallbackChildFragment,
      fallbackChildren
    );
  } else {
    fallbackChildFragment = createFiberFromFragment(fallbackChildren, null);
    fallbackChildFragment.flags |= Placement;
  }

  fallbackChildFragment.return = workInProgress;
  primaryChildFragment.return = workInProgress;
  primaryChildFragment.sibling = fallbackChildFragment;
  workInProgress.child = primaryChildFragment;

  return fallbackChildFragment;
}

function updateSuspenseComponent(workInProgress) {
  const current = workInProgress.alternate;
  const nextProps = workInProgress.pendingProps;

  let showFallback = false;
  const didSuspend = (workInProgress.flags & DidCapture) !== NoFlags;

  if (didSuspend) {
    showFallback = true;
    workInProgress.flags &= ~DidCapture;
  }

  const nextPrimaryChildren = nextProps.children;
  const nextFallbackChildren = nextProps.fallback;

  pushSuspenseHandler(workInProgress);

  if (current == null) {
    if (showFallback) {
      return mountSuspenseFallbackChildren(
        workInProgress,
        nextPrimaryChildren,
        nextFallbackChildren
      );
    } else {
      return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
    }
  } else {
    if (showFallback) {
      return updateSuspenseFallbackChildren(
        workInProgress,
        nextPrimaryChildren,
        nextFallbackChildren
      );
    } else {
      return updateSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
    }
  }
}

function updateOffscreenComponent(workInProgress) {
  const nextProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function checkScheduledUpdateOrContext(current, renderLane) {
  const updateLanes = current.lanes;

  if (includeSomeLanes(updateLanes, renderLane)) {
    return true;
  }
  return false;
}

function bailoutOnAlreadyFinishedWork(workInProgress, renderLane) {
  if (!includeSomeLanes(workInProgress.childLanes, renderLane)) {
    console.log('bailout 整颗子树');
    return null;
  }

  console.log('bailout 当前 Fiber 子树');
  cloneChildFibers(workInProgress);
  return workInProgress.child;
}

function updateMemoComponent(workInProgress, renderLane) {
  /**
   * @description: 满足 bailout 四要素
   * 1. props 浅比较
   */
  const current = workInProgress.alternate;
  const nextProps = workInProgress.pendingProps;
  const Component = workInProgress.type.type;

  if (current != null) {
    const prevProps = current.memoizedProps;

    if (
      shallowEqual(prevProps, nextProps) &&
      current.ref === workInProgress.ref
    ) {
      didReceiveUpdate = false;
      workInProgress.pendingProps = prevProps;

      if (!checkScheduledUpdateOrContext(current, renderLane)) {
        workInProgress.lanes = current.lanes;
        return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
      }
    }
  }
  return updateFunctionComponent(workInProgress, Component, renderLane);
}

export const beginWork = (workInProgress, renderLane) => {
  // bailout 策略
  didReceiveUpdate = false;
  const current = workInProgress.alternate;

  if (current != null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if (oldProps !== newProps || current.type !== workInProgress.type) {
      didReceiveUpdate = true;
    } else {
      const hasScheduledStateOrContext = checkScheduledUpdateOrContext(
        current,
        renderLane
      );
      if (!hasScheduledStateOrContext) {
        didReceiveUpdate = false;

        switch (workInProgress.tag) {
          case ContextProvider:
            const newValue = workInProgress.memoizedProps.value;
            const context = workInProgress.type._context;
            pushProvider(context, newValue);
            break;
          default:
            break;
        }

        return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
      }
    }
  }

  workInProgress.lanes = NoLanes;

  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(workInProgress, renderLane);
    case HostText:
      return null;
    case Fragment:
      return updateFragment(workInProgress);
    case HostComponent:
      return updateHostComponent(workInProgress);
    case FunctionComponent:
      return updateFunctionComponent(
        workInProgress,
        workInProgress.type,
        renderLane
      );
    case ContextProvider:
      return updateContextProvider(workInProgress, renderLane);
    case SuspenseComponent:
      return updateSuspenseComponent(workInProgress);
    case OffscreenComponent:
      return updateOffscreenComponent(workInProgress);
    case MemoComponent:
      return updateMemoComponent(workInProgress, renderLane);
    default:
      console.log('beginWork 未实现的类型');
      break;
  }
  return null;
};
