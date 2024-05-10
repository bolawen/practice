export const OPERA10_PRIORITY = 10;
export const OPERA11_PRIORITY = 20;
export const CHROME_PRIORITY = 30;
export const WINJS_PRIORITY = 40;
export const GECKO_PRIORITY = 50;

export const UNKNOWN_FUNCTION = "?";
export const STACKTRACE_FRAME_LIMIT = 50;
export const reactMinifiedRegexp = /Minified React error #\d+;/i;

export const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;

export const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;

export const chromeRegex =
  /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
