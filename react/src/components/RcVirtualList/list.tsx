import Filler from './filler';
import useEvent from './hooks/useEvent';
import useHeights from './hooks/useHeights';
import useScrollTo from './hooks/useScrollTo';
import useChildren from './hooks/useChildren';
import {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useCallback,
  useImperativeHandle
} from 'react';

function List(props, ref) {
  const {
    data,
    style,
    height,
    itemKey,
    onScroll,
    children,
    className,
    innerProps,
    itemHeight,
    onVirtualScroll,
    prefixCls = 'virtual-list'
  } = props;

  let holderStyle = null;
  let maxScrollHeight = 0;
  const holderRef = useRef();
  const mergedData = data || [];
  const holderInnerRef = useRef();
  const maxScrollHeightRef = useRef(0);
  const verticalScrollBarRef = useRef();
  const horizontalScrollBarRef = useRef();
  const [offsetTop, setOffsetTop] = useState(0);
  const lastVirtualScrollInfoRef = useRef({ x: 0, y: 0 });
  const mergedClassName = `${prefixCls || ''} ${className || ''}`;

  const getKey = useCallback(
    item => {
      if (typeof itemKey === 'function') {
        return itemKey(item);
      }
      return item?.[itemKey];
    },
    [itemKey]
  );

  const [setInstanceRef, collectHeight, heights, heightUpdatedMark] =
    useHeights({ getKey });

  const visibleCalculation = () => {
    let itemTop = 0;
    let startIndex;
    let startOffset;
    let endIndex;

    const dataLen = mergedData.length;

    for (let i = 0; i < dataLen; i += 1) {
      const item = mergedData[i];
      const key = getKey(item);

      const cacheHeight = heights.get(key);
      const currentItemBottom =
        itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);

      if (currentItemBottom >= offsetTop && startIndex === undefined) {
        startIndex = i;
        startOffset = itemTop;
      }

      if (currentItemBottom > offsetTop + height && endIndex === undefined) {
        endIndex = i;
      }

      itemTop = currentItemBottom;
    }

    if (startIndex === undefined) {
      startIndex = 0;
      startOffset = 0;
      endIndex = Math.ceil(height / itemHeight);
    }

    if (endIndex === undefined) {
      endIndex = mergedData.length - 1;
    }

    endIndex = Math.min(endIndex + 1, mergedData.length - 1);

    return {
      end: endIndex,
      start: startIndex,
      offset: startOffset,
      scrollHeight: itemTop
    };
  };

  const {
    end,
    start,
    scrollHeight,
    offset: fillerOffset
  } = useMemo(visibleCalculation, [
    height,
    offsetTop,
    mergedData,
    heightUpdatedMark
  ]);

  const listChildren = useChildren({
    getKey,
    endIndex: end,
    list: mergedData,
    startIndex: start,
    renderFunc: children,
    setNodeRef: setInstanceRef
  });

  function keepInRange(newScrollTop) {
    let newTop = newScrollTop;
    if (!Number.isNaN(maxScrollHeightRef.current)) {
      newTop = Math.min(newTop, maxScrollHeightRef.current);
    }
    newTop = Math.max(newTop, 0);
    return newTop;
  }

  function syncScrollTop(newTop) {
    setOffsetTop(origin => {
      let value;
      if (typeof newTop === 'function') {
        value = newTop(origin);
      } else {
        value = newTop;
      }

      const alignedTop = keepInRange(value);
      holderRef.current.scrollTop = alignedTop;
      return alignedTop;
    });
  }

  const getVirtualScrollInfo = () => ({
    x: 0,
    y: offsetTop
  });

  const triggerScroll = useEvent(() => {
    if (onVirtualScroll) {
      const nextInfo = getVirtualScrollInfo();

      if (
        lastVirtualScrollInfoRef.current.x !== nextInfo.x ||
        lastVirtualScrollInfoRef.current.y !== nextInfo.y
      ) {
        onVirtualScroll(nextInfo);
        lastVirtualScrollInfoRef.current = nextInfo;
      }
    }
  });

  const onFallbackScroll = e => {
    const { scrollTop: newScrollTop } = e.currentTarget;

    if (newScrollTop !== offsetTop) {
      syncScrollTop(newScrollTop);
    }

    onScroll?.(e);
    triggerScroll();
  };

  const delayHideScrollBar = () => {
    verticalScrollBarRef.current?.delayHidden();
    horizontalScrollBarRef.current?.delayHidden();
  };

  const scrollTo = useScrollTo({
    getKey,
    heights,
    itemHeight,
    syncScrollTop,
    data: mergedData,
    containerRef: holderRef,
    triggerFlash: delayHideScrollBar,
    collectHeight: () => collectHeight(true)
  });

  useImperativeHandle(ref, () => ({
    getScrollInfo: getVirtualScrollInfo,
    scrollTo: config => {
      scrollTo(config);
    }
  }));

  maxScrollHeight = scrollHeight - height;
  maxScrollHeightRef.current = maxScrollHeight;
  lastVirtualScrollInfoRef.current = getVirtualScrollInfo();
  if (height) {
    holderStyle = { height, overflowY: 'auto', overflowAnchor: 'none' };
  }

  return (
    <div
      style={{
        ...style,
        position: 'relative'
      }}
      className={mergedClassName}
    >
      <div
        ref={holderRef}
        style={holderStyle}
        onScroll={onFallbackScroll}
        className={`${prefixCls}-holder`}
      >
        <Filler
          ref={holderInnerRef}
          prefixCls={prefixCls}
          height={scrollHeight}
          offsetY={fillerOffset}
          innerProps={innerProps}
          onInnerResize={collectHeight}
        >
          {listChildren}
        </Filler>
      </div>
    </div>
  );
}

const ListWrapper = forwardRef(List);
export default ListWrapper;
