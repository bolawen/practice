export const suspenseHandlerStack = [];

export function getSuspenseHandler() {
  return suspenseHandlerStack[suspenseHandlerStack.length - 1];
}

export function pushSuspenseHandler(handler) {
  suspenseHandlerStack.push(handler);
}

export function popSuspenseHandler() {
  suspenseHandlerStack.pop();
}
