import { FiberNode } from './fiber';
import { HostRoot } from './workTags';
import { FiberRootNode } from './fiberRoot';
import { scheduleUpdateOnFiber } from './workLoop';
import { requestUpdateLane } from './fiberLanes.js';
import { createUpdate, enqueueUpdate, createUpdateQueue } from './updateQueue';
import {
  unstable_runWithPriority,
  unstable_ImmediatePriority
} from 'scheduler';

export function createContainer(container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const root = new FiberRootNode(container, hostRootFiber);
  hostRootFiber.updateQueue = createUpdateQueue();
  return root;
}

export function updateContainer(element, root) {
  unstable_runWithPriority(unstable_ImmediatePriority, () => {
    const hostRootFiber = root.current;
    const lane = requestUpdateLane();
    const update = createUpdate(element, lane);
    enqueueUpdate(hostRootFiber.updateQueue, update, hostRootFiber, lane);
    scheduleUpdateOnFiber(hostRootFiber, lane);
  });
  return element;
}
