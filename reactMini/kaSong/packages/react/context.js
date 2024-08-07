import {
  REACT_CONTEXT_TYPE,
  REACT_PROVIDER_TYPE
} from '../shared/ReactSymbols';

export function createContext(defaultValue) {
  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    _currentValue: defaultValue
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  };

  return context;
}
