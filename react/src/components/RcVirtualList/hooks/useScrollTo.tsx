import raf from '../utils/raf';
import { useLayoutEffect, useRef, useState } from 'react';

const MAX_TIMES = 10;

export default function useScrollTo(params) {
  const {
    data,
    getKey,
    heights,
    itemHeight,
    triggerFlash,
    containerRef,
    collectHeight,
    syncScrollTop
  } = params;

  const scrollRef = useRef();
  const [syncState, setSyncState] = useState(null);

  useLayoutEffect(() => {
    if (!syncState || syncState.times >= MAX_TIMES) {
      return;
    }
    if (!containerRef.current) {
      setSyncState(ori => ({ ...ori }));
      return;
    }
    collectHeight();
    const { targetAlign, originAlign, index, offset } = syncState;
    const height = containerRef.current.clientHeight;
    let needCollectHeight = false;
    let newTargetAlign = targetAlign;
    let targetTop = null;

    if (height) {
      const mergedAlign = targetAlign || originAlign;
      let stackTop = 0;
      let itemTop = 0;
      let itemBottom = 0;
      const maxLen = Math.min(data.length - 1, index);
      for (let i = 0; i <= maxLen; i += 1) {
        const key = getKey(data[i]);
        itemTop = stackTop;
        const cacheHeight = heights.get(key);
        itemBottom =
          itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);

        stackTop = itemBottom;
      }
      let leftHeight = mergedAlign === 'top' ? offset : height - offset;
      for (let i = maxLen; i >= 0; i -= 1) {
        const key = getKey(data[i]);
        const cacheHeight = heights.get(key);

        if (cacheHeight === undefined) {
          needCollectHeight = true;
          break;
        }

        leftHeight -= cacheHeight;
        if (leftHeight <= 0) {
          break;
        }
      }

      switch (mergedAlign) {
        case 'top':
          targetTop = itemTop - offset;
          break;
        case 'bottom':
          targetTop = itemBottom - height + offset;
          break;

        default: {
          const { scrollTop } = containerRef.current;
          const scrollBottom = scrollTop + height;
          if (itemTop < scrollTop) {
            newTargetAlign = 'top';
          } else if (itemBottom > scrollBottom) {
            newTargetAlign = 'bottom';
          }
        }
      }
      if (targetTop !== null) {
        syncScrollTop(targetTop);
      }

      if (targetTop !== syncState.lastTop) {
        needCollectHeight = true;
      }
    }

    if (needCollectHeight) {
      setSyncState({
        ...syncState,
        lastTop: targetTop,
        times: syncState.times + 1,
        targetAlign: newTargetAlign
      });
    }
  }, [syncState, containerRef.current]);

  return arg => {
    if (arg == undefined) {
      triggerFlash();
      return;
    }

    raf.cancel(scrollRef.current);

    if (typeof arg === 'number') {
      syncScrollTop(arg);
    } else if (arg && typeof arg === 'object') {
      let index;
      let { align } = arg;

      if ('index' in arg) {
        index = arg.index;
      } else {
        index = data.findIndex(item => getKey(item) === arg.key);
      }

      const { offset = 0 } = arg;

      setSyncState({
        index,
        offset,
        times: 0,
        originAlign: align
      });
    }
  };
}
