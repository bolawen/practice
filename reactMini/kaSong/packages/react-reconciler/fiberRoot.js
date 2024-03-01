import { NoLane, NoLanes } from './fiberLanes';

export class FiberRootNode {
  constructor(container, hostRootFiber) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;

    this.pingCache = null;
    this.finishedWork = null;
    this.callbackNode = null;
    this.finishedLane = NoLane;

    this.pingdLanes = NoLanes;
    this.pendingLanes = NoLanes;
    this.suspendedLanes = NoLanes;
    this.callbackPriority = NoLane;

    this.pendingPassiveEffects = {
      unmount: [],
      update: []
    };
  }
}
