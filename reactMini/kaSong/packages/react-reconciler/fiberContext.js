import { markWorkInProgressReceiveUpdate } from './beginWork';
import {
  NoLanes,
  includeSomeLanes,
  isSubsetOfLanes,
  mergeLanes
} from './fiberLanes';
import { ContextProvider } from './workTags';

let lastContextDep = null;
let prevContextValue = null;
const prevContextValueStack = [];

export function pushProvider(context, newValue) {
  prevContextValueStack.push(prevContextValue);
  prevContextValue = context._currentValue;
  context._currentValue = newValue;
}

export function popProvider(context) {
  context._currentValue = prevContextValue;
  prevContextValue = prevContextValueStack.pop();
}

export function prepareToReadContext(workInProgress, renderLane) {
  lastContextDep = null;

  const deps = workInProgress.dependencies;
  if (deps !== null) {
    const firstContext = deps.firstContext;
    if (firstContext != null) {
      if (includeSomeLanes(deps.lanes, renderLane)) {
        markWorkInProgressReceiveUpdate();
      }
      deps.firstContext = null;
    }
  }
}

export function readContext(consumer, context) {
  if (consumer == null) {
    throw new Error('请在函数组件内调用 useContext');
  }

  const value = context._currentValue;

  const contextItem = {
    context,
    next: null,
    memoizedState: value
  };

  if (lastContextDep == null) {
    lastContextDep = contextItem;
    consumer.dependencies = {
      lanes: NoLanes,
      firstContext: contextItem
    };
  } else {
    lastContextDep = lastContextDep.next = contextItem;
  }

  return value;
}

export function propagateContextChange(workInProgress, context, renderLane) {
  let fiber = workInProgress.child;
  if (fiber !== null) {
    fiber.return = workInProgress;
  }

  while (fiber !== null) {
    let nextFiber = null;
    const deps = fiber.dependencies;
    if (deps !== null) {
      nextFiber = fiber.child;
      let contextItem = deps.firstContext;
      while (contextItem !== null) {
        if (contextItem.context === context) {
          fiber.lanes = mergeLanes(fiber.lanes, renderLane);
          const alternate = fiber.alternate;
          if (alternate !== null) {
            alternate.lanes = mergeLanes(alternate.lanes, renderLane);
          }
          scheduleContextWorkOnParentPath(
            fiber.return,
            workInProgress,
            renderLane
          );
          deps.lanes = mergeLanes(deps.lanes, renderLane);
          break;
        }
        contextItem = contextItem.next;
      }
    } else if (fiber.tag === ContextProvider) {
      nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
    } else {
      nextFiber = fiber.child;
    }

    if (nextFiber !== null) {
      nextFiber.return = fiber;
    } else {
      nextFiber = fiber;
      while (nextFiber !== null) {
        if (nextFiber === workInProgress) {
          nextFiber = null;
          break;
        }
        let sibling = nextFiber.sibling;
        if (sibling !== null) {
          sibling.return = nextFiber.return;
          nextFiber = sibling;
          break;
        }
        nextFiber = nextFiber.return;
      }
    }
    fiber = nextFiber;
  }
}

function scheduleContextWorkOnParentPath(from, to, renderLane) {
  let node = from;

  while (node !== null) {
    const alternate = node.alternate;
    if (!isSubsetOfLanes(node.childLanes, renderLane)) {
      node.childLanes = mergeLanes(node.childLanes, renderLane);
      if (alternate !== null) {
        alternate.childLanes = mergeLanes(alternate.childLanes, renderLane);
      }
    } else if (
      alternate != null &&
      !isSubsetOfLanes(alternate.childLanes, renderLane)
    ) {
      alternate.childLanes = mergeLanes(alternate.childLanes, renderLane);
    }

    if (node === to) {
      break;
    }
    node = node.return;
  }
}
