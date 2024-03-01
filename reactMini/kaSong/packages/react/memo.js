import { REACT_MEMO_TYPE } from '../shared/ReactSymbols';

export function memo(type, compare) {
  const fiberType = {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare
  };

  return fiberType;
}
