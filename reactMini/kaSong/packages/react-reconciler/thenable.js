let suspendedThenable = null;

export const SuspenseException = new Error(
  '这不是真实的错误, 是 Suspense 用来中断渲染的'
);

function noop() {}

export function getSuspenseThenable() {
  if (suspendedThenable === null) {
    throw new Error('应该存在 suspendedThenable, 这是一个 Bug');
  }
  const thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}

export function trackUsedThenable(thenable) {
  switch (thenable.status) {
    case 'fulfilled':
      return thenable.value;
    case 'rejected':
      throw thenable.reason;
    default:
      if (typeof thenable.status === 'string') {
        thenable.then(noop, noop);
      } else {
        const pending = thenable;
        pending.status = 'pending';
        pending.then(
          val => {
            if (pending.status === 'pending') {
              const fulfilled = pending;
              fulfilled.status = 'fulfilled';
              fulfilled.value = val;
            }
          },
          error => {
            if (pending.status === 'pending') {
              const rejected = pending;
              rejected.status = 'rejected';
              rejected.reason = error;
            }
          }
        );
      }
      break;
  }

  suspendedThenable = thenable;
  throw SuspenseException;
}
