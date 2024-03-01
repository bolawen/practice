import initMicroApp from './magicMicro.js';
import magicMicro from './util/MagicMirco.js';
import React from 'https://cdn.jsdelivr.net/npm/react@18.2.0/+esm';

/**
 * @description: Angular 项目 订阅组件
 */
magicMicro.onMessage('MyComponent',function(module){
 module.render(document.querySelector('#container'));
});


/**
 * @description: React 项目 定义组件
 */
const MyComponent = React.createElement(
  'div',
  { className: 'my-component' },
  'Hello World'
);
/**
 * @description: React 项目 注册组件
 */
initMicroApp('MyComponent', MyComponent);


