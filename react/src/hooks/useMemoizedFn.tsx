import { useMemo, useRef } from 'react';

function useMemoizedFn(fn) {
  const fnRef = useRef(fn);
  const memoizedFn = useRef();
  fnRef.current = useMemo(() => fn, [fn]);

  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current;
}

export default useMemoizedFn;
