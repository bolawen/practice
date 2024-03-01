/**
 * @description: 当前使用的 Hooks 集合
 */

const currentDispatcher = {
  current: null
};

export const resolveDispatcher = () => {
  const dispatcher = currentDispatcher.current;

  if (dispatcher === null) {
    throw new Error('Hooks 只能在函数组件中执行');
  }

  return dispatcher;
};

export default currentDispatcher;
