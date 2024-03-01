import useUnmount from './useUnmount';
import { useEffect, useRef } from 'react';

function depsAreSame(oldDeps, deps) {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }
  return true;
}

function getTargetElement(target, defaultElement) {
  if (!target) {
    return defaultElement;
  }

  let targetElement;

  if (typeof target === 'function') {
    targetElement = target();
  } else if ('current' in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
}

function useLayoutEffectWithTarget(effect, deps, target) {
  const unLoadRef = useRef();
  const lastDepsRef = useRef([]);
  const hasInitRef = useRef(false);
  const lastElementRef = useRef([]);

  useEffect(() => {
    const targets = Array.isArray(target) ? target : [target];
    const els = targets.map(item => getTargetElement(item));

    if (!hasInitRef.current) {
      hasInitRef.current = true;
      lastElementRef.current = els;
      lastDepsRef.current = deps;

      unLoadRef.current = effect();
      return;
    }

    if (
      els.length !== lastElementRef.current.length ||
      !depsAreSame(els, lastElementRef.current) ||
      !depsAreSame(deps, lastDepsRef.current)
    ) {
      unLoadRef.current?.();

      lastElementRef.current = els;
      lastDepsRef.current = deps;
      unLoadRef.current = effect();
    }
  });

  useUnmount(() => {
    unLoadRef.current?.();
    hasInitRef.current = false;
  });
}

export default useLayoutEffectWithTarget;
