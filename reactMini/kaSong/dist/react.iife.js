var React = (function (exports) {
  'use strict';

  const supportSymbol = typeof Symbol === 'function' && Symbol.for;

  const REACT_ELEMENT_TYPE = supportSymbol
    ? Symbol.for('react.element')
    : 0xeac7;

  const REACT_FRAGMENT_TYPE = supportSymbol
    ? Symbol.for('react.fragment')
    : 0xeacb;

  const REACT_CONTEXT_TYPE = supportSymbol
    ? Symbol.for('react.context')
    : 0xeacc;

  const REACT_PROVIDER_TYPE = supportSymbol
    ? Symbol.for('react.provider')
    : 0xeac2;

  const REACT_SUSPENSE_TYPE = supportSymbol
    ? Symbol.for('react.suspense')
    : 0xeac3;

  const REACT_MEMO_TYPE = supportSymbol
    ? Symbol.for('react.memo')
    : 0xeac4;

  const ReactElement = function (type, key, ref, props) {
    const element = {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref,
      props
    };
    return element;
  };

  function jsx(type, config, ...maybeChildren) {
    let key = null;
    const props = {};
    let ref = null;

    for (const prop in config) {
      const val = config[prop];
      if (prop === 'key') {
        if (val !== undefined) {
          key = '' + val;
        }
        continue;
      }
      if (prop === 'ref') {
        if (val !== undefined) {
          ref = val;
        }
        continue;
      }
      if ({}.hasOwnProperty.call(config, prop)) {
        props[prop] = val;
      }
    }

    const maybeChildrenLength = maybeChildren.length;
    if (maybeChildrenLength) {
      if (maybeChildrenLength === 1) {
        props.children = maybeChildren[0];
      } else {
        props.children = maybeChildren;
      }
    }

    return ReactElement(type, key, ref, props);
  }

  const Fragment$1 = REACT_FRAGMENT_TYPE;
  const Suspense = REACT_SUSPENSE_TYPE;

  const ReactCurrentBatchConfig$1 = {
    transition: null
  };

  /**
   * @description: 当前使用的 Hooks 集合
   */

  const currentDispatcher$1 = {
    current: null
  };

  const resolveDispatcher = () => {
    const dispatcher = currentDispatcher$1.current;

    if (dispatcher === null) {
      throw new Error('Hooks 只能在函数组件中执行');
    }

    return dispatcher;
  };

  function createContext(defaultValue) {
    const context = {
      $$typeof: REACT_CONTEXT_TYPE,
      Provider: null,
      _currentValue: defaultValue
    };

    context.Provider = {
      $$typeof: REACT_PROVIDER_TYPE,
      _context: context
    };

    return context;
  }

  function memo(type, compare) {
    const fiberType = {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: compare === undefined ? null : compare
    };

    return fiberType;
  }

  const useState = initialState => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
  };

  const useEffect = (create, deps) => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
  };

  const useTransition = () => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useTransition();
  };

  const useRef = initialValue => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useRef(initialValue);
  };

  const useContext = context => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useContext(context);
  };

  const use$1 = useable => {
    const dispatcher = resolveDispatcher();
    return dispatcher.use(useable);
  };

  const useMemo = (nextCreate, deps) => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useMemo(nextCreate, deps);
  };

  const useCallback = (callback, deps) => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useCallback(callback, deps);
  };
  /**
   * @description: React 内部数据共享层
   */
  const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    currentDispatcher: currentDispatcher$1,
    currentBatchConfig: ReactCurrentBatchConfig$1
  };

  var React = {
    version: '0.0.0',
    createElement: jsx,
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
  };

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Fragment: Fragment$1,
    Suspense: Suspense,
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    createContext: createContext,
    createElement: jsx,
    default: React,
    memo: memo,
    use: use$1,
    useCallback: useCallback,
    useContext: useContext,
    useEffect: useEffect,
    useMemo: useMemo,
    useRef: useRef,
    useState: useState,
    useTransition: useTransition
  });

  const NoFlags = 0b000000000000;
  const Placement = 0b000000000001;
  const Update = 0b000000000010;
  const ChildDeletion = 0b000000000100;
  const PassiveEffect = 0b000000001000;
  const Ref = 0b000000010000;
  const Visibility = 0b000000100000;
  const ShouldCapture = 0b000001000000;
  const DidCapture = 0b000010000000;
  const MutationMask =
    Placement | Update | ChildDeletion | Ref | Visibility;
  const LayoutMask = Ref;
  const PassiveMask = PassiveEffect | ChildDeletion;

  var scheduler = {exports: {}};

  var scheduler_production_min = {};

  /**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var hasRequiredScheduler_production_min;

  function requireScheduler_production_min () {
  	if (hasRequiredScheduler_production_min) return scheduler_production_min;
  	hasRequiredScheduler_production_min = 1;
  	(function (exports) {
  function f(a,b){var c=a.length;a.push(b);a:for(;0<c;){var d=c-1>>>1,e=a[d];if(0<g(e,b))a[d]=b,a[c]=e,c=d;else break a}}function h(a){return 0===a.length?null:a[0]}function k(a){if(0===a.length)return null;var b=a[0],c=a.pop();if(c!==b){a[0]=c;a:for(var d=0,e=a.length,w=e>>>1;d<w;){var m=2*(d+1)-1,C=a[m],n=m+1,x=a[n];if(0>g(C,c))n<e&&0>g(x,C)?(a[d]=x,a[n]=c,d=n):(a[d]=C,a[m]=c,d=m);else if(n<e&&0>g(x,c))a[d]=x,a[n]=c,d=n;else break a}}return b}
  		function g(a,b){var c=a.sortIndex-b.sortIndex;return 0!==c?c:a.id-b.id}if("object"===typeof performance&&"function"===typeof performance.now){var l=performance;exports.unstable_now=function(){return l.now()};}else {var p=Date,q=p.now();exports.unstable_now=function(){return p.now()-q};}var r=[],t=[],u=1,v=null,y=3,z=!1,A=!1,B=!1,D="function"===typeof setTimeout?setTimeout:null,E="function"===typeof clearTimeout?clearTimeout:null,F="undefined"!==typeof setImmediate?setImmediate:null;
  		"undefined"!==typeof navigator&&void 0!==navigator.scheduling&&void 0!==navigator.scheduling.isInputPending&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function G(a){for(var b=h(t);null!==b;){if(null===b.callback)k(t);else if(b.startTime<=a)k(t),b.sortIndex=b.expirationTime,f(r,b);else break;b=h(t);}}function H(a){B=!1;G(a);if(!A)if(null!==h(r))A=!0,I(J);else {var b=h(t);null!==b&&K(H,b.startTime-a);}}
  		function J(a,b){A=!1;B&&(B=!1,E(L),L=-1);z=!0;var c=y;try{G(b);for(v=h(r);null!==v&&(!(v.expirationTime>b)||a&&!M());){var d=v.callback;if("function"===typeof d){v.callback=null;y=v.priorityLevel;var e=d(v.expirationTime<=b);b=exports.unstable_now();"function"===typeof e?v.callback=e:v===h(r)&&k(r);G(b);}else k(r);v=h(r);}if(null!==v)var w=!0;else {var m=h(t);null!==m&&K(H,m.startTime-b);w=!1;}return w}finally{v=null,y=c,z=!1;}}var N=!1,O=null,L=-1,P=5,Q=-1;
  		function M(){return exports.unstable_now()-Q<P?!1:!0}function R(){if(null!==O){var a=exports.unstable_now();Q=a;var b=!0;try{b=O(!0,a);}finally{b?S():(N=!1,O=null);}}else N=!1;}var S;if("function"===typeof F)S=function(){F(R);};else if("undefined"!==typeof MessageChannel){var T=new MessageChannel,U=T.port2;T.port1.onmessage=R;S=function(){U.postMessage(null);};}else S=function(){D(R,0);};function I(a){O=a;N||(N=!0,S());}function K(a,b){L=D(function(){a(exports.unstable_now());},b);}
  		exports.unstable_IdlePriority=5;exports.unstable_ImmediatePriority=1;exports.unstable_LowPriority=4;exports.unstable_NormalPriority=3;exports.unstable_Profiling=null;exports.unstable_UserBlockingPriority=2;exports.unstable_cancelCallback=function(a){a.callback=null;};exports.unstable_continueExecution=function(){A||z||(A=!0,I(J));};
  		exports.unstable_forceFrameRate=function(a){0>a||125<a?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):P=0<a?Math.floor(1E3/a):5;};exports.unstable_getCurrentPriorityLevel=function(){return y};exports.unstable_getFirstCallbackNode=function(){return h(r)};exports.unstable_next=function(a){switch(y){case 1:case 2:case 3:var b=3;break;default:b=y;}var c=y;y=b;try{return a()}finally{y=c;}};exports.unstable_pauseExecution=function(){};
  		exports.unstable_requestPaint=function(){};exports.unstable_runWithPriority=function(a,b){switch(a){case 1:case 2:case 3:case 4:case 5:break;default:a=3;}var c=y;y=a;try{return b()}finally{y=c;}};
  		exports.unstable_scheduleCallback=function(a,b,c){var d=exports.unstable_now();"object"===typeof c&&null!==c?(c=c.delay,c="number"===typeof c&&0<c?d+c:d):c=d;switch(a){case 1:var e=-1;break;case 2:e=250;break;case 5:e=1073741823;break;case 4:e=1E4;break;default:e=5E3;}e=c+e;a={id:u++,callback:b,priorityLevel:a,startTime:c,expirationTime:e,sortIndex:-1};c>d?(a.sortIndex=c,f(t,a),null===h(r)&&a===h(t)&&(B?(E(L),L=-1):B=!0,K(H,c-d))):(a.sortIndex=e,f(r,a),A||z||(A=!0,I(J)));return a};
  		exports.unstable_shouldYield=M;exports.unstable_wrapCallback=function(a){var b=y;return function(){var c=y;y=b;try{return a.apply(this,arguments)}finally{y=c;}}}; 
  	} (scheduler_production_min));
  	return scheduler_production_min;
  }

  var scheduler_development = {};

  /**
   * @license React
   * scheduler.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var hasRequiredScheduler_development;

  function requireScheduler_development () {
  	if (hasRequiredScheduler_development) return scheduler_development;
  	hasRequiredScheduler_development = 1;
  	(function (exports) {

  		if (process.env.NODE_ENV !== "production") {
  		  (function() {

  		/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  		if (
  		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
  		    'function'
  		) {
  		  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
  		}
  		          var enableSchedulerDebugging = false;
  		var enableProfiling = false;
  		var frameYieldMs = 5;

  		function push(heap, node) {
  		  var index = heap.length;
  		  heap.push(node);
  		  siftUp(heap, node, index);
  		}
  		function peek(heap) {
  		  return heap.length === 0 ? null : heap[0];
  		}
  		function pop(heap) {
  		  if (heap.length === 0) {
  		    return null;
  		  }

  		  var first = heap[0];
  		  var last = heap.pop();

  		  if (last !== first) {
  		    heap[0] = last;
  		    siftDown(heap, last, 0);
  		  }

  		  return first;
  		}

  		function siftUp(heap, node, i) {
  		  var index = i;

  		  while (index > 0) {
  		    var parentIndex = index - 1 >>> 1;
  		    var parent = heap[parentIndex];

  		    if (compare(parent, node) > 0) {
  		      // The parent is larger. Swap positions.
  		      heap[parentIndex] = node;
  		      heap[index] = parent;
  		      index = parentIndex;
  		    } else {
  		      // The parent is smaller. Exit.
  		      return;
  		    }
  		  }
  		}

  		function siftDown(heap, node, i) {
  		  var index = i;
  		  var length = heap.length;
  		  var halfLength = length >>> 1;

  		  while (index < halfLength) {
  		    var leftIndex = (index + 1) * 2 - 1;
  		    var left = heap[leftIndex];
  		    var rightIndex = leftIndex + 1;
  		    var right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

  		    if (compare(left, node) < 0) {
  		      if (rightIndex < length && compare(right, left) < 0) {
  		        heap[index] = right;
  		        heap[rightIndex] = node;
  		        index = rightIndex;
  		      } else {
  		        heap[index] = left;
  		        heap[leftIndex] = node;
  		        index = leftIndex;
  		      }
  		    } else if (rightIndex < length && compare(right, node) < 0) {
  		      heap[index] = right;
  		      heap[rightIndex] = node;
  		      index = rightIndex;
  		    } else {
  		      // Neither child is smaller. Exit.
  		      return;
  		    }
  		  }
  		}

  		function compare(a, b) {
  		  // Compare sort index first, then task id.
  		  var diff = a.sortIndex - b.sortIndex;
  		  return diff !== 0 ? diff : a.id - b.id;
  		}

  		// TODO: Use symbols?
  		var ImmediatePriority = 1;
  		var UserBlockingPriority = 2;
  		var NormalPriority = 3;
  		var LowPriority = 4;
  		var IdlePriority = 5;

  		function markTaskErrored(task, ms) {
  		}

  		/* eslint-disable no-var */

  		var hasPerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';

  		if (hasPerformanceNow) {
  		  var localPerformance = performance;

  		  exports.unstable_now = function () {
  		    return localPerformance.now();
  		  };
  		} else {
  		  var localDate = Date;
  		  var initialTime = localDate.now();

  		  exports.unstable_now = function () {
  		    return localDate.now() - initialTime;
  		  };
  		} // Max 31 bit integer. The max integer size in V8 for 32-bit systems.
  		// Math.pow(2, 30) - 1
  		// 0b111111111111111111111111111111


  		var maxSigned31BitInt = 1073741823; // Times out immediately

  		var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

  		var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
  		var NORMAL_PRIORITY_TIMEOUT = 5000;
  		var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

  		var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // Tasks are stored on a min heap

  		var taskQueue = [];
  		var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

  		var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.
  		var currentTask = null;
  		var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrance.

  		var isPerformingWork = false;
  		var isHostCallbackScheduled = false;
  		var isHostTimeoutScheduled = false; // Capture local references to native APIs, in case a polyfill overrides them.

  		var localSetTimeout = typeof setTimeout === 'function' ? setTimeout : null;
  		var localClearTimeout = typeof clearTimeout === 'function' ? clearTimeout : null;
  		var localSetImmediate = typeof setImmediate !== 'undefined' ? setImmediate : null; // IE and Node.js + jsdom

  		typeof navigator !== 'undefined' && navigator.scheduling !== undefined && navigator.scheduling.isInputPending !== undefined ? navigator.scheduling.isInputPending.bind(navigator.scheduling) : null;

  		function advanceTimers(currentTime) {
  		  // Check for tasks that are no longer delayed and add them to the queue.
  		  var timer = peek(timerQueue);

  		  while (timer !== null) {
  		    if (timer.callback === null) {
  		      // Timer was cancelled.
  		      pop(timerQueue);
  		    } else if (timer.startTime <= currentTime) {
  		      // Timer fired. Transfer to the task queue.
  		      pop(timerQueue);
  		      timer.sortIndex = timer.expirationTime;
  		      push(taskQueue, timer);
  		    } else {
  		      // Remaining timers are pending.
  		      return;
  		    }

  		    timer = peek(timerQueue);
  		  }
  		}

  		function handleTimeout(currentTime) {
  		  isHostTimeoutScheduled = false;
  		  advanceTimers(currentTime);

  		  if (!isHostCallbackScheduled) {
  		    if (peek(taskQueue) !== null) {
  		      isHostCallbackScheduled = true;
  		      requestHostCallback(flushWork);
  		    } else {
  		      var firstTimer = peek(timerQueue);

  		      if (firstTimer !== null) {
  		        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
  		      }
  		    }
  		  }
  		}

  		function flushWork(hasTimeRemaining, initialTime) {


  		  isHostCallbackScheduled = false;

  		  if (isHostTimeoutScheduled) {
  		    // We scheduled a timeout but it's no longer needed. Cancel it.
  		    isHostTimeoutScheduled = false;
  		    cancelHostTimeout();
  		  }

  		  isPerformingWork = true;
  		  var previousPriorityLevel = currentPriorityLevel;

  		  try {
  		    var currentTime; if (enableProfiling) ; else {
  		      // No catch in prod code path.
  		      return workLoop(hasTimeRemaining, initialTime);
  		    }
  		  } finally {
  		    currentTask = null;
  		    currentPriorityLevel = previousPriorityLevel;
  		    isPerformingWork = false;
  		  }
  		}

  		function workLoop(hasTimeRemaining, initialTime) {
  		  var currentTime = initialTime;
  		  advanceTimers(currentTime);
  		  currentTask = peek(taskQueue);

  		  while (currentTask !== null && !(enableSchedulerDebugging )) {
  		    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
  		      // This currentTask hasn't expired, and we've reached the deadline.
  		      break;
  		    }

  		    var callback = currentTask.callback;

  		    if (typeof callback === 'function') {
  		      currentTask.callback = null;
  		      currentPriorityLevel = currentTask.priorityLevel;
  		      var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;

  		      var continuationCallback = callback(didUserCallbackTimeout);
  		      currentTime = exports.unstable_now();

  		      if (typeof continuationCallback === 'function') {
  		        currentTask.callback = continuationCallback;
  		      } else {

  		        if (currentTask === peek(taskQueue)) {
  		          pop(taskQueue);
  		        }
  		      }

  		      advanceTimers(currentTime);
  		    } else {
  		      pop(taskQueue);
  		    }

  		    currentTask = peek(taskQueue);
  		  } // Return whether there's additional work


  		  if (currentTask !== null) {
  		    return true;
  		  } else {
  		    var firstTimer = peek(timerQueue);

  		    if (firstTimer !== null) {
  		      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
  		    }

  		    return false;
  		  }
  		}

  		function unstable_runWithPriority(priorityLevel, eventHandler) {
  		  switch (priorityLevel) {
  		    case ImmediatePriority:
  		    case UserBlockingPriority:
  		    case NormalPriority:
  		    case LowPriority:
  		    case IdlePriority:
  		      break;

  		    default:
  		      priorityLevel = NormalPriority;
  		  }

  		  var previousPriorityLevel = currentPriorityLevel;
  		  currentPriorityLevel = priorityLevel;

  		  try {
  		    return eventHandler();
  		  } finally {
  		    currentPriorityLevel = previousPriorityLevel;
  		  }
  		}

  		function unstable_next(eventHandler) {
  		  var priorityLevel;

  		  switch (currentPriorityLevel) {
  		    case ImmediatePriority:
  		    case UserBlockingPriority:
  		    case NormalPriority:
  		      // Shift down to normal priority
  		      priorityLevel = NormalPriority;
  		      break;

  		    default:
  		      // Anything lower than normal priority should remain at the current level.
  		      priorityLevel = currentPriorityLevel;
  		      break;
  		  }

  		  var previousPriorityLevel = currentPriorityLevel;
  		  currentPriorityLevel = priorityLevel;

  		  try {
  		    return eventHandler();
  		  } finally {
  		    currentPriorityLevel = previousPriorityLevel;
  		  }
  		}

  		function unstable_wrapCallback(callback) {
  		  var parentPriorityLevel = currentPriorityLevel;
  		  return function () {
  		    // This is a fork of runWithPriority, inlined for performance.
  		    var previousPriorityLevel = currentPriorityLevel;
  		    currentPriorityLevel = parentPriorityLevel;

  		    try {
  		      return callback.apply(this, arguments);
  		    } finally {
  		      currentPriorityLevel = previousPriorityLevel;
  		    }
  		  };
  		}

  		function unstable_scheduleCallback(priorityLevel, callback, options) {
  		  var currentTime = exports.unstable_now();
  		  var startTime;

  		  if (typeof options === 'object' && options !== null) {
  		    var delay = options.delay;

  		    if (typeof delay === 'number' && delay > 0) {
  		      startTime = currentTime + delay;
  		    } else {
  		      startTime = currentTime;
  		    }
  		  } else {
  		    startTime = currentTime;
  		  }

  		  var timeout;

  		  switch (priorityLevel) {
  		    case ImmediatePriority:
  		      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
  		      break;

  		    case UserBlockingPriority:
  		      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
  		      break;

  		    case IdlePriority:
  		      timeout = IDLE_PRIORITY_TIMEOUT;
  		      break;

  		    case LowPriority:
  		      timeout = LOW_PRIORITY_TIMEOUT;
  		      break;

  		    case NormalPriority:
  		    default:
  		      timeout = NORMAL_PRIORITY_TIMEOUT;
  		      break;
  		  }

  		  var expirationTime = startTime + timeout;
  		  var newTask = {
  		    id: taskIdCounter++,
  		    callback: callback,
  		    priorityLevel: priorityLevel,
  		    startTime: startTime,
  		    expirationTime: expirationTime,
  		    sortIndex: -1
  		  };

  		  if (startTime > currentTime) {
  		    // This is a delayed task.
  		    newTask.sortIndex = startTime;
  		    push(timerQueue, newTask);

  		    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
  		      // All tasks are delayed, and this is the task with the earliest delay.
  		      if (isHostTimeoutScheduled) {
  		        // Cancel an existing timeout.
  		        cancelHostTimeout();
  		      } else {
  		        isHostTimeoutScheduled = true;
  		      } // Schedule a timeout.


  		      requestHostTimeout(handleTimeout, startTime - currentTime);
  		    }
  		  } else {
  		    newTask.sortIndex = expirationTime;
  		    push(taskQueue, newTask);
  		    // wait until the next time we yield.


  		    if (!isHostCallbackScheduled && !isPerformingWork) {
  		      isHostCallbackScheduled = true;
  		      requestHostCallback(flushWork);
  		    }
  		  }

  		  return newTask;
  		}

  		function unstable_pauseExecution() {
  		}

  		function unstable_continueExecution() {

  		  if (!isHostCallbackScheduled && !isPerformingWork) {
  		    isHostCallbackScheduled = true;
  		    requestHostCallback(flushWork);
  		  }
  		}

  		function unstable_getFirstCallbackNode() {
  		  return peek(taskQueue);
  		}

  		function unstable_cancelCallback(task) {
  		  // remove from the queue because you can't remove arbitrary nodes from an
  		  // array based heap, only the first one.)


  		  task.callback = null;
  		}

  		function unstable_getCurrentPriorityLevel() {
  		  return currentPriorityLevel;
  		}

  		var isMessageLoopRunning = false;
  		var scheduledHostCallback = null;
  		var taskTimeoutID = -1; // Scheduler periodically yields in case there is other work on the main
  		// thread, like user events. By default, it yields multiple times per frame.
  		// It does not attempt to align with frame boundaries, since most tasks don't
  		// need to be frame aligned; for those that do, use requestAnimationFrame.

  		var frameInterval = frameYieldMs;
  		var startTime = -1;

  		function shouldYieldToHost() {
  		  var timeElapsed = exports.unstable_now() - startTime;

  		  if (timeElapsed < frameInterval) {
  		    // The main thread has only been blocked for a really short amount of time;
  		    // smaller than a single frame. Don't yield yet.
  		    return false;
  		  } // The main thread has been blocked for a non-negligible amount of time. We


  		  return true;
  		}

  		function requestPaint() {

  		}

  		function forceFrameRate(fps) {
  		  if (fps < 0 || fps > 125) {
  		    // Using console['error'] to evade Babel and ESLint
  		    console['error']('forceFrameRate takes a positive int between 0 and 125, ' + 'forcing frame rates higher than 125 fps is not supported');
  		    return;
  		  }

  		  if (fps > 0) {
  		    frameInterval = Math.floor(1000 / fps);
  		  } else {
  		    // reset the framerate
  		    frameInterval = frameYieldMs;
  		  }
  		}

  		var performWorkUntilDeadline = function () {
  		  if (scheduledHostCallback !== null) {
  		    var currentTime = exports.unstable_now(); // Keep track of the start time so we can measure how long the main thread
  		    // has been blocked.

  		    startTime = currentTime;
  		    var hasTimeRemaining = true; // If a scheduler task throws, exit the current browser task so the
  		    // error can be observed.
  		    //
  		    // Intentionally not using a try-catch, since that makes some debugging
  		    // techniques harder. Instead, if `scheduledHostCallback` errors, then
  		    // `hasMoreWork` will remain true, and we'll continue the work loop.

  		    var hasMoreWork = true;

  		    try {
  		      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
  		    } finally {
  		      if (hasMoreWork) {
  		        // If there's more work, schedule the next message event at the end
  		        // of the preceding one.
  		        schedulePerformWorkUntilDeadline();
  		      } else {
  		        isMessageLoopRunning = false;
  		        scheduledHostCallback = null;
  		      }
  		    }
  		  } else {
  		    isMessageLoopRunning = false;
  		  } // Yielding to the browser will give it a chance to paint, so we can
  		};

  		var schedulePerformWorkUntilDeadline;

  		if (typeof localSetImmediate === 'function') {
  		  // Node.js and old IE.
  		  // There's a few reasons for why we prefer setImmediate.
  		  //
  		  // Unlike MessageChannel, it doesn't prevent a Node.js process from exiting.
  		  // (Even though this is a DOM fork of the Scheduler, you could get here
  		  // with a mix of Node.js 15+, which has a MessageChannel, and jsdom.)
  		  // https://github.com/facebook/react/issues/20756
  		  //
  		  // But also, it runs earlier which is the semantic we want.
  		  // If other browsers ever implement it, it's better to use it.
  		  // Although both of these would be inferior to native scheduling.
  		  schedulePerformWorkUntilDeadline = function () {
  		    localSetImmediate(performWorkUntilDeadline);
  		  };
  		} else if (typeof MessageChannel !== 'undefined') {
  		  // DOM and Worker environments.
  		  // We prefer MessageChannel because of the 4ms setTimeout clamping.
  		  var channel = new MessageChannel();
  		  var port = channel.port2;
  		  channel.port1.onmessage = performWorkUntilDeadline;

  		  schedulePerformWorkUntilDeadline = function () {
  		    port.postMessage(null);
  		  };
  		} else {
  		  // We should only fallback here in non-browser environments.
  		  schedulePerformWorkUntilDeadline = function () {
  		    localSetTimeout(performWorkUntilDeadline, 0);
  		  };
  		}

  		function requestHostCallback(callback) {
  		  scheduledHostCallback = callback;

  		  if (!isMessageLoopRunning) {
  		    isMessageLoopRunning = true;
  		    schedulePerformWorkUntilDeadline();
  		  }
  		}

  		function requestHostTimeout(callback, ms) {
  		  taskTimeoutID = localSetTimeout(function () {
  		    callback(exports.unstable_now());
  		  }, ms);
  		}

  		function cancelHostTimeout() {
  		  localClearTimeout(taskTimeoutID);
  		  taskTimeoutID = -1;
  		}

  		var unstable_requestPaint = requestPaint;
  		var unstable_Profiling =  null;

  		exports.unstable_IdlePriority = IdlePriority;
  		exports.unstable_ImmediatePriority = ImmediatePriority;
  		exports.unstable_LowPriority = LowPriority;
  		exports.unstable_NormalPriority = NormalPriority;
  		exports.unstable_Profiling = unstable_Profiling;
  		exports.unstable_UserBlockingPriority = UserBlockingPriority;
  		exports.unstable_cancelCallback = unstable_cancelCallback;
  		exports.unstable_continueExecution = unstable_continueExecution;
  		exports.unstable_forceFrameRate = forceFrameRate;
  		exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
  		exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
  		exports.unstable_next = unstable_next;
  		exports.unstable_pauseExecution = unstable_pauseExecution;
  		exports.unstable_requestPaint = unstable_requestPaint;
  		exports.unstable_runWithPriority = unstable_runWithPriority;
  		exports.unstable_scheduleCallback = unstable_scheduleCallback;
  		exports.unstable_shouldYield = shouldYieldToHost;
  		exports.unstable_wrapCallback = unstable_wrapCallback;
  		          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  		if (
  		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
  		    'function'
  		) {
  		  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  		}
  		        
  		  })();
  		} 
  	} (scheduler_development));
  	return scheduler_development;
  }

  if (process.env.NODE_ENV === 'production') {
    scheduler.exports = requireScheduler_production_min();
  } else {
    scheduler.exports = requireScheduler_development();
  }

  var schedulerExports = scheduler.exports;

  const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  const NoLane$1 = 0b00000000;
  const NoLanes = 0b00000000;
  const SyncLane = 0b00000001;
  const InputContinuousLane = 0b00000010;
  const DefaultLane = 0b00000100;
  const TransitionLane = 0b00001000;

  const { currentBatchConfig: ReactCurrentBatchConfig } = internals;

  function lanesToSchedulerPriority(lanes) {
    const lane = getHighestPriorityLane(lanes);

    if (lane === SyncLane) {
      return schedulerExports.unstable_ImmediatePriority;
    }

    if (lane === InputContinuousLane) {
      return schedulerExports.unstable_UserBlockingPriority;
    }

    if (lane === DefaultLane) {
      return schedulerExports.unstable_NormalPriority;
    }

    return schedulerExports.unstable_IdlePriority;
  }

  function schedulerPriorityToLane(schedulerPriority) {
    if (schedulerPriority === schedulerExports.unstable_ImmediatePriority) {
      return SyncLane;
    }

    if (schedulerPriority === schedulerExports.unstable_UserBlockingPriority) {
      return InputContinuousLane;
    }

    if (schedulerPriority === schedulerExports.unstable_NormalPriority) {
      return DefaultLane;
    }

    return NoLane$1;
  }

  function mergeLanes(laneA, laneB) {
    return laneA | laneB;
  }

  function requestUpdateLane() {
    const isTransition = ReactCurrentBatchConfig.transition !== null;

    if (isTransition) {
      return TransitionLane;
    }

    const currentSchedulerPriority = schedulerExports.unstable_getCurrentPriorityLevel();
    const lane = schedulerPriorityToLane(currentSchedulerPriority);
    return lane;
  }

  function getHighestPriorityLane(lanes) {
    return lanes & -lanes;
  }

  function markRootFinished(root, lane) {
    root.pendingLanes &= ~lane;
    root.suspendedLanes = NoLanes;
    root.pingdLanes = NoLanes;
  }

  function isSubsetOfLanes(set, subset) {
    return (set & subset) === subset;
  }

  function markRootSuspended(root, suspendedLane) {
    root.suspendedLanes |= suspendedLane;
    root.pendingLanes &= ~suspendedLane;
  }

  function markRootPinged(root, pingdLane) {
    root.pingdLanes |= root.suspendedLanes & pingdLane;
  }

  function getNextLane(root) {
    const pendingLanes = root.pendingLanes;

    if (pendingLanes === NoLanes) {
      return NoLane$1;
    }

    let nextLane = NoLane$1;
    const suspendedLanes = pendingLanes & ~root.suspendedLanes;

    if (suspendedLanes !== NoLanes) {
      nextLane = getHighestPriorityLane(suspendedLanes);
    } else {
      const pingedLanes = pendingLanes & root.pingdLanes;
      if (pingedLanes !== NoLanes) {
        nextLane = getHighestPriorityLane(pingedLanes);
      }
    }

    return nextLane;
  }

  function includeSomeLanes(set, subset) {
    return (set & subset) !== NoLanes;
  }

  function removeLanes(set, subset) {
    return set & ~subset;
  }

  const FunctionComponent = 0;
  const HostRoot = 3;
  const HostComponent = 5;
  const HostText = 6;
  const Fragment = 7;
  const ContextProvider = 8;
  const SuspenseComponent = 13;
  const OffscreenComponent = 14;
  const MemoComponent = 15;

  class FiberNode {
    constructor(tag, pendingProps, key) {
      // 存储节点的类型、实例、状态
      this.tag = tag;
      this.key = key || null;
      this.type = null;
      this.stateNode = null;

      // 存储节点的父节点、子节点、兄弟节点信息
      this.return = null;
      this.sibling = null;
      this.child = null;
      this.index = 0;

      // 存储节点的 ref 信息
      this.ref = null;
      this.refCleanup = null;

      // 存储节点的 props、state、更新队列、依赖项信息
      this.pendingProps = pendingProps;
      this.memoizedProps = null;
      this.memoizedState = null;
      this.updateQueue = null;
      this.dependencies = null;

      this.flags = NoFlags;
      this.subtreeFlags = NoFlags;
      this.deletions = null;

      // 存储一个 fiberNode 中所有未执行的更新对应的 lane
      this.lanes = NoLanes;
      // 存储一个 fiberNode 子树中所有未执行更新对应的 lane
      this.childLanes = NoLanes;

      // 存储节点的双缓存信息
      this.alternate = null;
    }
  }

  function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;

    if (workInProgress === null) {
      // mount 阶段
      workInProgress = new FiberNode(current.tag, pendingProps, current.key);
      workInProgress.stateNode = current.stateNode;
      workInProgress.alternate = current;
      current.alternate = workInProgress;
    } else {
      // update 阶段
      workInProgress.pendingProps = pendingProps;
      workInProgress.flags = NoFlags;
      workInProgress.deletions = null;
    }

    workInProgress.ref = current.ref;
    workInProgress.type = current.type;
    workInProgress.child = current.child;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.lanes = current.lanes;
    workInProgress.childLanes = current.childLanes;

    const currentDeps = current.dependencies;
    workInProgress.dependencies =
      currentDeps === null
        ? null
        : {
            lanes: currentDeps.lanes,
            firstContext: currentDeps.firstContext
          };

    return workInProgress;
  }

  function createFiberFromElement(element, lanes) {
    const { ref, key, type, props } = element;

    let fiberTag = FunctionComponent;

    if (typeof type === 'string') {
      fiberTag = HostComponent;
    } else if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_PROVIDER_TYPE:
          fiberTag = ContextProvider;
          break;
        case REACT_MEMO_TYPE:
          fiberTag = MemoComponent;
          break;
      }
    } else if (type === REACT_SUSPENSE_TYPE) {
      fiberTag = SuspenseComponent;
    } else if (typeof type !== 'function') {
      console.log('未定义的 type 类型', element);
    }

    const fiber = new FiberNode(fiberTag, props, key);

    fiber.ref = ref;
    fiber.type = type;
    fiber.lanes = lanes;

    return fiber;
  }

  function createFiberFromFragment(elements, key) {
    const fiber = new FiberNode(Fragment, elements, key);
    return fiber;
  }

  function createFiberFromOffscreen(pendingProps) {
    const fiber = new FiberNode(OffscreenComponent, pendingProps, null);
    return fiber;
  }

  class FiberRootNode {
    constructor(container, hostRootFiber) {
      this.container = container;
      this.current = hostRootFiber;
      hostRootFiber.stateNode = this;

      this.pingCache = null;
      this.finishedWork = null;
      this.callbackNode = null;
      this.finishedLane = NoLane$1;

      this.pingdLanes = NoLanes;
      this.pendingLanes = NoLanes;
      this.suspendedLanes = NoLanes;
      this.callbackPriority = NoLane$1;

      this.pendingPassiveEffects = {
        unmount: [],
        update: []
      };
    }
  }

  let lastContextDep = null;
  let prevContextValue = null;
  const prevContextValueStack = [];

  function pushProvider(context, newValue) {
    prevContextValueStack.push(prevContextValue);
    prevContextValue = context._currentValue;
    context._currentValue = newValue;
  }

  function popProvider(context) {
    context._currentValue = prevContextValue;
    prevContextValue = prevContextValueStack.pop();
  }

  function prepareToReadContext(workInProgress, renderLane) {
    lastContextDep = null;

    const deps = workInProgress.dependencies;
    if (deps !== null) {
      const firstContext = deps.firstContext;
      if (firstContext != null) {
        if (includeSomeLanes(deps.lanes, renderLane)) {
          markWorkInProgressReceiveUpdate();
        }
        deps.firstContext = null;
      }
    }
  }

  function readContext$1(consumer, context) {
    if (consumer == null) {
      throw new Error('请在函数组件内调用 useContext');
    }

    const value = context._currentValue;

    const contextItem = {
      context,
      next: null,
      memoizedState: value
    };

    if (lastContextDep == null) {
      lastContextDep = contextItem;
      consumer.dependencies = {
        lanes: NoLanes,
        firstContext: contextItem
      };
    } else {
      lastContextDep = lastContextDep.next = contextItem;
    }

    return value;
  }

  function propagateContextChange(workInProgress, context, renderLane) {
    let fiber = workInProgress.child;
    if (fiber !== null) {
      fiber.return = workInProgress;
    }

    while (fiber !== null) {
      let nextFiber = null;
      const deps = fiber.dependencies;
      if (deps !== null) {
        nextFiber = fiber.child;
        let contextItem = deps.firstContext;
        while (contextItem !== null) {
          if (contextItem.context === context) {
            fiber.lanes = mergeLanes(fiber.lanes, renderLane);
            const alternate = fiber.alternate;
            if (alternate !== null) {
              alternate.lanes = mergeLanes(alternate.lanes, renderLane);
            }
            scheduleContextWorkOnParentPath(
              fiber.return,
              workInProgress,
              renderLane
            );
            deps.lanes = mergeLanes(deps.lanes, renderLane);
            break;
          }
          contextItem = contextItem.next;
        }
      } else if (fiber.tag === ContextProvider) {
        nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
      } else {
        nextFiber = fiber.child;
      }

      if (nextFiber !== null) {
        nextFiber.return = fiber;
      } else {
        nextFiber = fiber;
        while (nextFiber !== null) {
          if (nextFiber === workInProgress) {
            nextFiber = null;
            break;
          }
          let sibling = nextFiber.sibling;
          if (sibling !== null) {
            sibling.return = nextFiber.return;
            nextFiber = sibling;
            break;
          }
          nextFiber = nextFiber.return;
        }
      }
      fiber = nextFiber;
    }
  }

  function scheduleContextWorkOnParentPath(from, to, renderLane) {
    let node = from;

    while (node !== null) {
      const alternate = node.alternate;
      if (!isSubsetOfLanes(node.childLanes, renderLane)) {
        node.childLanes = mergeLanes(node.childLanes, renderLane);
        if (alternate !== null) {
          alternate.childLanes = mergeLanes(alternate.childLanes, renderLane);
        }
      } else if (
        alternate != null &&
        !isSubsetOfLanes(alternate.childLanes, renderLane)
      ) {
        alternate.childLanes = mergeLanes(alternate.childLanes, renderLane);
      }

      if (node === to) {
        break;
      }
      node = node.return;
    }
  }

  const createUpdate = (
    action,
    lane,
    hasEagerState = false,
    eagerState = null
  ) => {
    return {
      lane,
      action,
      next: null,
      hasEagerState,
      eagerState
    };
  };

  const createUpdateQueue = () => {
    return {
      shared: {
        pending: null
      },
      dispatch: null
    };
  };

  const enqueueUpdate = (updateQueue, update, fiber, lane) => {
    const pending = updateQueue.shared.pending;
    if (pending === null) {
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    updateQueue.shared.pending = update;

    fiber.lanes = mergeLanes(fiber.lanes, lane);
    const alternate = fiber.alternate;
    if (alternate !== null) {
      alternate.lanes = mergeLanes(alternate.lanes, lane);
    }
  };

  function basicStateReducer(state, action) {
    if (action instanceof Function) {
      return action(state);
    } else {
      return action;
    }
  }

  const processUpdateQueue = (
    baseState,
    pendingUpdate,
    renderLane,
    onSkipUpdate
  ) => {
    const result = { baseState, baseQueue: null, memoizedState: baseState };

    if (pendingUpdate !== null) {
      let first = pendingUpdate.next;
      let pending = pendingUpdate.next;

      let newBaseState = baseState;
      let newBaseQueueFirst = null;
      let newBaseQueueLast = null;
      let newState = baseState;

      do {
        const updateLane = pending.lane;
        if (!isSubsetOfLanes(renderLane, updateLane)) {
          const clone = createUpdate(pending.action, pending.lane);
          onSkipUpdate?.(clone);

          if (newBaseQueueFirst === null) {
            newBaseQueueFirst = clone;
            newBaseQueueLast = clone;
            newBaseState = newState;
          } else {
            newBaseQueueLast.next = clone;
            newBaseQueueLast = clone;
          }
        } else {
          if (newBaseQueueLast !== null) {
            const clone = createUpdate(pending.action, NoLane);
            newBaseQueueLast.next = clone;
            newBaseQueueLast = clone;
          }
          const action = pending.action;

          if (pending.hasEagerState) {
            newState = pending.eagerState;
          } else {
            newState = basicStateReducer(baseState, action);
          }
        }

        pending = pending.next;
      } while (pending !== first);

      if (newBaseQueueLast === null) {
        newBaseState = newState;
      } else {
        newBaseQueueLast.next = newBaseQueueFirst;
      }

      result.memoizedState = newState;
      result.baseState = newBaseState;
      result.baseQueue = newBaseQueueLast;
    }

    return result;
  };

  const suspenseHandlerStack = [];

  function getSuspenseHandler() {
    return suspenseHandlerStack[suspenseHandlerStack.length - 1];
  }

  function pushSuspenseHandler(handler) {
    suspenseHandlerStack.push(handler);
  }

  function popSuspenseHandler() {
    suspenseHandlerStack.pop();
  }

  let suspendedThenable = null;

  const SuspenseException = new Error(
    '这不是真实的错误, 是 Suspense 用来中断渲染的'
  );

  function noop() {}

  function getSuspenseThenable() {
    if (suspendedThenable === null) {
      throw new Error('应该存在 suspendedThenable, 这是一个 Bug');
    }
    const thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }

  function trackUsedThenable(thenable) {
    switch (thenable.status) {
      case 'fulfilled':
        return thenable.value;
      case 'rejected':
        throw thenable.reason;
      default:
        if (typeof thenable.status === 'string') {
          thenable.then(noop, noop);
        } else {
          const pending = thenable;
          pending.status = 'pending';
          pending.then(
            val => {
              if (pending.status === 'pending') {
                const fulfilled = pending;
                fulfilled.status = 'fulfilled';
                fulfilled.value = val;
              }
            },
            error => {
              if (pending.status === 'pending') {
                const rejected = pending;
                rejected.status = 'rejected';
                rejected.reason = error;
              }
            }
          );
        }
        break;
    }

    suspendedThenable = thenable;
    throw SuspenseException;
  }

  const Passive = 0b0010;
  const HookHasEffect = 0b0001;

  let renderLane = NoLane$1;
  /**
   * @description: 当前正在渲染的 Fiber
   */
  let currentlyRenderingFiber = null;
  /**
   * @description: 当前正在处理的 Hook
   */
  let workInProgressHook = null;

  /**
   * @description: 当前正在使用的 Hook
   */
  let currentHook = null;

  const { currentDispatcher, currentBatchConfig } = internals;

  function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps === null || nextDeps === null) {
      return false;
    }
    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
      if (Object.is(prevDeps[i], nextDeps[i])) {
        continue;
      }
      return false;
    }
    return true;
  }

  function readContext(context) {
    const consumer = currentlyRenderingFiber;
    return readContext$1(consumer, context);
  }

  function mountWorkInProgressHook() {
    const hook = {
      next: null,
      baseQueue: null,
      baseState: null,
      updateQueue: null,
      memoizedState: null
    };

    if (workInProgressHook == null) {
      if (currentlyRenderingFiber == null) {
        throw new Error('请在函数组件内调用 Hook');
      } else {
        workInProgressHook = hook;
        currentlyRenderingFiber.memoizedState = workInProgressHook;
      }
    } else {
      workInProgressHook.next = hook;
      workInProgressHook = hook;
    }
    return workInProgressHook;
  }

  function updateWorkInProgressHook() {
    let nextCurrentHook = null;

    if (currentHook == null) {
      const current = currentlyRenderingFiber?.alternate;
      if (current !== null) {
        nextCurrentHook = current.memoizedState;
      } else {
        nextCurrentHook = null;
      }
    } else {
      nextCurrentHook = currentHook.next;
    }

    if (nextCurrentHook == null) {
      /**
       * @description: nextCurrentHook 为 null
       * 之前: u1 u2 u3
       * 现在: u1 u2 u3 u4
       * 原因:
       * 1. if(){ u4 } => u4 放在了 If 语句中
       */
      throw new Error('本次执行时的 Hook 比上次执行时多');
    }

    currentHook = nextCurrentHook;

    const newHook = {
      next: null,
      baseState: currentHook.baseQueue,
      baseQueue: currentHook.baseState,
      updateQueue: currentHook.updateQueue,
      memoizedState: currentHook.memoizedState
    };

    if (workInProgressHook == null) {
      if (currentlyRenderingFiber == null) {
        throw new Error('请在函数组件内调用 Hook');
      } else {
        workInProgressHook = newHook;
        currentlyRenderingFiber.memoizedState = workInProgressHook;
      }
    } else {
      workInProgressHook.next = newHook;
      workInProgressHook = newHook;
    }
    return workInProgressHook;
  }

  function createFCUpdateQueue() {
    const updateQueue = createUpdateQueue();
    updateQueue.lastEffect = null;
    return updateQueue;
  }

  /**
   * @description: dispatchSetState
   * @param {*} fiber dispatchSetState.bind 时已经传入
   * @param {*} updateQueue dispatchSetState.bind 时已经传入
   * @param {*} action : setState(value) || setValue(()=> value) 中的 value 或者 ()=> value
   */
  function dispatchSetState(fiber, updateQueue, action) {
    const lane = requestUpdateLane();
    const update = createUpdate(action, lane);

    // eagerState 策略
    const current = fiber.alternate;
    if (
      fiber.lanes === NoLanes &&
      (current == null || current.lanes === NoLanes)
    ) {
      const currentState = updateQueue.lastRenderedState;
      const eagerState = basicStateReducer(currentState, action);
      update.hasEagerState = true;
      update.eagerState = eagerState;

      if (Object.is(currentState, eagerState)) {
        enqueueUpdate(updateQueue, update, fiber, NoLane$1);
        console.log('命中 eagerState 策略', fiber);
        return;
      }
    }

    enqueueUpdate(updateQueue, update, fiber, lane);
    scheduleUpdateOnFiber(fiber, lane);
  }

  function mountState(initialState) {
    const hook = mountWorkInProgressHook();

    let memoizedState;

    if (initialState instanceof Function) {
      memoizedState = initialState();
    } else {
      memoizedState = initialState;
    }

    const queue = createFCUpdateQueue();
    hook.updateQueue = queue;
    hook.baseState = memoizedState;
    hook.memoizedState = memoizedState;

    const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
    queue.dispatch = dispatch;
    queue.lastRenderedState = memoizedState;

    return [memoizedState, dispatch];
  }

  function updateState() {
    const hook = updateWorkInProgressHook();

    const queue = hook.updateQueue;
    const baseState = hook.baseState;
    const pending = queue.shared.pending;

    const current = currentHook;
    let baseQueue = current.baseQueue;

    if (pending != null) {
      if (baseQueue != null) {
        const baseFirst = baseQueue.next;
        const pendingFirst = pending.next;
        baseQueue.next = pendingFirst;
        pending.next = baseFirst;
      }

      baseQueue = pending;
      current.baseQueue = pending;
      queue.shared.pending = null;
    }

    if (baseQueue !== null) {
      const prevState = hook.memoizedState;
      const {
        memoizedState,
        baseQueue: newBaseQueue,
        baseState: newBaseState
      } = processUpdateQueue(baseState, baseQueue, renderLane, update => {
        const skippedLane = update.lane;
        const fiber = currentlyRenderingFiber;
        fiber.lanes = mergeLanes(fiber.lanes, skippedLane);
      });

      if (!Object.is(prevState, memoizedState)) {
        markWorkInProgressReceiveUpdate();
      }

      hook.memoizedState = memoizedState;
      hook.baseState = newBaseState;
      hook.baseQueue = newBaseQueue;
      queue.lastRenderedState = memoizedState;
    }

    return [hook.memoizedState, queue.dispatch];
  }

  function pushEffect(hookFlags, create, destroy, deps) {
    const effect = {
      deps,
      create,
      destroy,
      next: null,
      tag: hookFlags
    };

    const fiber = currentlyRenderingFiber;
    const updateQueue = fiber.updateQueue;
    if (updateQueue == null) {
      const updateQueue = createFCUpdateQueue();
      fiber.updateQueue = updateQueue;
      effect.next = effect;
      updateQueue.lastEffect = effect;
    } else {
      const lastEffect = updateQueue.lastEffect;
      if (lastEffect == null) {
        effect.next = effect;
        updateQueue.lastEffect = effect;
      } else {
        const firstEffect = lastEffect.next;
        lastEffect.next = effect;
        effect.next = firstEffect;
        updateQueue.lastEffect = effect;
      }
    }
    return effect;
  }

  function mountEffect(create, deps) {
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    currentlyRenderingFiber.flags |= PassiveEffect;
    hook.memoizedState = pushEffect(
      Passive | HookHasEffect,
      create,
      undefined,
      nextDeps
    );
  }

  function updateEffect(create, deps) {
    let destroy;
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;

    if (currentHook !== null) {
      const prevEffect = currentHook.memoizedState;
      destroy = prevEffect.destroy;
      if (nextDeps !== null) {
        const prevDeps = prevEffect.deps;
        if (areHookInputsEqual(nextDeps, prevDeps)) {
          hook.memoizedState = pushEffect(Passive, create, destroy, nextDeps);
          return;
        }
      }

      currentlyRenderingFiber.flags |= PassiveEffect;
      hook.memoizedState = pushEffect(
        Passive | HookHasEffect,
        create,
        destroy,
        nextDeps
      );
    }
  }

  function startTransition(setPending, callback) {
    setPending(true);
    const prevTransition = currentBatchConfig.transition;
    currentBatchConfig.transition = 1;
    callback();
    setPending(false);
    currentBatchConfig.transition = prevTransition;
  }

  function mountTransition() {
    const [isPending, setPending] = mountState(false);
    const hook = mountWorkInProgressHook();
    const start = startTransition.bind(null, setPending);
    hook.memoizedState = start;
    return [isPending, start];
  }

  function updateTransition() {
    const [isPending] = updateState();
    const hook = updateWorkInProgressHook();
    const start = hook.memoizedState;
    return [isPending, start];
  }

  function mountRef(initialValue) {
    const hook = mountWorkInProgressHook();
    const ref = { current: initialValue };
    hook.memoizedState = ref;
    return ref;
  }

  function updateRef() {
    const hook = updateWorkInProgressHook();
    return hook.memoizedState;
  }

  function use(useable) {
    if (useable !== null && typeof useable === 'object') {
      if (typeof useable.then === 'function') {
        const thenable = useable;
        return trackUsedThenable(thenable);
      } else if (useable.$$typeof === REACT_CONTEXT_TYPE) {
        const context = useable;
        return readContext(context);
      }
    }

    throw new Error('不支持的 use 参数' + useable);
  }

  function mountCallback(callback, deps) {
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    hook.memoizedState = [callback, nextDeps];
    return callback;
  }

  function updateCallback(callback, deps) {
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    const prevState = hook.memoizedState;

    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }

    hook.memoizedState = [callback, nextDeps];
    return callback;
  }

  function mountMemo(nextCreate, deps) {
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    const nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }

  function updateMemo(nextCreate, deps) {
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    const prevState = hook.memoizedState;

    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }

    const nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }

  /**
   * @description: Mount 阶段 Hooks 实现
   */
  const HooksDispatcherOnMount = {
    use,
    useRef: mountRef,
    useMemo: mountMemo,
    useState: mountState,
    useEffect: mountEffect,
    useContext: readContext,
    useCallback: mountCallback,
    useTransition: mountTransition
  };

  /**
   * @description: Update 阶段 Hooks 实现
   */
  const HooksDispatcherOnUpdate = {
    use,
    useRef: updateRef,
    useMemo: updateMemo,
    useState: updateState,
    useEffect: updateEffect,
    useContext: readContext,
    useCallback: updateCallback,
    useTransition: updateTransition
  };

  function renderWithHooks(workInProgress, Component, lane) {
    renderLane = lane;
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null;
    workInProgress.updateQueue = null;

    const current = workInProgress.alternate;

    if (current !== null) {
      // update
      currentDispatcher.current = HooksDispatcherOnUpdate;
    } else {
      // mount
      currentDispatcher.current = HooksDispatcherOnMount;
    }

    const props = workInProgress.pendingProps;
    const children = Component(props);

    currentHook = null;
    renderLane = NoLane$1;
    workInProgressHook = null;
    currentlyRenderingFiber = null;

    return children;
  }

  function resetHooksOnUnwind() {
    currentlyRenderingFiber = null;
    currentHook = null;
    workInProgressHook = null;
  }

  function bailoutHook(workInProgress, renderLane) {
    const current = workInProgress.alternate;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.flags &= ~PassiveEffect;
    current.lanes = removeLanes(current.lanes, renderLane);
  }

  function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function updateFragment$1(returnFiber, current, elements, key, existingChildren) {
    let fiber;
    if (!current || current.tag !== Fragment) {
      fiber = createFiberFromFragment(elements, key);
    } else {
      existingChildren.delete(key);
      fiber = useFiber(current, elements);
    }
    fiber.return = returnFiber;
    return fiber;
  }

  function ChildReconciler(shouldTrackEffects) {
    /**
     * @description: 删除子节点
     */
    function deleteChild(returnFiber, childToDelete) {
      if (!shouldTrackEffects) {
        return;
      }

      const deletions = returnFiber.deletions;

      if (deletions == null) {
        returnFiber.deletions = [childToDelete];
        returnFiber.flags |= ChildDeletion;
      } else {
        deletions.push(childToDelete);
      }
    }

    /**
     * @description: 删除剩余节点
     */
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
      if (!shouldTrackEffects) {
        return;
      }

      let childToDelete = currentFirstChild;
      while (childToDelete != null) {
        deleteChild(returnFiber, childToDelete);
        childToDelete = childToDelete.sibling;
      }
    }

    /**
     * @description: reconcileSingleElement 工作
     * @param {*} returnFiber
     * @param {*} currentFiber
     * @param {*} element
     * 作用: 根据 element 创建 Fiber 并返回
     * 逻辑:
     */
    function reconcileSingleElement(returnFiber, currentFiber, element) {
      const key = element.key;
      while (currentFiber != null) {
        if (currentFiber.key === key) {
          if (element.$$typeof === REACT_ELEMENT_TYPE) {
            if (currentFiber.type === element.type) {
              let props = element.props;
              if (element.type === REACT_FRAGMENT_TYPE) {
                props = element.props.children;
              }
              // key 相同 type 相同, 则表示当前节点可复用
              const existing = useFiber(currentFiber, props);
              existing.return = returnFiber;
              // 当前节点可复用, 删除剩余旧节点
              deleteRemainingChildren(returnFiber, currentFiber.sibling);
              return existing;
            }

            //  key 相同 type 不同, 删掉所有旧节点
            deleteRemainingChildren(returnFiber, currentFiber);
            break;
          } else {
            console.log('reconcileSingleElement 未实现的类型');
            break;
          }
        } else {
          // key 不同, 则删除旧节点
          deleteChild(returnFiber, currentFiber);
          currentFiber = currentFiber.sibling;
        }
      }

      // 创建新节点
      let fiber;
      if (element.type === REACT_FRAGMENT_TYPE) {
        fiber = createFiberFromFragment(element.props.children, key);
      } else {
        fiber = createFiberFromElement(element);
      }
      fiber.return = returnFiber;
      return fiber;
    }

    /**
     * @description:
     * @param {*} returnFiber
     * @param {*} currentFiber
     * @param {*} content
     */
    function reconcileSingleTextNode(returnFiber, currentFiber, content) {
      while (currentFiber != null) {
        if (currentFiber.tag === HostText) {
          // 复用旧节点
          const existing = useFiber(currentFiber, { content });
          existing.return = returnFiber;
          deleteRemainingChildren(returnFiber, currentFiber.sibling);
          return existing;
        }
        // 删除旧节点
        deleteChild(returnFiber, currentFiber);
        currentFiber = currentFiber.sibling;
      }

      // 创建新节点
      const fiber = new FiberNode(HostText, { content }, null);
      fiber.return = returnFiber;
      return fiber;
    }

    function placeSingleChild(fiber) {
      if (shouldTrackEffects && fiber.alternate === null) {
        // 首次渲染
        fiber.flags |= Placement;
      }
      return fiber;
    }

    function updateFromMap(returnFiber, existingChildren, index, element) {
      const keyToUse = element.key !== null ? element.key : index;
      const before = existingChildren.get(keyToUse);

      if (typeof element === 'string' || typeof element === 'number') {
        if (before) {
          if (before.tag === HostText) {
            existingChildren.delete(keyToUse);
            return useFiber(before, { content: element + '' });
          }
        }
        return new FiberNode(HostText, { content: element + '' }, null);
      }

      if (typeof element === 'object' && element != null) {
        switch (element.$$typeof) {
          case REACT_ELEMENT_TYPE:
            if (element.type === REACT_FRAGMENT_TYPE) {
              return updateFragment$1(
                returnFiber,
                before,
                element,
                keyToUse,
                existingChildren
              );
            }
            if (before) {
              if (before.type === element.type) {
                existingChildren.delete(keyToUse);
                return useFiber(before, element.props);
              }
            }
            return createFiberFromElement(element);
        }

        if (Array.isArray(element)) {
          return updateFragment$1(
            returnFiber,
            before,
            element,
            keyToUse,
            existingChildren
          );
        }
      }

      return null;
    }

    function reconcileChildrenArray(returnFiber, currentFirstChild, newChild) {
      // 最后一个可复用的 fiber 在 current 中的 index
      let lastPlacedIndex = 0;
      // 创建的最后一个 fiber
      let lastNewFiber = null;
      // 创建的第一个 fiber
      let firstNewFiber = null;

      const existingChildren = new Map();
      let current = currentFirstChild;
      while (current != null) {
        const keyToUse = current.key !== null ? current.key : current.index;
        existingChildren.set(keyToUse, current);
        current = current.sibling;
      }

      for (let i = 0; i < newChild.length; i++) {
        const after = newChild[i];
        const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
        if (newFiber == null) {
          continue;
        }

        newFiber.index = i;
        newFiber.return = returnFiber;

        if (lastNewFiber == null) {
          lastNewFiber = newFiber;
          firstNewFiber = newFiber;
        } else {
          lastNewFiber.sibling = newFiber;
          lastNewFiber = lastNewFiber.sibling;
        }

        if (!shouldTrackEffects) {
          continue;
        }

        const current = newFiber.alternate;
        if (current !== null) {
          const oldIndex = current.index;
          if (oldIndex < lastPlacedIndex) {
            newFiber.flags |= Placement;
            continue;
          } else {
            lastPlacedIndex = oldIndex;
          }
        } else {
          newFiber.flags |= Placement;
        }
      }

      existingChildren.forEach(fiber => {
        deleteChild(returnFiber, fiber);
      });

      return firstNewFiber;
    }

    return function reconcileChildFibers(returnFiber, currentFiber, newChild) {
      const isUnkeyedTopLevelFragment =
        typeof newChild === 'object' &&
        newChild !== null &&
        newChild.type === REACT_FRAGMENT_TYPE &&
        newChild.key == null;

      if (isUnkeyedTopLevelFragment) {
        newChild = newChild.props.children;
      }

      if (typeof newChild === 'object' && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return placeSingleChild(
              reconcileSingleElement(returnFiber, currentFiber, newChild)
            );
        }

        if (Array.isArray(newChild)) {
          return reconcileChildrenArray(returnFiber, currentFiber, newChild);
        }
      }

      if (typeof newChild === 'string' || typeof newChild === 'number') {
        return placeSingleChild(
          reconcileSingleTextNode(returnFiber, currentFiber, newChild)
        );
      }

      if (currentFiber != null) {
        deleteRemainingChildren(returnFiber, currentFiber);
      }

      return null;
    };
  }

  const reconcileChildFibers = ChildReconciler(true);
  const mountChildFibers = ChildReconciler(false);

  function cloneChildFibers(workInProgress) {
    if (workInProgress.child == null) {
      return;
    }

    let currentChild = workInProgress.child;
    let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
    workInProgress.child = newChild;
    newChild.return = workInProgress;

    while (currentChild.sibling != null) {
      currentChild = currentChild.sibling;
      newChild = newChild.sibling = createWorkInProgress(
        newChild,
        newChild.pendingProps
      );
      newChild.return = workInProgress;
    }
  }

  function shallowEqual(objA, objB) {
    if (Object.is(objA, objB)) {
      return true;
    }

    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let i = 0; i < keysA.length; i++) {
      const currentKey = keysA[i];
      if (
        !Object.hasOwnProperty.call(objB, currentKey) ||
        !Object.is(objA[currentKey], objB[currentKey])
      ) {
        return false;
      }
    }

    return true;
  }

  let didReceiveUpdate = false;

  function markRef$1(current, workInprogress) {
    const ref = workInprogress.ref;

    if (
      (current == null && ref !== null) ||
      (current != null && current.ref != ref)
    ) {
      workInprogress.flags |= Ref;
    }
  }

  function markWorkInProgressReceiveUpdate() {
    didReceiveUpdate = true;
  }

  function reconcileChildren(workInProgress, children) {
    const current = workInProgress.alternate;

    if (current !== null) {
      // update 阶段
      workInProgress.child = reconcileChildFibers(
        workInProgress,
        current?.child,
        children
      );
    } else {
      // mount 阶段
      workInProgress.child = mountChildFibers(workInProgress, null, children);
    }
  }

  function updateHostRoot(workInProgress, renderLane) {
    const baseState = workInProgress.memoizedState;
    const updateQueue = workInProgress.updateQueue;
    const pending = updateQueue.shared.pending;
    updateQueue.shared.pending = null;

    const prevChildren = workInProgress.memoizedState;

    const { memoizedState } = processUpdateQueue(baseState, pending, renderLane);
    workInProgress.memoizedState = memoizedState;

    const current = workInProgress.alternate;
    if (current !== null) {
      if (!current.memoizedState) {
        current.memoizedState = memoizedState;
      }
    }

    const nextChildren = workInProgress.memoizedState;

    if (prevChildren === nextChildren) {
      return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
    }

    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function updateHostComponent(workInProgress) {
    const nextProps = workInProgress.pendingProps;
    const nextChildren = nextProps.children;
    markRef$1(workInProgress.alternate, workInProgress);
    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function updateFunctionComponent(workInProgress, Component, renderLane) {
    prepareToReadContext(workInProgress, renderLane);
    const nextChildren = renderWithHooks(workInProgress, Component, renderLane);
    const current = workInProgress.alternate;
    if (current != null && !didReceiveUpdate) {
      bailoutHook(workInProgress, renderLane);
      return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
    }
    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function updateContextProvider(workInProgress, renderLane) {
    const providerType = workInProgress.type;
    const context = providerType._context;
    const newProps = workInProgress.pendingProps;
    const oldProps = workInProgress.memoizedProps;
    const newValue = newProps.value;

    pushProvider(context, newProps.value);

    if (oldProps !== null) {
      const oldValue = oldProps.value;
      if (
        Object.is(oldValue, newValue) &&
        oldProps.children === newProps.children
      ) {
        return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
      } else {
        propagateContextChange(workInProgress, context, renderLane);
      }
    }

    const nextChildren = newProps.children;
    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function updateFragment(workInProgress) {
    const nextChildren = workInProgress.pendingProps;
    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
    const primaryChildProps = {
      mode: 'visible',
      children: primaryChildren
    };

    const primaryChildFragment = createFiberFromOffscreen(primaryChildProps);
    workInProgress.child = primaryChildFragment;
    primaryChildFragment.return = workInProgress;
    return primaryChildFragment;
  }

  function mountSuspenseFallbackChildren(
    workInProgress,
    primaryChildren,
    fallbackChildren
  ) {
    const primaryChildProps = {
      mode: 'hidden',
      children: primaryChildren
    };

    const primaryChildFragment = createFiberFromOffscreen(primaryChildProps);
    const fallbackChildFragment = createFiberFromFragment(fallbackChildren, null);

    fallbackChildFragment.flags |= Placement;

    primaryChildFragment.return = workInProgress;
    fallbackChildFragment.return = workInProgress;
    primaryChildFragment.sibling = fallbackChildFragment;
    workInProgress.child = primaryChildFragment;

    return fallbackChildFragment;
  }

  function updateSuspensePrimaryChildren(workInProgress, primaryChildren) {
    const current = workInProgress.alternate;
    const currentPrimaryChildFragment = current.child;
    const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;

    const primaryChildProps = {
      mode: 'visible',
      children: primaryChildren
    };

    const primaryChildFragment = createWorkInProgress(
      currentPrimaryChildFragment,
      primaryChildProps
    );

    primaryChildFragment.return = workInProgress;
    primaryChildFragment.sibling = null;
    workInProgress.child = primaryChildFragment;

    if (currentFallbackChildFragment != null) {
      const deletions = workInProgress.deletions;
      if (deletions == null) {
        workInProgress.deletions = [currentFallbackChildFragment];
        workInProgress.flags |= ChildDeletion;
      } else {
        deletions.push(currentFallbackChildFragment);
      }
    }

    return primaryChildFragment;
  }

  function updateSuspenseFallbackChildren(
    workInProgress,
    primaryChildren,
    fallbackChildren
  ) {
    const current = workInProgress.alternate;
    const currentPrimaryChildFragment = current.child;
    const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;

    const primaryChildProps = {
      mode: 'hidden',
      children: primaryChildren
    };

    const primaryChildFragment = createWorkInProgress(
      currentPrimaryChildFragment,
      primaryChildProps
    );
    let fallbackChildFragment;

    if (currentFallbackChildFragment !== null) {
      fallbackChildFragment = createWorkInProgress(
        currentFallbackChildFragment,
        fallbackChildren
      );
    } else {
      fallbackChildFragment = createFiberFromFragment(fallbackChildren, null);
      fallbackChildFragment.flags |= Placement;
    }

    fallbackChildFragment.return = workInProgress;
    primaryChildFragment.return = workInProgress;
    primaryChildFragment.sibling = fallbackChildFragment;
    workInProgress.child = primaryChildFragment;

    return fallbackChildFragment;
  }

  function updateSuspenseComponent(workInProgress) {
    const current = workInProgress.alternate;
    const nextProps = workInProgress.pendingProps;

    let showFallback = false;
    const didSuspend = (workInProgress.flags & DidCapture) !== NoFlags;

    if (didSuspend) {
      showFallback = true;
      workInProgress.flags &= ~DidCapture;
    }

    const nextPrimaryChildren = nextProps.children;
    const nextFallbackChildren = nextProps.fallback;

    pushSuspenseHandler(workInProgress);

    if (current == null) {
      if (showFallback) {
        return mountSuspenseFallbackChildren(
          workInProgress,
          nextPrimaryChildren,
          nextFallbackChildren
        );
      } else {
        return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
      }
    } else {
      if (showFallback) {
        return updateSuspenseFallbackChildren(
          workInProgress,
          nextPrimaryChildren,
          nextFallbackChildren
        );
      } else {
        return updateSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
      }
    }
  }

  function updateOffscreenComponent(workInProgress) {
    const nextProps = workInProgress.pendingProps;
    const nextChildren = nextProps.children;
    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function checkScheduledUpdateOrContext(current, renderLane) {
    const updateLanes = current.lanes;

    if (includeSomeLanes(updateLanes, renderLane)) {
      return true;
    }
    return false;
  }

  function bailoutOnAlreadyFinishedWork(workInProgress, renderLane) {
    if (!includeSomeLanes(workInProgress.childLanes, renderLane)) {
      console.log('bailout 整颗子树');
      return null;
    }

    console.log('bailout 当前 Fiber 子树');
    cloneChildFibers(workInProgress);
    return workInProgress.child;
  }

  function updateMemoComponent(workInProgress, renderLane) {
    /**
     * @description: 满足 bailout 四要素
     * 1. props 浅比较
     */
    const current = workInProgress.alternate;
    const nextProps = workInProgress.pendingProps;
    const Component = workInProgress.type.type;

    if (current != null) {
      const prevProps = current.memoizedProps;

      if (
        shallowEqual(prevProps, nextProps) &&
        current.ref === workInProgress.ref
      ) {
        didReceiveUpdate = false;
        workInProgress.pendingProps = prevProps;

        if (!checkScheduledUpdateOrContext(current, renderLane)) {
          workInProgress.lanes = current.lanes;
          return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
        }
      }
    }
    return updateFunctionComponent(workInProgress, Component, renderLane);
  }

  const beginWork = (workInProgress, renderLane) => {
    // bailout 策略
    didReceiveUpdate = false;
    const current = workInProgress.alternate;

    if (current != null) {
      const oldProps = current.memoizedProps;
      const newProps = workInProgress.pendingProps;
      if (oldProps !== newProps || current.type !== workInProgress.type) {
        didReceiveUpdate = true;
      } else {
        const hasScheduledStateOrContext = checkScheduledUpdateOrContext(
          current,
          renderLane
        );
        if (!hasScheduledStateOrContext) {
          didReceiveUpdate = false;

          switch (workInProgress.tag) {
            case ContextProvider:
              const newValue = workInProgress.memoizedProps.value;
              const context = workInProgress.type._context;
              pushProvider(context, newValue);
              break;
          }

          return bailoutOnAlreadyFinishedWork(workInProgress, renderLane);
        }
      }
    }

    workInProgress.lanes = NoLanes;

    switch (workInProgress.tag) {
      case HostRoot:
        return updateHostRoot(workInProgress, renderLane);
      case HostText:
        return null;
      case Fragment:
        return updateFragment(workInProgress);
      case HostComponent:
        return updateHostComponent(workInProgress);
      case FunctionComponent:
        return updateFunctionComponent(
          workInProgress,
          workInProgress.type,
          renderLane
        );
      case ContextProvider:
        return updateContextProvider(workInProgress, renderLane);
      case SuspenseComponent:
        return updateSuspenseComponent(workInProgress);
      case OffscreenComponent:
        return updateOffscreenComponent(workInProgress);
      case MemoComponent:
        return updateMemoComponent(workInProgress, renderLane);
      default:
        console.log('beginWork 未实现的类型');
        break;
    }
    return null;
  };

  function attachPingListener(root, wakeable, lane) {
    let pingCache = root.pingCache;
    let threadIDs;

    if (pingCache === null) {
      threadIDs = new Set();
      pingCache = root.pingCache = new WeakMap();
      pingCache.set(wakeable, threadIDs);
    } else {
      threadIDs = pingCache.get(wakeable);
      if (threadIDs == undefined) {
        threadIDs = new Set();
        pingCache.set(wakeable, threadIDs);
      }
    }

    if (!threadIDs.has(lane)) {
      threadIDs.add(lane);

      function ping() {
        if (pingCache !== null) {
          pingCache.delete(wakeable);
        }

        markRootPinged(root, lane);
        markRootUpdated(root, lane);
        ensureRootIsScheduled(root);
      }

      wakeable.then(ping, ping);
    }
  }

  function throwException(root, value, lane) {
    // Error Boundary
    // thenable
    if (
      value !== null &&
      typeof value === 'object' &&
      typeof value.then === 'function'
    ) {
      const wakeable = value;
      const suspenseBoundary = getSuspenseHandler();
      if (suspenseBoundary) {
        suspenseBoundary.flags |= ShouldCapture;
      }

      attachPingListener(root, wakeable, lane);
    }
  }

  const elementPropsKey = '__props';
  const validEventTypeList = ['click'];

  function updateFiberProps(node, props) {
    node[elementPropsKey] = props;
  }

  function getEventCallbackNameFromEventType(eventType) {
    return {
      click: ['onClickCapture', 'onClick']
    }[eventType];
  }

  function collectPaths(targetElement, container, eventType) {
    const paths = {
      bubble: [],
      capture: []
    };

    while (targetElement && targetElement != container) {
      const elementProps = targetElement[elementPropsKey];

      if (elementProps) {
        const callbackNameList = getEventCallbackNameFromEventType(eventType);
        if (callbackNameList) {
          callbackNameList.forEach((callbackName, i) => {
            const eventCallback = elementProps[callbackName];
            if (eventCallback) {
              if (i === 0) {
                paths.capture.unshift(eventCallback);
              } else {
                paths.bubble.push(eventCallback);
              }
            }
          });
        }
      }

      targetElement = targetElement.parentNode;
    }

    return paths;
  }

  function createSyntheticEvent(e) {
    const syntheticEvent = e;
    syntheticEvent.__stopPropagation = false;
    const originStopPropagation = e.stopPropagation;
    syntheticEvent.stopPropagation = () => {
      syntheticEvent.__stopPropagation = true;
      if (originStopPropagation) {
        originStopPropagation(e);
      }
    };

    return syntheticEvent;
  }

  function triggerEventFlow(paths, se) {
    for (let i = 0; i < paths.length; i++) {
      const callback = paths[i];

      schedulerExports.unstable_runWithPriority(eventTypeToSchedulerPriority(se.type), () => {
        callback.call(null, se);
      });

      if (se.__stopPropagation) {
        break;
      }
    }
  }

  /**
   * @description: dispatchEvent
   * @param {*} container
   * @param {*} eventType
   * @param {*} e
   * 1, 收集 targetDOM - containerDOM 之间所有的事件回调函数
   * 2. 构造合成事件
   * 3. 遍历 capture
   * 4. 遍历 bubble
   */
  function dispatchEvent(container, eventType, e) {
    const targetElement = e.target;
    if (targetElement == null) {
      console.log('事件不存在 target', e);
      return;
    }

    const { bubble, capture } = collectPaths(targetElement, container, eventType);
    const se = createSyntheticEvent(e);
    triggerEventFlow(capture, se);

    if (!se.__stopPropagation) {
      triggerEventFlow(bubble, se);
    }
  }

  function initEvent(container, eventType) {
    if (!validEventTypeList.includes(eventType)) {
      console.log('不支持的事件类型', eventType);
      return;
    }

    container.addEventListener(eventType, e => {
      dispatchEvent(container, eventType, e);
    });
  }

  function eventTypeToSchedulerPriority(eventType) {
    switch (eventType) {
      case 'click':
      case 'keydown':
      case 'keyup':
        return schedulerExports.unstable_ImmediatePriority;
      case 'scroll':
        return schedulerExports.unstable_UserBlockingPriority;
      default:
        return schedulerExports.unstable_NormalPriority;
    }
  }

  function createInstance(type, props) {
    const element = document.createElement(type);
    updateFiberProps(element, props);
    return element;
  }

  function appendInitialChild(parent, child) {
    parent.appendChild(child);
  }

  function createTextInstance(content) {
    return document.createTextNode(content);
  }

  function appendChildToContainer(parent, child) {
    parent.appendChild(child);
  }

  function commitUpdate(fiber) {
    switch (fiber.tag) {
      case HostText:
        const text = fiber.memoizedProps.content;
        return commitTextUpdate(fiber.stateNode, text);
      default:
        console.log('commitUpdate 未实现的类型');
        break;
    }
  }

  function commitTextUpdate(textInstance, content) {
    textInstance.textContent = content;
  }

  function removeChild(child, container) {
    container.removeChild(child);
  }

  function insertChildToContainer(child, container, before) {
    container.insertBefore(child, before);
  }

  const scheduleMicroTask =
    typeof queueMicrotask === 'function'
      ? queueMicrotask
      : typeof Promise === 'function'
      ? callback => Promise.resolve().then(callback)
      : setTimeout;

  function hideInstance(instance) {
    const style = instance.style;
    style.setProperty('display', 'none', 'important');
  }

  function unhideInstance(instance) {
    const style = instance.style;
    style.display = '';
  }

  function hideTextInstance(textInstance) {
    textInstance.nodeValue = '';
  }

  function unhideTextInstance(textInstance, text) {
    textInstance.nodeValue = text;
  }

  function markRef(fiber) {
    fiber.flags |= Ref;
  }

  function appendAllChildren(parent, workInProgress) {
    let node = workInProgress.child;

    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node?.stateNode);
      } else if (node.child != null) {
        node.child.return = node;
        node = node.child;
        continue;
      }

      if (node === workInProgress) {
        return;
      }

      while (node.sibling == null) {
        if (node.return == null || node.return == workInProgress) {
          return;
        }
        node = node.return;
      }

      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  /**
   * @description: completeWork 性能优化策略: 冒泡 Flags
   * @param {*} fiber
   * 作用: Flags 分布在不同的  fiberNode 中, 通过 CompleteWork 向上归并的过程, 将子 FiberNode 的 Flags 冒泡到父 FiberNode 中
   *
   */
  function bubbleProperties(workInProgress) {
    let subtreeFlags = NoFlags;
    let child = workInProgress.child;
    let newChildLanes = NoLanes;

    while (child != null) {
      subtreeFlags |= child.subtreeFlags;
      subtreeFlags |= child.flags;

      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes)
      );

      child.return = workInProgress;
      child = child.sibling;
    }

    workInProgress.subtreeFlags |= subtreeFlags;
    workInProgress.childLanes = newChildLanes;
  }

  function markUpdate(fiber) {
    fiber.flags |= Update;
  }

  const completeWork = workInProgress => {
    const newProps = workInProgress.pendingProps;
    const current = workInProgress.alternate;

    switch (workInProgress.tag) {
      case HostComponent:
        if (current != null && workInProgress.stateNode) {
          updateFiberProps(workInProgress.stateNode, newProps);

          if (current.ref !== workInProgress.ref) {
            markRef(workInProgress);
          }
        } else {
          const instance = createInstance(workInProgress.type, newProps);
          appendAllChildren(instance, workInProgress);
          workInProgress.stateNode = instance;

          if (workInProgress.ref !== null) {
            markRef(workInProgress);
          }
        }

        bubbleProperties(workInProgress);
        return null;
      case HostText:
        if (current != null && workInProgress.stateNode) {
          const oldText = current.memoizedProps.content;
          const newText = newProps.content;

          if (oldText !== newText) {
            markUpdate(workInProgress);
          }
        } else {
          const instance = createTextInstance(newProps.content);
          workInProgress.stateNode = instance;
        }
        bubbleProperties(workInProgress);
        return null;
      case HostRoot:
      case Fragment:
      case FunctionComponent:
        bubbleProperties(workInProgress);
        return null;
      case ContextProvider:
        const context = workInProgress.type._context;
        popProvider(context);
        bubbleProperties(workInProgress);
        return;
      case SuspenseComponent:
        popSuspenseHandler();
        const offscreenFiber = workInProgress.child;
        const isHidden = offscreenFiber.pendingProps.mode === 'hidden';
        const currentOffscreenFiber = offscreenFiber.alternate;
        if (currentOffscreenFiber != null) {
          const wasHidden = currentOffscreenFiber.pendingProps.mode === 'hidden';
          if (isHidden !== wasHidden) {
            offscreenFiber.flags |= Visibility;
            bubbleProperties(offscreenFiber);
          }
        } else if (isHidden) {
          offscreenFiber.flags |= Visibility;
          bubbleProperties(offscreenFiber);
        }
        bubbleProperties(workInProgress);
        return;
      case OffscreenComponent:
        bubbleProperties(workInProgress);
        return;
      case MemoComponent:
        bubbleProperties(workInProgress);
        return;
      default:
        console.log('completeWork 未实现的类型');
        break;
    }
  };

  function unwindWork(workInProgress) {
    const flags = workInProgress.flags;

    switch (workInProgress.tag) {
      case SuspenseComponent:
        popSuspenseHandler();

        if (
          (flags & ShouldCapture) !== NoFlags &&
          (flags & DidCapture) === NoFlags
        ) {
          workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
          return workInProgress;
        }
        break;
      case ContextProvider:
        const context = workInProgress.type._context;
        popProvider(context);
        return null;
      default:
        return null;
    }

    return null;
  }

  let syncQueue = [];
  let isFlushingSyncQueue = false;

  function scheduleSyncCallback(callback) {
    if (syncQueue === null) {
      syncQueue = [callback];
    } else {
      syncQueue.push(callback);
    }
  }

  function flushSyncCallbacks() {
    if (!isFlushingSyncQueue && syncQueue) {
      isFlushingSyncQueue = true;
      try {
        syncQueue.forEach(callback => callback());
      } catch (error) {
      } finally {
        syncQueue = null;
        isFlushingSyncQueue = false;
      }
    }
  }

  let nextEffect = null;

  function getHostParent(fiber) {
    let parent = fiber.return;

    while (parent) {
      const parentTag = parent.tag;

      if (parentTag === HostComponent) {
        return parent.stateNode;
      }

      if (parentTag === HostRoot) {
        return parent.stateNode.container;
      }
      parent = parent.return;
    }

    console.log('getHostParent 找不到父节点');
  }

  function getHostSibling(fiber) {
    let node = fiber;
    findSibling: while (true) {
      while (node.sibling == null) {
        const parent = node.return;
        if (
          parent == null ||
          parent.tag === HostComponent ||
          parent.tag === HostRoot
        ) {
          return null;
        }
        node = parent;
      }

      node.sibling.return = node.return;
      node = node.sibling;

      while (node.tag !== HostText && node.tag !== HostComponent) {
        if ((node.flags & Placement) !== NoFlags) {
          continue findSibling;
        }
        if (node.child == null) {
          continue findSibling;
        } else {
          node.child.return = node;
          node = node.child;
        }
      }

      if ((node.flags & Placement) === NoFlags) {
        return node.stateNode;
      }
    }
  }

  function insertOrAppendPlacementNodeIntoContainer(
    finishedWork,
    hostParent,
    before
  ) {
    if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
      if (before) {
        insertChildToContainer(finishedWork.stateNode, hostParent, before);
      } else {
        appendChildToContainer(hostParent, finishedWork.stateNode);
      }
      return;
    }

    const child = finishedWork.child;
    if (child != null) {
      insertOrAppendPlacementNodeIntoContainer(child, hostParent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, hostParent);
        sibling = sibling.sibling;
      }
    }
  }

  function commitPlacement(finishedWork) {
    const hostParent = getHostParent(finishedWork);
    const sibling = getHostSibling(finishedWork);

    if (hostParent != null) {
      insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
    }
  }

  function commitNestedComponent(root, onCommitUnmount) {
    let node = root;
    while (true) {
      onCommitUnmount(node);

      if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }

      if (node === root) {
        return;
      }

      while (node.sibling === null) {
        if (node.return === null || node.return === root) {
          return;
        }
        node = node.return;
      }

      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  function recordHostChildrenToDelete(childrenToDelete, unmountFiber) {
    let lastOne = childrenToDelete[childrenToDelete.length - 1];
    if (!lastOne) {
      childrenToDelete.push(unmountFiber);
    } else {
      let node = lastOne.sibling;
      while (node != null) {
        if (unmountFiber === node) {
          childrenToDelete.push(unmountFiber);
        }
        node = node.sibling;
      }
    }
  }

  /**
   * @description: 删除子节点
   * @param {*} childToDelete
   * 逻辑: 删除子节点, 其实就是删除子节点及其后代节点, 也就是删除子树
   * 1. 对于 FunctionComponent 节点: 需要处理 useEffect unmount 、解绑 ref 、移除根 DOM
   * 2. 对于 HostComponent 节点: 需要解绑 ref 、 移除 DOM
   */
  function commitDeletion(childToDelete, root) {
    const rootChildrenToDelete = [];

    commitNestedComponent(childToDelete, unmountFiber => {
      switch (unmountFiber.tag) {
        case HostComponent:
          recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber);
          safelyDetachRef(unmountFiber);
          return;
        case HostText:
          recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber);
          return;
        case FunctionComponent:
          commitPassiveEffect(unmountFiber, root, 'unmount');
          return;
        default:
          console.log('commitDeletion 未实现的类型');
          break;
      }
    });

    if (rootChildrenToDelete.length) {
      const hostParent = getHostParent(childToDelete);

      if (hostParent != null) {
        rootChildrenToDelete.forEach(node => {
          removeChild(node.stateNode, hostParent);
        });
      }
    }

    childToDelete.return = null;
    childToDelete.child = null;
  }

  function commitPassiveEffect(fiber, root, type) {
    if (
      fiber.tag !== FunctionComponent ||
      (type === 'update' && (fiber.flags & PassiveEffect) === NoFlags)
    ) {
      return;
    }

    const updateQueue = fiber.updateQueue;
    if (updateQueue !== null) {
      if (updateQueue.lastEffect == null) {
        console.log(
          '当 FunctionComponent 存在 PassiveEffect Flag 时, 不应该不存在 lastEffect'
        );
      }
      root.pendingPassiveEffects[type].push(updateQueue.lastEffect);
    }
  }

  function safelyAttachRef(fiber) {
    const ref = fiber.ref;

    if (ref !== null) {
      const instance = fiber.stateNode;
      if (typeof ref === 'function') {
        ref(instance);
      } else {
        ref.current = instance;
      }
    }
  }

  function safelyDetachRef(current) {
    const ref = current.ref;
    if (ref !== null) {
      if (typeof ref === 'function') {
        ref(null);
      } else {
        ref.current = null;
      }
    }
  }

  function findHostSubtreeRoot(finishedWork, callback) {
    let node = finishedWork;
    let hostSubtreeRoot = null;

    while (true) {
      if (node.tag === HostComponent) {
        if (hostSubtreeRoot === null) {
          hostSubtreeRoot = node;
          callback(node);
        }
      } else if (node.tag === HostText) {
        if (hostSubtreeRoot === null) {
          callback(node);
        }
      } else if (
        node.tag === OffscreenComponent &&
        node.pendingProps.mode === 'hidden' &&
        node !== finishedWork
      ) ; else if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }

      if (node === finishedWork) {
        return;
      }

      while (node.sibling === null) {
        if (node.return === null || node.return === finishedWork) {
          return;
        }

        if (hostSubtreeRoot === node) {
          hostSubtreeRoot = null;
        }

        node = node.return;
      }

      if (hostSubtreeRoot === node) {
        hostSubtreeRoot = null;
      }

      node.sibling.return = node.return;
      node = node.sibling;
    }
  }

  function hideOrUnhideAllChildren(finishedWork, isHidden) {
    findHostSubtreeRoot(finishedWork, hostRoot => {
      const instance = hostRoot.stateNode;
      if (hostRoot.tag === HostComponent) {
        isHidden ? hideInstance(instance) : unhideInstance(instance);
      } else if (hostRoot.tag === HostText) {
        isHidden
          ? hideTextInstance(instance)
          : unhideTextInstance(instance, hostRoot.memoizedProps.content);
      }
    });
  }

  function commitMutationEffectsOnFiber(finishedWork, root) {
    const { tag, flags } = finishedWork;

    if ((flags & Placement) !== NoFlags) {
      commitPlacement(finishedWork);
      finishedWork.flags &= ~Placement;
    }

    if ((flags & ChildDeletion) !== NoFlags) {
      const deletions = finishedWork.deletions;
      if (deletions != null) {
        deletions.forEach(childToDelete => {
          commitDeletion(childToDelete, root);
        });
      }
      finishedWork.flags &= ~ChildDeletion;
    }

    if ((flags & Update) !== NoFlags) {
      commitUpdate(finishedWork);
      finishedWork.flags &= ~Update;
    }

    if ((flags & PassiveEffect) !== NoFlags) {
      commitPassiveEffect(finishedWork, root, 'update');
      finishedWork.flags &= ~PassiveEffect;
    }

    if ((flags & Ref) !== NoFlags && tag === HostComponent) {
      safelyDetachRef(finishedWork);
    }

    if ((flags & Visibility) !== NoFlags && tag === OffscreenComponent) {
      const isHidden = finishedWork.pendingProps.mode === 'hidden';
      hideOrUnhideAllChildren(finishedWork, isHidden);
      finishedWork.flags &= ~Visibility;
    }
  }

  function commitLayoutEffectsOnFiber(finishedWork) {
    const { tag, flags } = finishedWork;

    if ((flags & Ref) !== NoFlags && tag === HostComponent) {
      safelyAttachRef(finishedWork);
      finishedWork.flags &= ~Ref;
    }
  }

  function commitEffects(phrase, mask, callback) {
    return (finishedWork, root) => {
      nextEffect = finishedWork;

      while (nextEffect !== null) {
        const child = nextEffect.child;
        if ((nextEffect.subtreeFlags & mask) !== NoFlags && child !== null) {
          nextEffect = child;
        } else {
          up: while (nextEffect !== null) {
            callback(nextEffect, root);
            const sibling = nextEffect.sibling;

            if (sibling !== null) {
              nextEffect = sibling;
              break up; // 终止掉 up while 循环
            }

            nextEffect = nextEffect.return;
          }
        }
      }
    };
  }

  const commitMutationEffects = commitEffects(
    'mutation',
    MutationMask | PassiveMask,
    commitMutationEffectsOnFiber
  );

  const commitLayoutEffects = commitEffects(
    'layout',
    LayoutMask,
    commitLayoutEffectsOnFiber
  );

  function commitHookEffectList(flags, lastEffect, callback) {
    let effect = lastEffect.next;

    do {
      if ((effect.tag & flags) === flags) {
        callback(effect);
      }
      effect = effect.next;
    } while (effect != lastEffect.next);
  }

  function commitHookEffectListUnmount(flags, lastEffect) {
    commitHookEffectList(flags, lastEffect, effect => {
      const destroy = effect.destroy;
      if (typeof destroy === 'function') {
        destroy();
      }
      effect.tag &= ~HookHasEffect;
    });
  }

  function commitHookEffectListDestroy(flags, lastEffect) {
    commitHookEffectList(flags, lastEffect, effect => {
      const destroy = effect.destroy;
      if (typeof destroy === 'function') {
        destroy();
      }
    });
  }

  function commitHookEffectListCreate(flags, lastEffect) {
    commitHookEffectList(flags, lastEffect, effect => {
      const create = effect.create;
      if (typeof create === 'function') {
        effect.destroy = create();
      }
    });
  }

  let workInProgress = null;
  let rootDoesHasPassiveEffects = false;
  let workInProgressRootRenderLane = NoLane$1;

  const NotSuspended = 0;
  const SuspendedOnData = 1;

  let workInProgressThrownValue = null;
  let workInProgressSuspendedReason = NotSuspended;

  const RootInProgress = 0;
  const RootInComplete = 1;
  const RootCompleted = 2;
  const RootDidNotComplete = 3;
  let workInProgressRootExitStatus = RootInProgress;

  function prepareFreshStack(root, lane) {
    root.finishedWork = null;
    root.finishedLane = NoLane$1;
    workInProgressRootRenderLane = lane;
    workInProgress = createWorkInProgress(root.current, {});

    workInProgressRootExitStatus = RootInProgress;
    workInProgressSuspendedReason = NotSuspended;
    workInProgressThrownValue = null;
  }

  function completeUnitOfWork(fiber) {
    let node = fiber;
    do {
      completeWork(node);

      const sibling = node.sibling;
      if (sibling) {
        workInProgress = sibling;
        return;
      }
      node = node.return;
      workInProgress = node;
    } while (node !== null);
  }

  function performUnitOfWork(fiber) {
    const next = beginWork(fiber, workInProgressRootRenderLane);
    fiber.memoizedProps = fiber.pendingProps;

    if (next === null) {
      completeUnitOfWork(fiber);
    } else {
      workInProgress = next;
    }
  }

  function flushPassiveEffects(pendingPassiveEffects) {
    let didFlushPassiveEffect = false;

    pendingPassiveEffects.unmount.forEach(effect => {
      didFlushPassiveEffect = true;
      commitHookEffectListUnmount(Passive, effect);
    });
    pendingPassiveEffects.unmount = [];
    pendingPassiveEffects.update.forEach(effect => {
      didFlushPassiveEffect = true;
      commitHookEffectListDestroy(Passive | HookHasEffect, effect);
    });
    pendingPassiveEffects.update.forEach(effect => {
      didFlushPassiveEffect = true;
      commitHookEffectListCreate(Passive | HookHasEffect, effect);
    });
    pendingPassiveEffects.update = [];
    flushSyncCallbacks();
    return didFlushPassiveEffect;
  }

  function commitRoot(root) {
    const finishedWork = root.finishedWork;

    if (finishedWork == null) {
      return;
    }

    const lane = root.finishedLane;

    if (lane === NoLane$1) {
      console.log('commitRoot root.finishedLane 不应该是 NoLane');
    }

    root.finishedWork = null;
    root.finishedLane = NoLane$1;
    markRootFinished(root, lane);

    if (
      (finishedWork.flags & PassiveMask) !== NoFlags ||
      (finishedWork.subtreeFlags & PassiveMask) !== NoFlags
    ) {
      if (!rootDoesHasPassiveEffects) {
        rootDoesHasPassiveEffects = true;
        schedulerExports.unstable_scheduleCallback(schedulerExports.unstable_NormalPriority, () => {
          flushPassiveEffects(root.pendingPassiveEffects);
          return;
        });
      }
    }
    /**
     * @description: 判断是否存在三个子阶段需要执行的操作
     */
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
    const subtreeHasEffects =
      (finishedWork.subtreeFlags & MutationMask) !== NoFlags;

    if (rootHasEffect || subtreeHasEffects) {
      commitMutationEffects(finishedWork, root);
      root.current = finishedWork;
      commitLayoutEffects(finishedWork, root);
    } else {
      root.current = finishedWork;
    }

    rootDoesHasPassiveEffects = false;
    ensureRootIsScheduled(root);
  }

  function unwindUnitOfWork(unitOfWork) {
    let incompleteWork = unitOfWork;

    do {
      const next = unwindWork(incompleteWork);
      if (next !== null) {
        workInProgress = next;
        return;
      }

      const returnFiber = incompleteWork.return;
      if (returnFiber != null) {
        returnFiber.deletions = null;
      }

      incompleteWork = returnFiber;
    } while (incompleteWork !== null);

    workInProgress = null;
    workInProgressRootExitStatus = RootDidNotComplete;
  }

  function workLoopSync() {
    while (workInProgress != null) {
      performUnitOfWork(workInProgress);
    }
  }

  function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, lane) {
    // 1. 重置 FunctionComponent 的全局变量
    resetHooksOnUnwind();
    // 2. use 请求返回后重新触发更新 / ErrorBoundary 捕获错误
    throwException(root, thrownValue, lane);
    // 3. unwind 流程
    unwindUnitOfWork(unitOfWork);
  }

  function handleThrow(root, thrownValue) {
    if (thrownValue === SuspenseException) {
      thrownValue = getSuspenseThenable();
      workInProgressSuspendedReason = SuspendedOnData;
    }

    workInProgressThrownValue = thrownValue;
  }

  function workLoopConcurrent() {
    while (workInProgress != null && !schedulerExports.unstable_shouldYield()) {
      performUnitOfWork(workInProgress);
    }
  }

  /**
   * @description: 防止进入死循环
   */
  let retries = 0;

  function renderRoot(root, lane, shouldTimesSlice) {
    if (workInProgressRootRenderLane !== lane) {
      prepareFreshStack(root, lane);
    }

    do {
      try {
        if (
          workInProgressSuspendedReason !== NotSuspended &&
          workInProgress !== null
        ) {
          const thrownValue = workInProgressThrownValue;
          workInProgressSuspendedReason = NotSuspended;
          workInProgressThrownValue = null;
          throwAndUnwindWorkLoop(root, workInProgress, thrownValue, lane);
        }

        shouldTimesSlice ? workLoopConcurrent() : workLoopSync();
        break;
      } catch (e) {
        console.log('workLoop renderRoot 发生错误', e);

        retries++;

        if (retries > 20) {
          console.log('此时已经进入死循环，不再执行 workLoop');
          break;
        }

        handleThrow(root, e);
      }
    } while (true);

    if (workInProgressRootExitStatus !== RootInProgress) {
      return workInProgressRootExitStatus;
    }

    if (shouldTimesSlice && workInProgress !== null) {
      return RootInComplete;
    }

    if (!shouldTimesSlice && workInProgress !== null) {
      console.log('renderRoot 结束之后 workInProgress 不应该存在');
    }

    return RootCompleted;
  }

  /**
   * @description: 并发更新
   */
  function performConcurrentWorkOnRoot(root, didTimeout) {
    const currentCallback = root.callbackNode;
    const didFlushPassiveEffect = flushPassiveEffects(root.pendingPassiveEffects);

    if (didFlushPassiveEffect) {
      if (root.callbackNode !== currentCallback) {
        return null;
      }
    }

    const lane = getNextLane(root);
    const currentCallbackNode = root.callbackNode;

    if (lane === NoLane$1) {
      return null;
    }
    const needSync = lane === SyncLane || didTimeout;
    const exitStatus = renderRoot(root, lane, !needSync);

    switch (exitStatus) {
      case RootInComplete:
        if (root.callbackNode !== currentCallbackNode) {
          return null;
        }
        return performConcurrentWorkOnRoot.bind(null, root);
      case RootCompleted:
        const finishedWork = root.current.alternate;
        root.finishedWork = finishedWork;
        root.finishedLane = lane;
        workInProgressRootRenderLane = NoLane$1;
        commitRoot(root);
        break;
      case RootDidNotComplete:
        workInProgressRootRenderLane = NoLane$1;
        markRootSuspended(root, lane);
        ensureRootIsScheduled(root);
        break;
      default:
        console.log('performConcurrentWorkOnRoot 未实现的逻辑');
        break;
    }
  }

  /**
   * @description: 同步更新
   * @param {*} root
   * @param {*} lane
   */
  function performSyncWorkOnRoot(root) {
    const nextLane = getNextLane(root);

    if (nextLane !== SyncLane) {
      ensureRootIsScheduled(root);
      return;
    }

    const exitStatus = renderRoot(root, nextLane, false);

    switch (exitStatus) {
      case RootCompleted:
        const finishedWork = root.current.alternate;
        root.finishedWork = finishedWork;
        root.finishedLane = nextLane;
        workInProgressRootRenderLane = NoLane$1;
        commitRoot(root);
        break;
      case RootDidNotComplete:
        workInProgressRootRenderLane = NoLane$1;
        markRootSuspended(root, nextLane);
        ensureRootIsScheduled(root);
        break;
      default:
        console.log('performSyncWorkOnRoot 未实现的逻辑');
        break;
    }
  }

  function markUpdateLaneFromFiberToRoot(fiber, lane) {
    let node = fiber;
    let parent = node.return;
    while (parent !== null) {
      parent.childLanes = mergeLanes(parent.childLanes, lane);
      const alternate = parent.alternate;
      if (alternate != null) {
        alternate.childLanes = mergeLanes(alternate.childLanes, lane);
      }

      node = parent;
      parent = node.return;
    }

    if (node.tag === HostRoot) {
      return node.stateNode;
    }

    return null;
  }

  function markRootUpdated(root, lane) {
    root.pendingLanes = mergeLanes(root.pendingLanes, lane);
  }

  function ensureRootIsScheduled(root) {
    const updateLane = getNextLane(root);
    const existingCallback = root.callbackNode;

    if (updateLane === NoLane$1) {
      if (existingCallback !== null) {
        schedulerExports.unstable_cancelCallback(existingCallback);
      }
      root.callbackNode = null;
      root.callbackPriority = NoLane$1;
      return;
    }

    const currentPriority = updateLane;
    const prevPriority = root.callbackPriority;

    if (currentPriority === prevPriority) {
      return;
    }

    if (existingCallback !== null) {
      schedulerExports.unstable_cancelCallback(existingCallback);
    }

    let newCallbackNode = null;

    if (updateLane === SyncLane) {
      // 同步优先级 用微任务调度
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
      scheduleMicroTask(flushSyncCallbacks);
    } else {
      // 异步优先级 用宏任务调度
      const schedulerPriority = lanesToSchedulerPriority(updateLane);
      newCallbackNode = schedulerExports.unstable_scheduleCallback(
        schedulerPriority,
        performConcurrentWorkOnRoot.bind(null, root)
      );
    }

    root.callbackNode = newCallbackNode;
    root.callbackPriority = currentPriority;
  }

  function scheduleUpdateOnFiber(fiber, lane) {
    const root = markUpdateLaneFromFiberToRoot(fiber);
    markRootUpdated(root, lane);
    ensureRootIsScheduled(root);
  }

  function createContainer(container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null);
    const root = new FiberRootNode(container, hostRootFiber);
    hostRootFiber.updateQueue = createUpdateQueue();
    return root;
  }

  function updateContainer(element, root) {
    schedulerExports.unstable_runWithPriority(schedulerExports.unstable_ImmediatePriority, () => {
      const hostRootFiber = root.current;
      const lane = requestUpdateLane();
      const update = createUpdate(element, lane);
      enqueueUpdate(hostRootFiber.updateQueue, update, hostRootFiber, lane);
      scheduleUpdateOnFiber(hostRootFiber, lane);
    });
    return element;
  }

  function createRoot(container) {
    const root = createContainer(container);

    return {
      render(element) {
        initEvent(container, 'click');
        return updateContainer(element, root);
      }
    };
  }

  var root = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createRoot: createRoot
  });

  exports.React = index;
  exports.ReactDOM = root;

  return exports;

})({});
//# sourceMappingURL=react.iife.js.map
