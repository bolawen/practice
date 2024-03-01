import { cloneElement, useCallback } from 'react';

function Item(props) {
  const { setRef, children } = props;

  const refFunc = useCallback(node => {
    setRef(node);
  }, []);

  return cloneElement(children, {
    ref: refFunc
  });
}

export default Item;
