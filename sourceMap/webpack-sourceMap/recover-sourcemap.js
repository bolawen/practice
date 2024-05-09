const Fs = require("fs");
const { SourceMapConsumer } = require("source-map");

function recoverSourceMap(options) {
  return new Promise((resolve, reject) => {
    const { type, sourcemapData, compressedLine, compressedColumn } = options;
    const sourcemapConsumer = new SourceMapConsumer(sourcemapData, null, type);
    sourcemapConsumer.then((consumer) => {
      const originalPosition = consumer.originalPositionFor({
        line: compressedLine,
        column: compressedColumn,
      });

      const {
        source,
        line: originalLine,
        column: originalColumn,
      } = originalPosition;

      if (source) {
        const sourceContent = consumer.sourceContentFor(source);
        if (sourceContent) {
          const lines = sourceContent.split("\n");
          const codeLine = lines[originalPosition.line - 1];
          resolve({
            status: "success",
            message: "成功还原代码",
            sourceCodeInfo: {
              source,
              originalLine,
              originalColumn,
              codeLine,
            },
          });
        }
      } else {
        reject({ status: "failed", message: "无法找到原始源文件位置。" });
      }
    });
  });
}

async function run() {
  const sourcemapData = Fs.readFileSync(
    "./build/main-6910fe9c709975f8f52b.js.map"
  ).toString();
  const result = await recoverSourceMap({
    sourcemapData,
    type: "webpack://parse-sourcemap/",
    compressedLine: Number(1), // 混肴代码报错 row
    compressedColumn: Number(123), // 混肴代码报错 col
  });

  if (!result.sourceCodeInfo) {
    return;
  }
  const { source, codeLine, originalLine } = result.sourceCodeInfo;

  console.log(`压缩后代码位置：行 1，列 123`);
  console.log(`原始源文件：${source}`);
  console.log(`原始源文件行号：${originalLine}`);
  console.log("出问题代码行 -> Code line:", codeLine);
}

run();
