import {
  unstable_IdlePriority,
  unstable_NormalPriority,
  unstable_ImmediatePriority,
  unstable_UserBlockingPriority,
  unstable_getCurrentPriorityLevel
} from 'scheduler';
import internals from 'shared/internals';

export const NoLane = 0b00000000;
export const NoLanes = 0b00000000;
export const SyncLane = 0b00000001;
export const InputContinuousLane = 0b00000010;
export const DefaultLane = 0b00000100;
export const TransitionLane = 0b00001000;
export const IdleLane = 0b00010000;

const { currentBatchConfig: ReactCurrentBatchConfig } = internals;

export function lanesToSchedulerPriority(lanes) {
  const lane = getHighestPriorityLane(lanes);

  if (lane === SyncLane) {
    return unstable_ImmediatePriority;
  }

  if (lane === InputContinuousLane) {
    return unstable_UserBlockingPriority;
  }

  if (lane === DefaultLane) {
    return unstable_NormalPriority;
  }

  return unstable_IdlePriority;
}

function schedulerPriorityToLane(schedulerPriority) {
  if (schedulerPriority === unstable_ImmediatePriority) {
    return SyncLane;
  }

  if (schedulerPriority === unstable_UserBlockingPriority) {
    return InputContinuousLane;
  }

  if (schedulerPriority === unstable_NormalPriority) {
    return DefaultLane;
  }

  return NoLane;
}

export function mergeLanes(laneA, laneB) {
  return laneA | laneB;
}

export function requestUpdateLane() {
  const isTransition = ReactCurrentBatchConfig.transition !== null;

  if (isTransition) {
    return TransitionLane;
  }

  const currentSchedulerPriority = unstable_getCurrentPriorityLevel();
  const lane = schedulerPriorityToLane(currentSchedulerPriority);
  return lane;
}

export function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}

export function markRootFinished(root, lane) {
  root.pendingLanes &= ~lane;
  root.suspendedLanes = NoLanes;
  root.pingdLanes = NoLanes;
}

export function isSubsetOfLanes(set, subset) {
  return (set & subset) === subset;
}

export function markRootSuspended(root, suspendedLane) {
  root.suspendedLanes |= suspendedLane;
  root.pendingLanes &= ~suspendedLane;
}

export function markRootPinged(root, pingdLane) {
  root.pingdLanes |= root.suspendedLanes & pingdLane;
}

export function getNextLane(root) {
  const pendingLanes = root.pendingLanes;

  if (pendingLanes === NoLanes) {
    return NoLane;
  }

  let nextLane = NoLane;
  const suspendedLanes = pendingLanes & ~root.suspendedLanes;

  if (suspendedLanes !== NoLanes) {
    nextLane = getHighestPriorityLane(suspendedLanes);
  } else {
    const pingedLanes = pendingLanes & root.pingdLanes;
    if (pingedLanes !== NoLanes) {
      nextLane = getHighestPriorityLane(pingedLanes);
    }
  }

  return nextLane;
}

export function includeSomeLanes(set, subset) {
  return (set & subset) !== NoLanes;
}

export function removeLanes(set, subset) {
  return set & ~subset;
}
