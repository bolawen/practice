import {useCallback} from 'react';
import {debounce} from 'lodash';
import useLatest from './useLatest';
import useUnmount from './useUnmount';
import type {DebounceOptions} from '../useDebounce/debounceOptions';

type noop = (...args: any[]) => any;

function useDebounceFn<T extends noop>(fn: T, options: DebounceOptions) {
    const fnRef = useLatest(fn);
    const wait = options?.wait ?? 1000;
    const debounced = useCallback(
        debounce(
            (...args: Parameters<T>): ReturnType<T> => {
                return fnRef.current(...args);
            },
            wait,
            options,
        ),
        [],
    );
    useUnmount(() => {
        debounced.cancel();
    });
    return {
        run: debounced,
        cancel: debounced.cancel,
        flush: debounced.flush,
    };
}

export default useDebounceFn;
