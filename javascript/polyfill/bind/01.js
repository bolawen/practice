Function.prototype.bind = function (thisArg, ...argArrayOut) {
  const fn = this;

  if (thisArg) {
    thisArg = Object(thisArg);
  } else {
    thisArg = typeof window === "undefined" ? global : window;
  }

  return function (...argArrayIn) {
    thisArg.__fn__ = fn;
    const finalArgus = [...argArrayOut, ...argArrayIn];
    const result = thisArg.__fn__(...finalArgus);
    delete thisArg.__fn__;
    return result;
  };
};
