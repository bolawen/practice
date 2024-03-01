export function is(x, y) {
  if (x === y) {
    return x !== 0 && 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

export function hasChanged(x, y) {
  return !is(x, y);
}

export function toRawType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/**
 * @description: 是否为对象
 */
export function isObject(value) {
  return value != null && typeof value === 'object';
}

/**
 * @description: 是否为数组
 */

export const isArray = Array.isArray;

/**
 * @description: 是否为字符串
 */

export const isString = value => typeof value === 'string';

/**
 * @description: 是否为 Map 对象
 */
export function isMap(value) {
  return Object.prototype.toString.call(value) === '[object Map]';
}

/**
 * @description: 是否数字型的字符串
 */
export const isIntegerKey = key =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key;

/**
 * @description: 是否为自身属性
 */
export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

/**
 * @description: 是否为 Symbol
 */
export const isSymbol = val => typeof val === 'symbol';
