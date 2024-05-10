import {
  chromeRegex,
  CHROME_PRIORITY,
  chromeEvalRegex,
  UNKNOWN_FUNCTION,
} from "../const/index.js";
import { createStackParser } from "../utils/stacktrace.js";

const extractSafariExtensionDetails = (func, filename) => {
  const isSafariExtension = func.indexOf("safari-extension") !== -1;
  const isSafariWebExtension = func.indexOf("safari-web-extension") !== -1;

  return isSafariExtension || isSafariWebExtension
    ? [
        func.indexOf("@") !== -1 ? func.split("@")[0] : UNKNOWN_FUNCTION,
        isSafariExtension
          ? `safari-extension:${filename}`
          : `safari-web-extension:${filename}`,
      ]
    : [func, filename];
};

function createFrame(filename, func, lineno, colno) {
  const frame = {
    filename,
    in_app: true,
    function: func === "<anonymous>" ? UNKNOWN_FUNCTION : func,
  };

  if (lineno !== undefined) {
    frame.lineno = lineno;
  }

  if (colno !== undefined) {
    frame.colno = colno;
  }

  return frame;
}

const chromeStackParserFn = (line) => {
  const parts = chromeRegex.exec(line);

  if (parts) {
    const isEval = parts[2] && parts[2].indexOf("eval") === 0;

    if (isEval) {
      const subMatch = chromeEvalRegex.exec(parts[2]);

      if (subMatch) {
        parts[2] = subMatch[1]; // url
        parts[3] = subMatch[2]; // line
        parts[4] = subMatch[3]; // column
      }
    }

    const [func, filename] = extractSafariExtensionDetails(
      parts[1] || UNKNOWN_FUNCTION,
      parts[2]
    );

    return createFrame(
      filename,
      func,
      parts[3] ? +parts[3] : undefined,
      parts[4] ? +parts[4] : undefined
    );
  }

  return;
};

export const chromeStackLineParser = [CHROME_PRIORITY, chromeStackParserFn];
export const defaultStackLineParsers = [chromeStackLineParser];
export const defaultStackParser = createStackParser(...defaultStackLineParsers);
