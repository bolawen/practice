import { popProvider } from './fiberContext';
import { popSuspenseHandler } from './suspenseContext';
import { ContextProvider, SuspenseComponent } from './workTags';
import { DidCapture, NoFlags, ShouldCapture } from './fiberFlags';

export function unwindWork(workInProgress) {
  const flags = workInProgress.flags;

  switch (workInProgress.tag) {
    case SuspenseComponent:
      popSuspenseHandler();

      if (
        (flags & ShouldCapture) !== NoFlags &&
        (flags & DidCapture) === NoFlags
      ) {
        workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
        return workInProgress;
      }
      break;
    case ContextProvider:
      const context = workInProgress.type._context;
      popProvider(context);
      return null;
    default:
      return null;
  }

  return null;
}
