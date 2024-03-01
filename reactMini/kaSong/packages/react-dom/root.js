import {
  createContainer,
  updateContainer
} from 'react-reconciler/fiberReconciler';
import { initEvent } from './syntheticEvent';

export function createRoot(container) {
  const root = createContainer(container);

  return {
    render(element) {
      initEvent(container, 'click');
      return updateContainer(element, root);
    }
  };
}
