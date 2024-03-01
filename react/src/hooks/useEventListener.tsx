import useLatest from './useLatest';
import useEffectWithTarget from './useEffectWithTarget';

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

function useEventListener(eventName, handler, options) {
  const handlerRef = useLatest(handler);

  useEffectWithTarget(
    () => {
      const targetElement = getTargetElement(options.target, window);
      if (!targetElement?.addEventListener) {
        return;
      }

      const eventListener = (event: Event) => {
        return handlerRef.current(event);
      };

      targetElement.addEventListener(eventName, eventListener, {
        capture: options.capture,
        once: options.once,
        passive: options.passive
      });

      return () => {
        targetElement.removeEventListener(eventName, eventListener, {
          capture: options.capture
        });
      };
    },
    [eventName, options.capture, options.once, options.passive],
    options.target
  );
}

export default useEventListener;
