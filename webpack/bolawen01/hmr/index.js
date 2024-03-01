import './client.js';

const root = document.getElementById('root');
const input = document.createElement('input');
input.placeholder = 'HMR Input';
document.body.appendChild(input);

function render() {
  root.innerHTML = require('./content.js');
}
render();

if (module.hot) {
  module.hot.accept(['./content.js'], () => {
    render();
  });
}
