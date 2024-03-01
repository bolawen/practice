import useSize from './useSize';
import useLatest from './useLatest';
import useMemoizedFn from './useMemoizedFn';
import useUpdateEffect from './useUpdateEffect';
import useEventListener from './useEventListener';
import { useEffect, useMemo, useRef, useState } from 'react';

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

function useVirtualList(list, options) {
  const { overscan = 5, itemHeight, wrapperTarget, containerTarget } = options;

  const size = useSize(containerTarget);
  const itemHeightRef = useLatest(itemHeight);
  const [targetList, setTargetList] = useState([]);
  const scrollTriggerByScrollToFunc = useRef(false);
  const [wrapperStyle, setWrapperStyle] = useState({});

  const getVisibleCount = (containerHeight, fromIndex) => {
    if (typeof itemHeightRef.current === 'number') {
      return Math.ceil(containerHeight / itemHeightRef.current);
    }

    let sum = 0;
    let endIndex = 0;
    for (let i = fromIndex; i < list.length; i++) {
      const height = itemHeightRef.current(i, list[i]);
      sum += height;
      endIndex = i;
      if (sum >= containerHeight) {
        break;
      }
    }
    return endIndex - fromIndex;
  };

  const getOffset = scrollTop => {
    if (typeof itemHeightRef.current === 'number') {
      return Math.floor(scrollTop / itemHeightRef.current) + 1;
    }

    let sum = 0;
    let offset = 0;
    for (let i = 0; i < list.length; i++) {
      const height = itemHeightRef.current(i, list[i]);
      sum += height;
      if (sum >= scrollTop) {
        offset = i;
        break;
      }
    }
    return offset + 1;
  };

  const getDistanceTop = index => {
    if (typeof itemHeightRef.current === 'number') {
      const height = index * itemHeightRef.current;
      return height;
    }

    const height = list
      .slice(0, index)
      .reduce((sum, _, i) => sum + itemHeightRef.current(i, list[i]), 0);
    return height;
  };

  const totalHeight = useMemo(() => {
    if (typeof itemHeightRef.current === 'number') {
      return list.length * itemHeightRef.current;
    }
    return list.reduce(
      (sum, _, index) => sum + itemHeightRef.current(index, list[index]),
      0
    );
  }, [list]);

  const calculateRange = () => {
    const container = getTargetElement(containerTarget);

    if (container) {
      const { scrollTop, clientHeight } = container;

      const offset = getOffset(scrollTop);
      const visibleCount = getVisibleCount(clientHeight, offset);

      const start = Math.max(0, offset - overscan);
      const end = Math.min(list.length, offset + visibleCount + overscan);

      const offsetTop = getDistanceTop(start);

      setWrapperStyle({
        height: totalHeight - offsetTop + 'px',
        marginTop: offsetTop + 'px'
      });

      setTargetList(
        list.slice(start, end).map((ele, index) => ({
          data: ele,
          index: index + start
        }))
      );
    }
  };

  useUpdateEffect(() => {
    const wrapper = getTargetElement(wrapperTarget);
    if (wrapper) {
      Object.keys(wrapperStyle).forEach(
        key => (wrapper.style[key] = wrapperStyle[key])
      );
    }
  }, [wrapperStyle]);

  useEffect(() => {
    if (!size?.width || !size?.height) {
      return;
    }
    calculateRange();
  }, [size?.width, size?.height, list]);

  useEventListener(
    'scroll',
    e => {
      if (scrollTriggerByScrollToFunc.current) {
        scrollTriggerByScrollToFunc.current = false;
        return;
      }
      e.preventDefault();
      calculateRange();
    },
    {
      target: containerTarget
    }
  );

  const scrollTo = (index: number) => {
    const container = getTargetElement(containerTarget);
    if (container) {
      scrollTriggerByScrollToFunc.current = true;
      container.scrollTop = getDistanceTop(index);
      calculateRange();
    }
  };

  return [targetList, useMemoizedFn(scrollTo)];
}

export default useVirtualList;
