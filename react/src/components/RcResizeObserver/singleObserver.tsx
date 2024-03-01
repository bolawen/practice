import {
  useRef,
  useEffect,
  forwardRef,
  useCallback,
  cloneElement,
  isValidElement,
  useImperativeHandle
} from 'react';
import findDOMNode from './utils/dom';
import { supportRef } from './utils/ref';
import { useComposeRef } from './hooks/useComposeRef';
import { observe, unobserve } from './utils/observerUtil';

function SingleObserver(props, ref) {
  const { children, disabled } = props;

  const sizeRef = useRef({
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1
  });
  const elementRef = useRef(null);
  const wrapperRef = useRef(null);
  const isRenderProps = typeof children === 'function';
  const mergedChildren = isRenderProps ? children(elementRef) : children;
  const canRef =
    !isRenderProps &&
    isValidElement(mergedChildren) &&
    supportRef(mergedChildren);
  const originRef = canRef ? mergedChildren.ref : null;
  const mergedRef = useComposeRef(originRef, elementRef);
  const propsRef = useRef(props);
  propsRef.current = props;

  const getDom = () =>
    findDOMNode(elementRef.current) ||
    (elementRef.current && typeof elementRef.current === 'object'
      ? findDOMNode(elementRef.current?.nativeElement)
      : null) ||
    findDOMNode(wrapperRef.current);

  const onInternalResize = useCallback(target => {
    const { onResize } = propsRef.current;

    const { width, height } = target.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = target;

    const fixedWidth = Math.floor(width);
    const fixedHeight = Math.floor(height);

    if (
      sizeRef.current.width !== fixedWidth ||
      sizeRef.current.height !== fixedHeight ||
      sizeRef.current.offsetWidth !== offsetWidth ||
      sizeRef.current.offsetHeight !== offsetHeight
    ) {
      const size = {
        width: fixedWidth,
        height: fixedHeight,
        offsetWidth,
        offsetHeight
      };
      sizeRef.current = size;

      const mergedOffsetWidth =
        offsetWidth === Math.round(width) ? width : offsetWidth;
      const mergedOffsetHeight =
        offsetHeight === Math.round(height) ? height : offsetHeight;

      const sizeInfo = {
        ...size,
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight
      };

      if (onResize) {
        Promise.resolve().then(() => {
          onResize(sizeInfo, target);
        });
      }
    }
  }, []);

  useImperativeHandle(ref, () => getDom());

  useEffect(() => {
    const currentElement = getDom();

    if (currentElement && !disabled) {
      observe(currentElement, onInternalResize);
    }

    return () => unobserve(currentElement, onInternalResize);
  }, [elementRef.current, disabled]);

  return (
    <>
      {canRef
        ? cloneElement(mergedChildren, {
            ref: mergedRef
          })
        : mergedChildren}
    </>
  );
}

const SingleObserverWrapper = forwardRef(SingleObserver);

export default SingleObserverWrapper;
