import { forwardRef } from 'react';
import ResizeObserver from '../RcResizeObserver';

function Filler(props, ref) {
  const { height, offsetY, children, prefixCls, innerProps, onInnerResize } =
    props;

  const mergeClassName = `${prefixCls}-holder-inner`;

  let outerStyle = {};
  let innerStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  if (offsetY !== undefined) {
    outerStyle = {
      height,
      overflow: 'hidden',
      position: 'relative'
    };

    innerStyle = {
      ...innerStyle,
      top: 0,
      left: 0,
      right: 0,
      position: 'absolute',
      transform: `translateY(${offsetY}px)`
    };
  }

  return (
    <div style={outerStyle}>
      <ResizeObserver
        onResize={({ offsetHeight }) => {
          if (offsetHeight && onInnerResize) {
            onInnerResize();
          }
        }}
      >
        <div
          ref={ref}
          style={innerStyle}
          className={mergeClassName}
          {...innerProps}
        >
          {children}
        </div>
      </ResizeObserver>
    </div>
  );
}

const FillerWrapper = forwardRef(Filler);
export default FillerWrapper;
