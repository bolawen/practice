import { useCallback, useRef } from 'react';

export default function useEvent(callback) {
  const fnRef = useRef<any>();
  fnRef.current = callback;

  const memoFn = useCallback((...args: any) => fnRef.current?.(...args), []);

  return memoFn;
}
