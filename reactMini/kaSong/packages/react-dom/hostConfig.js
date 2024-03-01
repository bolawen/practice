import { updateFiberProps } from './syntheticEvent';
import { HostText } from '../react-reconciler/workTags';

export function createInstance(type, props) {
  const element = document.createElement(type);
  updateFiberProps(element, props);
  return element;
}

export function appendInitialChild(parent, child) {
  parent.appendChild(child);
}

export function createTextInstance(content) {
  return document.createTextNode(content);
}

export function appendChildToContainer(parent, child) {
  parent.appendChild(child);
}

export function commitUpdate(fiber) {
  switch (fiber.tag) {
    case HostText:
      const text = fiber.memoizedProps.content;
      return commitTextUpdate(fiber.stateNode, text);
    default:
      console.log('commitUpdate 未实现的类型');
      break;
  }
}

export function commitTextUpdate(textInstance, content) {
  textInstance.textContent = content;
}

export function removeChild(child, container) {
  container.removeChild(child);
}

export function insertChildToContainer(child, container, before) {
  container.insertBefore(child, before);
}

export const scheduleMicroTask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : typeof Promise === 'function'
    ? callback => Promise.resolve().then(callback)
    : setTimeout;

export function hideInstance(instance) {
  const style = instance.style;
  style.setProperty('display', 'none', 'important');
}

export function unhideInstance(instance) {
  const style = instance.style;
  style.display = '';
}

export function hideTextInstance(textInstance) {
  textInstance.nodeValue = '';
}

export function unhideTextInstance(textInstance, text) {
  textInstance.nodeValue = text;
}
