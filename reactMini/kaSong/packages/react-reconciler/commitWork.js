import {
  Ref,
  Update,
  NoFlags,
  Placement,
  MutationMask,
  ChildDeletion,
  PassiveEffect,
  PassiveMask,
  LayoutMask,
  Visibility
} from './fiberFlags';

import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
  OffscreenComponent
} from './workTags';

import {
  appendChildToContainer,
  removeChild,
  commitUpdate,
  hideInstance,
  unhideInstance,
  hideTextInstance,
  unhideTextInstance,
  insertChildToContainer
} from 'react-dom/hostConfig';

import { HookHasEffect } from './hookEffectTags';

let nextEffect = null;

function getHostParent(fiber) {
  let parent = fiber.return;

  while (parent) {
    const parentTag = parent.tag;

    if (parentTag === HostComponent) {
      return parent.stateNode;
    }

    if (parentTag === HostRoot) {
      return parent.stateNode.container;
    }
    parent = parent.return;
  }

  console.log('getHostParent 找不到父节点');
}

function getHostSibling(fiber) {
  let node = fiber;
  findSibling: while (true) {
    while (node.sibling == null) {
      const parent = node.return;
      if (
        parent == null ||
        parent.tag === HostComponent ||
        parent.tag === HostRoot
      ) {
        return null;
      }
      node = parent;
    }

    node.sibling.return = node.return;
    node = node.sibling;

    while (node.tag !== HostText && node.tag !== HostComponent) {
      if ((node.flags & Placement) !== NoFlags) {
        continue findSibling;
      }
      if (node.child == null) {
        continue findSibling;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    if ((node.flags & Placement) === NoFlags) {
      return node.stateNode;
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(
  finishedWork,
  hostParent,
  before
) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    if (before) {
      insertChildToContainer(finishedWork.stateNode, hostParent, before);
    } else {
      appendChildToContainer(hostParent, finishedWork.stateNode);
    }
    return;
  }

  const child = finishedWork.child;
  if (child != null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParent);
    let sibling = child.sibling;
    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParent);
      sibling = sibling.sibling;
    }
  }
}

export function commitPlacement(finishedWork) {
  const hostParent = getHostParent(finishedWork);
  const sibling = getHostSibling(finishedWork);

  if (hostParent != null) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
  }
}

export function commitNestedComponent(root, onCommitUnmount) {
  let node = root;
  while (true) {
    onCommitUnmount(node);

    if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === root) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return;
      }
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function recordHostChildrenToDelete(childrenToDelete, unmountFiber) {
  let lastOne = childrenToDelete[childrenToDelete.length - 1];
  if (!lastOne) {
    childrenToDelete.push(unmountFiber);
  } else {
    let node = lastOne.sibling;
    while (node != null) {
      if (unmountFiber === node) {
        childrenToDelete.push(unmountFiber);
      }
      node = node.sibling;
    }
  }
}

/**
 * @description: 删除子节点
 * @param {*} childToDelete
 * 逻辑: 删除子节点, 其实就是删除子节点及其后代节点, 也就是删除子树
 * 1. 对于 FunctionComponent 节点: 需要处理 useEffect unmount 、解绑 ref 、移除根 DOM
 * 2. 对于 HostComponent 节点: 需要解绑 ref 、 移除 DOM
 */
export function commitDeletion(childToDelete, root) {
  const rootChildrenToDelete = [];

  commitNestedComponent(childToDelete, unmountFiber => {
    switch (unmountFiber.tag) {
      case HostComponent:
        recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber);
        safelyDetachRef(unmountFiber);
        return;
      case HostText:
        recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber);
        return;
      case FunctionComponent:
        commitPassiveEffect(unmountFiber, root, 'unmount');
        return;
      default:
        console.log('commitDeletion 未实现的类型');
        break;
    }
  });

  if (rootChildrenToDelete.length) {
    const hostParent = getHostParent(childToDelete);

    if (hostParent != null) {
      rootChildrenToDelete.forEach(node => {
        removeChild(node.stateNode, hostParent);
      });
    }
  }

  childToDelete.return = null;
  childToDelete.child = null;
}

export function commitPassiveEffect(fiber, root, type) {
  if (
    fiber.tag !== FunctionComponent ||
    (type === 'update' && (fiber.flags & PassiveEffect) === NoFlags)
  ) {
    return;
  }

  const updateQueue = fiber.updateQueue;
  if (updateQueue !== null) {
    if (updateQueue.lastEffect == null) {
      console.log(
        '当 FunctionComponent 存在 PassiveEffect Flag 时, 不应该不存在 lastEffect'
      );
    }
    root.pendingPassiveEffects[type].push(updateQueue.lastEffect);
  }
}

