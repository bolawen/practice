import {
  WEBPACK_ERROR_REGEXP,
  STACKTRACE_FRAME_LIMIT,
} from "../const/index.js";

export function createStackParser(...parsers) {
  const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);

  return (stack, skipFirstLines, framesToPop) => {
    const frames = [];

    const lines = stack.split("\n");
    console.log("lines", lines);

    for (let i = skipFirstLines; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 1024) {
        continue;
      }

      const cleanedLine = WEBPACK_ERROR_REGEXP.test(line)
        ? line.replace(WEBPACK_ERROR_REGEXP, "$1")
        : line;

      if (cleanedLine.match(/\S*Error: /)) {
        continue;
      }

      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);

        if (frame) {
          frames.push(frame);
          break;
        }
      }

      if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
        break;
      }
    }

    return stripSentryFramesAndReverse(frames.slice(framesToPop));
  };
}
