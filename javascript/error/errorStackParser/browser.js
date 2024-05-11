const UNKNOWN_FUNCTION = "?";
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;

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

function chromeErrorStackParser(line) {
  const chromeRegex =
    /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;

  const parts = chromeRegex.exec(line);

  if (!parts) {
    return;
  }

  const isEval = parts[2] && parts[2].indexOf("eval") === 0; // start of line

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

function createStackParser(parsers) {
  return (stack) => {
    const frames = [];
    const lines = stack.split("\n");

    for (let i = 0; i < lines.length; i++) {
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

      for (const parser of parsers) {
        const frame = parser(cleanedLine);

        if (frame) {
          frames.push(frame);
          break;
        }
      }
    }

    return frames;
  };
}

const parser = createStackParser([chromeErrorStackParser]);

window.onerror = function (message, source, lineno, colno, error) {
    const frames = parser(error.stack);
    console.log('errorStackParser.parse', frames);
};

window.addEventListener('error', function (event) {
    const frames = parser(event.error.stack);
    console.log('errorStackParser.parse', frames);
});
