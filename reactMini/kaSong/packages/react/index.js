import { jsx } from './jsx';
import currentBatchConfig from './currentBatchConfig';
import currentDispatcher, { resolveDispatcher } from './currentDispatcher';

export const useState = initialState => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
};

export const useEffect = (create, deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
};

export const useTransition = () => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useTransition();
};

export const useRef = initialValue => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
};

export const useContext = context => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useContext(context);
};

export const use = useable => {
  const dispatcher = resolveDispatcher();
  return dispatcher.use(useable);
};

export const useMemo = (nextCreate, deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useMemo(nextCreate, deps);
};

export const useCallback = (callback, deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useCallback(callback, deps);
};

export { Fragment, Suspense } from './jsx.js';
/**
 * @description: React 内部数据共享层
 */
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
  currentBatchConfig
};

export { jsx as createElement } from './jsx';

export { createContext } from './context.js';

export { memo } from './memo.js';

export default {
  version: '0.0.0',
  createElement: jsx,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
};
