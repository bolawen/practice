import { isMemo } from 'react-is';

export function supportRef(nodeOrComponent) {
  const type = isMemo(nodeOrComponent)
    ? nodeOrComponent.type.type
    : nodeOrComponent.type;

  if (typeof type === 'function' && !type.prototype?.render) {
    return false;
  }

  if (
    typeof nodeOrComponent === 'function' &&
    !nodeOrComponent.prototype?.render
  ) {
    return false;
  }

  return true;
}
