import { forwardRef } from 'react';
import toArray from './utils/children';
import SingleObserver from './singleObserver';

const INTERNAL_PREFIX_KEY = 'observer-key';

function ResizeObserver(props, ref) {
  const { children } = props;
  const childNodes =
    typeof children === 'function' ? [children] : toArray(children);

  return childNodes.map((child, index) => {
    const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
    return (
      <SingleObserver {...props} key={key} ref={index === 0 ? ref : undefined}>
        {child}
      </SingleObserver>
    );
  });
}

const ResizeObserverWrapper = forwardRef(ResizeObserver);
export default ResizeObserverWrapper;
