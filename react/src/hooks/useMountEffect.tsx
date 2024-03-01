import { useRef, useEffect } from 'react';

function useMountEffect(depsFn: Function, effectFn: Function) {
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted.current && depsFn()) {
      effectFn();
      isMounted.current = false;
    }
  }, [depsFn]);
}

export default useMountEffect;
