import { Fragment, HostText } from './workTags';
import { ChildDeletion, Placement } from './fiberFlags';
import {
  REACT_ELEMENT_TYPE,
  REACT_FRAGMENT_TYPE
} from '../shared/ReactSymbols';
import {
  FiberNode,
  createFiberFromElement,
  createFiberFromFragment,
  createWorkInProgress
} from './fiber';

function useFiber(fiber, pendingProps) {
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}

function updateFragment(returnFiber, current, elements, key, existingChildren) {
  let fiber;
  if (!current || current.tag !== Fragment) {
    fiber = createFiberFromFragment(elements, key);
  } else {
    existingChildren.delete(key);
    fiber = useFiber(current, elements);
  }
  fiber.return = returnFiber;
  return fiber;
}

function ChildReconciler(shouldTrackEffects) {
  /**
   * @description: 删除子节点
   */
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackEffects) {
      return;
    }

    const deletions = returnFiber.deletions;

    if (deletions == null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }

  /**
   * @description: 删除剩余节点
   */
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackEffects) {
      return;
    }

    let childToDelete = currentFirstChild;
    while (childToDelete != null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }

  /**
   * @description: reconcileSingleElement 工作
   * @param {*} returnFiber
   * @param {*} currentFiber
   * @param {*} element
   * 作用: 根据 element 创建 Fiber 并返回
   * 逻辑:
   */
  function reconcileSingleElement(returnFiber, currentFiber, element) {
    const key = element.key;
    while (currentFiber != null) {
      if (currentFiber.key === key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            let props = element.props;
            if (element.type === REACT_FRAGMENT_TYPE) {
              props = element.props.children;
            }
            // key 相同 type 相同, 则表示当前节点可复用
            const existing = useFiber(currentFiber, props);
            existing.return = returnFiber;
            // 当前节点可复用, 删除剩余旧节点
            deleteRemainingChildren(returnFiber, currentFiber.sibling);
            return existing;
          }

          //  key 相同 type 不同, 删掉所有旧节点
          deleteRemainingChildren(returnFiber, currentFiber);
          break;
        } else {
          console.log('reconcileSingleElement 未实现的类型');
          break;
        }
      } else {
        // key 不同, 则删除旧节点
        deleteChild(returnFiber, currentFiber);
        currentFiber = currentFiber.sibling;
      }
    }

    // 创建新节点
    let fiber;
    if (element.type === REACT_FRAGMENT_TYPE) {
      fiber = createFiberFromFragment(element.props.children, key);
    } else {
      fiber = createFiberFromElement(element);
    }
    fiber.return = returnFiber;
    return fiber;
  }

  /**
   * @description:
   * @param {*} returnFiber
   * @param {*} currentFiber
   * @param {*} content
   */
  function reconcileSingleTextNode(returnFiber, currentFiber, content) {
    while (currentFiber != null) {
      if (currentFiber.tag === HostText) {
        // 复用旧节点
        const existing = useFiber(currentFiber, { content });
        existing.return = returnFiber;
        deleteRemainingChildren(returnFiber, currentFiber.sibling);
        return existing;
      }
      // 删除旧节点
      deleteChild(returnFiber, currentFiber);
      currentFiber = currentFiber.sibling;
    }

    // 创建新节点
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;
    return fiber;
  }

  function placeSingleChild(fiber) {
    if (shouldTrackEffects && fiber.alternate === null) {
      // 首次渲染
      fiber.flags |= Placement;
    }
    return fiber;
  }

  function updateFromMap(returnFiber, existingChildren, index, element) {
    const keyToUse = element.key !== null ? element.key : index;
    const before = existingChildren.get(keyToUse);

    if (typeof element === 'string' || typeof element === 'number') {
      if (before) {
        if (before.tag === HostText) {
          existingChildren.delete(keyToUse);
          return useFiber(before, { content: element + '' });
        }
      }
      return new FiberNode(HostText, { content: element + '' }, null);
    }

    if (typeof element === 'object' && element != null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (element.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              before,
              element,
              keyToUse,
              existingChildren
            );
          }
          if (before) {
            if (before.type === element.type) {
              existingChildren.delete(keyToUse);
              return useFiber(before, element.props);
            }
          }
          return createFiberFromElement(element);
      }

      if (Array.isArray(element)) {
        return updateFragment(
          returnFiber,
          before,
          element,
          keyToUse,
          existingChildren
        );
      }
    }

    return null;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChild) {
    // 最后一个可复用的 fiber 在 current 中的 index
    let lastPlacedIndex = 0;
    // 创建的最后一个 fiber
    let lastNewFiber = null;
    // 创建的第一个 fiber
    let firstNewFiber = null;

    const existingChildren = new Map();
    let current = currentFirstChild;
    while (current != null) {
      const keyToUse = current.key !== null ? current.key : current.index;
      existingChildren.set(keyToUse, current);
      current = current.sibling;
    }

    for (let i = 0; i < newChild.length; i++) {
      const after = newChild[i];
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
      if (newFiber == null) {
        continue;
      }

      newFiber.index = i;
      newFiber.return = returnFiber;

      if (lastNewFiber == null) {
        lastNewFiber = newFiber;
        firstNewFiber = newFiber;
      } else {
        lastNewFiber.sibling = newFiber;
        lastNewFiber = lastNewFiber.sibling;
      }

      if (!shouldTrackEffects) {
        continue;
      }

      const current = newFiber.alternate;
      if (current !== null) {
        const oldIndex = current.index;
        if (oldIndex < lastPlacedIndex) {
          newFiber.flags |= Placement;
          continue;
        } else {
          lastPlacedIndex = oldIndex;
        }
      } else {
        newFiber.flags |= Placement;
      }
    }

    existingChildren.forEach(fiber => {
      deleteChild(returnFiber, fiber);
    });

    return firstNewFiber;
  }

  return function reconcileChildFibers(returnFiber, currentFiber, newChild) {
    const isUnkeyedTopLevelFragment =
      typeof newChild === 'object' &&
      newChild !== null &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key == null;

    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFiber, newChild)
          );
        default:
          break;
      }

      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFiber, newChild);
      }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFiber, newChild)
      );
    }

    if (currentFiber != null) {
      deleteRemainingChildren(returnFiber, currentFiber);
    }

    return null;
  };
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

export function cloneChildFibers(workInProgress) {
  if (workInProgress.child == null) {
    return;
  }

  let currentChild = workInProgress.child;
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
  workInProgress.child = newChild;
  newChild.return = workInProgress;

  while (currentChild.sibling != null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(
      newChild,
      newChild.pendingProps
    );
    newChild.return = workInProgress;
  }
}
