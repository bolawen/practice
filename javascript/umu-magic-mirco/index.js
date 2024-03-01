!(function (t, e) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
    ? define([], e)
    : 'object' == typeof exports
    ? (exports['umu-magic-mirco'] = e())
    : (t['umu-magic-mirco'] = e());
})(window, function () {
  return (function (t) {
    var e = {};
    function n(r) {
      if (e[r]) return e[r].exports;
      var o = (e[r] = { i: r, l: !1, exports: {} });
      return t[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
    }
    return (
      (n.m = t),
      (n.c = e),
      (n.d = function (t, e, r) {
        n.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: r });
      }),
      (n.r = function (t) {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(t, '__esModule', { value: !0 });
      }),
      (n.t = function (t, e) {
        if ((1 & e && (t = n(t)), 8 & e)) return t;
        if (4 & e && 'object' == typeof t && t && t.__esModule) return t;
        var r = Object.create(null);
        if (
          (n.r(r),
          Object.defineProperty(r, 'default', { enumerable: !0, value: t }),
          2 & e && 'string' != typeof t)
        )
          for (var o in t)
            n.d(
              r,
              o,
              function (e) {
                return t[e];
              }.bind(null, o)
            );
        return r;
      }),
      (n.n = function (t) {
        var e =
          t && t.__esModule
            ? function () {
                return t.default;
              }
            : function () {
                return t;
              };
        return n.d(e, 'a', e), e;
      }),
      (n.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      }),
      (n.p = ''),
      n((n.s = 0))
    );
  })([
    function (t, e, n) {
      'use strict';
      n.r(e);
      var r = (function () {
          function t() {
            var t;
            (this.$$eventsMap = new Map()),
              (this.$$emitter = {
                all: (t = (t = this.$$eventsMap) || new Map()),
                on: function (e, n) {
                  var r = t.get(e);
                  (r && r.push(n)) || t.set(e, [n]);
                },
                off: function (e, n) {
                  var r = t.get(e);
                  r && r.splice(r.indexOf(n) >>> 0, 1);
                },
                emit: function (e) {
                  for (var n = [], r = 1; r < arguments.length; r++)
                    n[r - 1] = arguments[r];
                  (t.get(e) || []).slice().map(function (t) {
                    t.apply(void 0, n);
                  });
                }
              });
          }
          return (
            (t.prototype.on = function (t, e) {
              this.$$emitter.on(t, e);
            }),
            (t.prototype.off = function (t, e) {
              this.$$emitter.off(t, e);
            }),
            (t.prototype.emit = function (t) {
              for (var e, n = [], r = 1; r < arguments.length; r++)
                n[r - 1] = arguments[r];
              return (
                (e = this.$$emitter).emit.apply(
                  e,
                  (function () {
                    for (var t = 0, e = 0, n = arguments.length; e < n; e++)
                      t += arguments[e].length;
                    var r = Array(t),
                      o = 0;
                    for (e = 0; e < n; e++)
                      for (
                        var i = arguments[e], c = 0, u = i.length;
                        c < u;
                        c++, o++
                      )
                        r[o] = i[c];
                    return r;
                  })([t], n)
                ),
                this.eventListenersCount(t) > 0
              );
            }),
            (t.prototype.once = function (t, e) {
              var n = this,
                r = function (o) {
                  e(o), n.off(t, r);
                };
              return this.on(t, r);
            }),
            (t.prototype.listenerCount = function (t) {
              return this.eventListenersCount(t);
            }),
            (t.prototype.eventListenersCount = function (t) {
              return this.$$eventsMap.has(t)
                ? this.$$eventsMap.get(t).length
                : 0;
            }),
            t
          );
        })(),
        o = (function () {
          var t = function (e, n) {
            return (t =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (t, e) {
                  t.__proto__ = e;
                }) ||
              function (t, e) {
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
              })(e, n);
          };
          return function (e, n) {
            function r() {
              this.constructor = e;
            }
            t(e, n),
              (e.prototype =
                null === n
                  ? Object.create(n)
                  : ((r.prototype = n.prototype), new r()));
          };
        })(),
        i = null,
        c = (function (t) {
          function e() {
            return t.call(this) || this;
          }
          return (
            o(e, t),
            (e.getInstance = function () {
              return i || (i = new e()), i;
            }),
            (e.prototype.sendMessage = function (t) {
              this.emit(t.type, t.msg);
            }),
            (e.prototype.onMessage = function (t, e) {
              this.on(t, e);
            }),
            e
          );
        })(r).getInstance();
      function u(t) {
        this.id = t;
      }
      u._cacheModule = {};
      var s = u,
        a = [
          'area',
          'base',
          'br',
          'col',
          'embed',
          'hr',
          'img',
          'input',
          'keygen',
          'link',
          'meta',
          'param',
          'source',
          'track',
          'wbr'
        ];
      function f(t) {
        var e = document.createElement(t.tagName);
        return (
          Object.keys(t.attributes || {}).forEach(function (n) {
            var r;
            e.setAttribute(
              n,
              (null === (r = t.attributes) || void 0 === r ? void 0 : r[n]) ||
                ''
            );
          }),
          !t.voidTag && t.innerHTML && (e.innerHTML = t.innerHTML),
          e
        );
      }
      function p(t, e, n) {
        return {
          tagName: t,
          voidTag: -1 !== a.indexOf(t),
          attributes: e,
          innerHTML: n
        };
      }
      var l,
        d = {
          scripts: function (t, e) {
            var n = p('script', { type: 'text/javascript', src: t, class: e });
            return document.body.appendChild(f(n)), n;
          },
          styles: function (t, e) {
            var n = p('link', {
              rel: 'stylesheet',
              type: 'text/css',
              href: t,
              class: e
            });
            return document.head.appendChild(f(n)), n;
          }
        };
      !(function (t) {
        (t.styles = 'styles'), (t.scripts = 'scripts');
      })(l || (l = {})),
        n.d(e, 'UMUMagicMirco', function () {
          return m;
        });
      var m = (function () {
        function t() {}
        return (
          (t.registerPage = function (t) {
            if (!t.name) return console.log('name 必须填');
            var e = t.name;
            s._cacheModule[e]
              ? (s._cacheModule[e] = Object.assign({}, s._cacheModule[e], t))
              : (s._cacheModule[e] = Object.assign({}, t));
          }),
          (t.pageLoader = function (t, e) {
            return new Promise(function (n, r) {
              (function (t, e) {
                var n = e[l.styles] || [],
                  r = e[l.scripts] || [];
                n.forEach(function (e) {
                  !(function (t, e, n) {
                    'string' == typeof e && d[t](e, n);
                  })(l.styles, e, t);
                }),
                  (function (t, e) {
                    var n =
                        document.body ||
                        document.head ||
                        document.documentElement,
                      r = t,
                      o = e,
                      i = r[r.length - 1],
                      c = [];
                    r.forEach(function (t, e) {
                      e < r.length - 1 && c.push(t);
                    }),
                      Promise.all(
                        c.map(function (t) {
                          return new Promise(function (e) {
                            var r = document.createElement('script');
                            (r.type = 'text/javascript'),
                              (r.className = o),
                              (r.src = t),
                              (r.defer = !0),
                              (r.onload = function () {
                                e(t);
                              }),
                              (r.onerror = function () {
                                console.error(new Error(t));
                              }),
                              n.appendChild(r);
                          });
                        })
                      ).then(function () {
                        return new Promise(function (t) {
                          var e = document.createElement('script');
                          (e.type = 'text/javascript'),
                            (e.className = o),
                            (e.src = i),
                            (e.onload = function () {
                              t(i);
                            }),
                            (e.onerror = function () {
                              console.error(new Error(i));
                            }),
                            n.appendChild(e);
                        });
                      });
                  })(r, t);
              })(t, e),
                n({});
            });
          }),
          (t.sendMessage = function (t) {
            c.sendMessage(t);
          }),
          (t.onMessage = function (t, e) {
            c.onMessage(t, e);
          }),
          (t.off = function (t, e) {
            c.off(t, e);
          }),
          (t.getPageInfo = function (t) {
            return s._cacheModule[t];
          }),
          t
        );
      })();
    }
  ]);
});
