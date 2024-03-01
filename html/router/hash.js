class Router {
  constructor() {
    this.routes = {};
    this.currentUrl = '';
    this.container = document.getElementById('content');

    this.init();
  }

  init() {
    window.addEventListener('load', this.updateView.bind(this), false);
    window.addEventListener('hashchange', this.updateView.bind(this), false);
  }

  updateView() {
    this.currentUrl = location.hash.slice(1) || '/';
    this.routes[this.currentUrl] && this.routes[this.currentUrl]();
  }

  route(path, callback) {
    this.routes[path] = callback || function () {};
  }

  push(path) {
    window.location.hash = path;
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

setTimeout(() => {
  router.push('/about');
}, 3000);
