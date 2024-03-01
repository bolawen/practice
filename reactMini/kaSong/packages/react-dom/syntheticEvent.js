import {
  unstable_NormalPriority,
  unstable_runWithPriority,
  unstable_ImmediatePriority,
  unstable_UserBlockingPriority
} from 'scheduler';

export const elementPropsKey = '__props';
const validEventTypeList = ['click'];

export function updateFiberProps(node, props) {
  node[elementPropsKey] = props;
}

function getEventCallbackNameFromEventType(eventType) {
  return {
    click: ['onClickCapture', 'onClick']
  }[eventType];
}

function collectPaths(targetElement, container, eventType) {
  const paths = {
    bubble: [],
    capture: []
  };

  while (targetElement && targetElement != container) {
    const elementProps = targetElement[elementPropsKey];

    if (elementProps) {
      const callbackNameList = getEventCallbackNameFromEventType(eventType);
      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          const eventCallback = elementProps[callbackName];
          if (eventCallback) {
            if (i === 0) {
              paths.capture.unshift(eventCallback);
            } else {
              paths.bubble.push(eventCallback);
            }
          }
        });
      }
    }

    targetElement = targetElement.parentNode;
  }

  return paths;
}

function createSyntheticEvent(e) {
  const syntheticEvent = e;
  syntheticEvent.__stopPropagation = false;
  const originStopPropagation = e.stopPropagation;
  syntheticEvent.stopPropagation = () => {
    syntheticEvent.__stopPropagation = true;
    if (originStopPropagation) {
      originStopPropagation(e);
    }
  };

  return syntheticEvent;
}

function triggerEventFlow(paths, se) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i];

    unstable_runWithPriority(eventTypeToSchedulerPriority(se.type), () => {
      callback.call(null, se);
    });

    if (se.__stopPropagation) {
      break;
    }
  }
}

/**
 * @description: dispatchEvent
 * @param {*} container
 * @param {*} eventType
 * @param {*} e
 * 1, 收集 targetDOM - containerDOM 之间所有的事件回调函数
 * 2. 构造合成事件
 * 3. 遍历 capture
 * 4. 遍历 bubble
 */
function dispatchEvent(container, eventType, e) {
  const targetElement = e.target;
  if (targetElement == null) {
    console.log('事件不存在 target', e);
    return;
  }

  const { bubble, capture } = collectPaths(targetElement, container, eventType);
  const se = createSyntheticEvent(e);
  triggerEventFlow(capture, se);

  if (!se.__stopPropagation) {
    triggerEventFlow(bubble, se);
  }
}

export function initEvent(container, eventType) {
  if (!validEventTypeList.includes(eventType)) {
    console.log('不支持的事件类型', eventType);
    return;
  }

  container.addEventListener(eventType, e => {
    dispatchEvent(container, eventType, e);
  });
}

function eventTypeToSchedulerPriority(eventType) {
  switch (eventType) {
    case 'click':
    case 'keydown':
    case 'keyup':
      return unstable_ImmediatePriority;
    case 'scroll':
      return unstable_UserBlockingPriority;
    default:
      return unstable_NormalPriority;
  }
}