function safelyAttachRef(fiber) {
  const ref = fiber.ref;

  if (ref !== null) {
    const instance = fiber.stateNode;
    if (typeof ref === 'function') {
      ref(instance);
    } else {
      ref.current = instance;
    }
  }
}

function safelyDetachRef(current) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === 'function') {
      ref(null);
    } else {
      ref.current = null;
    }
  }
}

function findHostSubtreeRoot(finishedWork, callback) {
  let node = finishedWork;
  let hostSubtreeRoot = null;

  while (true) {
    if (node.tag === HostComponent) {
      if (hostSubtreeRoot === null) {
        hostSubtreeRoot = node;
        callback(node);
      }
    } else if (node.tag === HostText) {
      if (hostSubtreeRoot === null) {
        callback(node);
      }
    } else if (
      node.tag === OffscreenComponent &&
      node.pendingProps.mode === 'hidden' &&
      node !== finishedWork
    ) {
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === finishedWork) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === finishedWork) {
        return;
      }

      if (hostSubtreeRoot === node) {
        hostSubtreeRoot = null;
      }

      node = node.return;
    }

    if (hostSubtreeRoot === node) {
      hostSubtreeRoot = null;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function hideOrUnhideAllChildren(finishedWork, isHidden) {
  findHostSubtreeRoot(finishedWork, hostRoot => {
    const instance = hostRoot.stateNode;
    if (hostRoot.tag === HostComponent) {
      isHidden ? hideInstance(instance) : unhideInstance(instance);
    } else if (hostRoot.tag === HostText) {
      isHidden
        ? hideTextInstance(instance)
        : unhideTextInstance(instance, hostRoot.memoizedProps.content);
    }
  });
}

export function commitMutationEffectsOnFiber(finishedWork, root) {
  const { tag, flags } = finishedWork;

  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }

  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions;
    if (deletions != null) {
      deletions.forEach(childToDelete => {
        commitDeletion(childToDelete, root);
      });
    }
    finishedWork.flags &= ~ChildDeletion;
  }

  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork);
    finishedWork.flags &= ~Update;
  }

  if ((flags & PassiveEffect) !== NoFlags) {
    commitPassiveEffect(finishedWork, root, 'update');
    finishedWork.flags &= ~PassiveEffect;
  }

  if ((flags & Ref) !== NoFlags && tag === HostComponent) {
    safelyDetachRef(finishedWork);
  }

  if ((flags & Visibility) !== NoFlags && tag === OffscreenComponent) {
    const isHidden = finishedWork.pendingProps.mode === 'hidden';
    hideOrUnhideAllChildren(finishedWork, isHidden);
    finishedWork.flags &= ~Visibility;
  }
}

export function commitLayoutEffectsOnFiber(finishedWork) {
  const { tag, flags } = finishedWork;

  if ((flags & Ref) !== NoFlags && tag === HostComponent) {
    safelyAttachRef(finishedWork);
    finishedWork.flags &= ~Ref;
  }
}

export function commitEffects(phrase, mask, callback) {
  return (finishedWork, root) => {
    nextEffect = finishedWork;

    while (nextEffect !== null) {
      const child = nextEffect.child;
      if ((nextEffect.subtreeFlags & mask) !== NoFlags && child !== null) {
        nextEffect = child;
      } else {
        up: while (nextEffect !== null) {
          callback(nextEffect, root);
          const sibling = nextEffect.sibling;

          if (sibling !== null) {
            nextEffect = sibling;
            break up; // 终止掉 up while 循环
          }

          nextEffect = nextEffect.return;
        }
      }
    }
  };
}

export const commitMutationEffects = commitEffects(
  'mutation',
  MutationMask | PassiveMask,
  commitMutationEffectsOnFiber
);

export const commitLayoutEffects = commitEffects(
  'layout',
  LayoutMask,
  commitLayoutEffectsOnFiber
);

export function commitHookEffectList(flags, lastEffect, callback) {
  let effect = lastEffect.next;

  do {
    if ((effect.tag & flags) === flags) {
      callback(effect);
    }
    effect = effect.next;
  } while (effect != lastEffect.next);
}

export function commitHookEffectListUnmount(flags, lastEffect) {
  commitHookEffectList(flags, lastEffect, effect => {
    const destroy = effect.destroy;
    if (typeof destroy === 'function') {
      destroy();
    }
    effect.tag &= ~HookHasEffect;
  });
}

export function commitHookEffectListDestroy(flags, lastEffect) {
  commitHookEffectList(flags, lastEffect, effect => {
    const destroy = effect.destroy;
    if (typeof destroy === 'function') {
      destroy();
    }
  });
}

export function commitHookEffectListCreate(flags, lastEffect) {
  commitHookEffectList(flags, lastEffect, effect => {
    const create = effect.create;
    if (typeof create === 'function') {
      effect.destroy = create();
    }
  });
}
