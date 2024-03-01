import raf from '../utils/raf';
import findDOMNode from '../utils/dom';
import CacheMap from '../utils/cacheMap';
import { useEffect, useRef, useState } from 'react';

export default function useHeights(params) {
  const { getKey } = params;

  const collectRafRef = useRef();
  const instanceRef = useRef(new Map());
  const heightsRef = useRef(new CacheMap());
  const [updatedMark, setUpdatedMark] = useState(0);

  const cancelRaf = () => {
    raf.cancel(collectRafRef.current);
  };

  const collectHeight = (sync = false) => {
    cancelRaf();

    const doCollect = () => {
      instanceRef.current.forEach((element, key) => {
        if (element && element.offsetParent) {
          const htmlElement = findDOMNode(element);
          const { offsetHeight } = htmlElement;
          if (heightsRef.current.get(key) !== offsetHeight) {
            heightsRef.current.set(key, htmlElement.offsetHeight);
          }
        }
      });

      setUpdatedMark(c => c + 1);
    };

    if (sync) {
      doCollect();
    } else {
      collectRafRef.current = raf(doCollect);
    }
  };

  const setInstanceRef = (item, instance) => {
    const key = getKey(item);

    if (instance) {
      instanceRef.current.set(key, instance);
      collectHeight();
    } else {
      instanceRef.current.delete(key);
    }
  };

  useEffect(() => {
    return cancelRaf;
  }, []);

  return [setInstanceRef, collectHeight, heightsRef.current, updatedMark];
}
