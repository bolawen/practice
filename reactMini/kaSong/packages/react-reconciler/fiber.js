import {
  REACT_MEMO_TYPE,
  REACT_PROVIDER_TYPE,
  REACT_SUSPENSE_TYPE
} from '../shared/ReactSymbols';
import { NoFlags } from './fiberFlags';
import { NoLanes } from './fiberLanes';
import {
  Fragment,
  HostComponent,
  ContextProvider,
  FunctionComponent,
  SuspenseComponent,
  OffscreenComponent,
  MemoComponent
} from './workTags';

export class FiberNode {
  constructor(tag, pendingProps, key) {
    // 存储节点的类型、实例、状态
    this.tag = tag;
    this.key = key || null;
    this.type = null;
    this.stateNode = null;

    // 存储节点的父节点、子节点、兄弟节点信息
    this.return = null;
    this.sibling = null;
    this.child = null;
    this.index = 0;

    // 存储节点的 ref 信息
    this.ref = null;
    this.refCleanup = null;

    // 存储节点的 props、state、更新队列、依赖项信息
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.updateQueue = null;
    this.dependencies = null;

    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.deletions = null;

    // 存储一个 fiberNode 中所有未执行的更新对应的 lane
    this.lanes = NoLanes;
    // 存储一个 fiberNode 子树中所有未执行更新对应的 lane
    this.childLanes = NoLanes;

    // 存储节点的双缓存信息
    this.alternate = null;
  }
}

export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // mount 阶段
    workInProgress = new FiberNode(current.tag, pendingProps, current.key);
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // update 阶段
    workInProgress.pendingProps = pendingProps;
    workInProgress.flags = NoFlags;
    workInProgress.deletions = null;
  }

  workInProgress.ref = current.ref;
  workInProgress.type = current.type;
  workInProgress.child = current.child;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.lanes = current.lanes;
  workInProgress.childLanes = current.childLanes;

  const currentDeps = current.dependencies;
  workInProgress.dependencies =
    currentDeps === null
      ? null
      : {
          lanes: currentDeps.lanes,
          firstContext: currentDeps.firstContext
        };

  return workInProgress;
}

export function createFiberFromElement(element, lanes) {
  const { ref, key, type, props } = element;

  let fiberTag = FunctionComponent;

  if (typeof type === 'string') {
    fiberTag = HostComponent;
  } else if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_PROVIDER_TYPE:
        fiberTag = ContextProvider;
        break;
      case REACT_MEMO_TYPE:
        fiberTag = MemoComponent;
        break;
      default:
        break;
    }
  } else if (type === REACT_SUSPENSE_TYPE) {
    fiberTag = SuspenseComponent;
  } else if (typeof type !== 'function') {
    console.log('未定义的 type 类型', element);
  }

  const fiber = new FiberNode(fiberTag, props, key);

  fiber.ref = ref;
  fiber.type = type;
  fiber.lanes = lanes;

  return fiber;
}

export function createFiberFromFragment(elements, key) {
  const fiber = new FiberNode(Fragment, elements, key);
  return fiber;
}

export function createFiberFromOffscreen(pendingProps) {
  const fiber = new FiberNode(OffscreenComponent, pendingProps, null);
  return fiber;
}
