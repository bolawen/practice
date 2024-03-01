class Router {
  constructor() {
    this.routers = {};
    this.currentUrl = '';
    this.container = document.getElementById('content');
  }

  route(path, callback) {
    this.routers[path] = callback || function () {};
  }

  updateView(url) {
    this.currentUrl = url;
    this.routers[this.currentUrl] && this.routers[this.currentUrl]();
  }

  init(path) {
    history.replaceState({ path: path }, null, path);
    this.updateView(path);
  }

  push(path) {
    history.pushState({ path: path }, null, path);
    this.updateView(path);
  }

  listerPopState() {
    window.addEventListener('popstate', e => {
      const path = e.state && e.state.path;
      this.updateView(path);
    });
  }

  updateInnerHTML(content) {
    this.container.innerHTML = content;
  }
}

const router = new Router();

router.route('/', () => {
  router.updateInnerHTML('Home');
});
router.route('/about', () => {
  router.updateInnerHTML('About');
});
router.route('/detail', () => {
  router.updateInnerHTML('Detail');
});

router.init('/');

setTimeout(() => {
  router.push('/about');
}, 4000);
