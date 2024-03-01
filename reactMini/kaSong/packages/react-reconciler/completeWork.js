import {
  HostRoot,
  HostText,
  Fragment,
  MemoComponent,
  HostComponent,
  ContextProvider,
  FunctionComponent,
  OffscreenComponent,
  SuspenseComponent
} from './workTags';
import {
  createInstance,
  appendInitialChild,
  createTextInstance
} from 'react-dom/hostConfig';
import { popProvider } from './fiberContext';
import { NoLanes, mergeLanes } from './fiberLanes';
import { popSuspenseHandler } from './suspenseContext';
import { updateFiberProps } from 'react-dom/syntheticEvent';
import { Ref, Update, NoFlags, Visibility } from './fiberFlags';

function markRef(fiber) {
  fiber.flags |= Ref;
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node?.stateNode);
    } else if (node.child != null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === workInProgress) {
      return;
    }

    while (node.sibling == null) {
      if (node.return == null || node.return == workInProgress) {
        return;
      }
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

/**
 * @description: completeWork 性能优化策略: 冒泡 Flags
 * @param {*} fiber
 * 作用: Flags 分布在不同的  fiberNode 中, 通过 CompleteWork 向上归并的过程, 将子 FiberNode 的 Flags 冒泡到父 FiberNode 中
 *
 */
function bubbleProperties(workInProgress) {
  let subtreeFlags = NoFlags;
  let child = workInProgress.child;
  let newChildLanes = NoLanes;

  while (child != null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    newChildLanes = mergeLanes(
      newChildLanes,
      mergeLanes(child.lanes, child.childLanes)
    );

    child.return = workInProgress;
    child = child.sibling;
  }

  workInProgress.subtreeFlags |= subtreeFlags;
  workInProgress.childLanes = newChildLanes;
}

function markUpdate(fiber) {
  fiber.flags |= Update;
}

export const completeWork = workInProgress => {
  const newProps = workInProgress.pendingProps;
  const current = workInProgress.alternate;

  switch (workInProgress.tag) {
    case HostComponent:
      if (current != null && workInProgress.stateNode) {
        updateFiberProps(workInProgress.stateNode, newProps);

        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        const instance = createInstance(workInProgress.type, newProps);
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;

        if (workInProgress.ref !== null) {
          markRef(workInProgress);
        }
      }

      bubbleProperties(workInProgress);
      return null;
    case HostText:
      if (current != null && workInProgress.stateNode) {
        const oldText = current.memoizedProps.content;
        const newText = newProps.content;

        if (oldText !== newText) {
          markUpdate(workInProgress);
        }
      } else {
        const instance = createTextInstance(newProps.content);
        workInProgress.stateNode = instance;
      }
      bubbleProperties(workInProgress);
      return null;
    case HostRoot:
    case Fragment:
    case FunctionComponent:
      bubbleProperties(workInProgress);
      return null;
    case ContextProvider:
      const context = workInProgress.type._context;
      popProvider(context);
      bubbleProperties(workInProgress);
      return;
    case SuspenseComponent:
      popSuspenseHandler();
      const offscreenFiber = workInProgress.child;
      const isHidden = offscreenFiber.pendingProps.mode === 'hidden';
      const currentOffscreenFiber = offscreenFiber.alternate;
      if (currentOffscreenFiber != null) {
        const wasHidden = currentOffscreenFiber.pendingProps.mode === 'hidden';
        if (isHidden !== wasHidden) {
          offscreenFiber.flags |= Visibility;
          bubbleProperties(offscreenFiber);
        }
      } else if (isHidden) {
        offscreenFiber.flags |= Visibility;
        bubbleProperties(offscreenFiber);
      }
      bubbleProperties(workInProgress);
      return;
    case OffscreenComponent:
      bubbleProperties(workInProgress);
      return;
    case MemoComponent:
      bubbleProperties(workInProgress);
      return;
    default:
      console.log('completeWork 未实现的类型');
      break;
  }
};
