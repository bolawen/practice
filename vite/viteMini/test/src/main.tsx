import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return (
    <div>
      <h3>Hello World 06</h3>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

import.meta.hot.accept(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
