import magicMicro from './util/MagicMirco.js';
import ReactDOM from 'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm';

function initMicroApp(name, widget) {
  function renderApp(props, el) {
    const root = ReactDOM.createRoot(el);
    root.render(widget, props);
  }

  function destroyApp() {
    root.unmount();
  }

  magicMicro.registerPage({
    name: `micro-${name}`,
    module: {
      render: function (hostEl, props) {
        renderApp(props, hostEl);
      },
      destroy: function (hostEl) {
        destroyApp(hostEl);
      }
    }
  });

  magicMicro.sendMessage({
    type: `connect-${name}`,
    msg: {
      render: function (hostEl, props) {
        renderApp(props, hostEl);
      },
      destroy: function (hostEl) {
        destroyApp(hostEl);
      }
    }
  });
}

export default initMicroApp;
