const REG_LINE_CUT = /\r?\n/;
const REG_TIME_S = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
const REG_TIME = /^(\d{2}:\d{2}:\d{2},\d{3})[\s->]+(\d{2}:\d{2}:\d{2},\d{3})$/;

function getSubtitleContent(url) {
  return fetch(url)
    .then(response => {
      return response.text();
    })
    .catch(error => {
      return '';
    });
}

function parseDuration(str) {
  try {
    if (REG_TIME_S.test(str)) {
      return (
        Number(RegExp.$1) * 60 * 60 * 1000 +
        Number(RegExp.$2) * 60 * 1000 +
        Number(RegExp.$3) * 1000 +
        Number(RegExp.$4)
      );
    }
  } catch (err) {
    return 0;
  }
}

function parseSubtitleContent(content) {
  try {
    const sourceLines = content.split(REG_LINE_CUT);
    const subtitleData = [];
    let index,
      tmpIndex,
      time,
      txt = [],
      i = 0;
    while (i < sourceLines.length) {
      const cline = sourceLines[i].replace(/^\s+|\s+$/g, '');
      i++;
      // 空内容
      if (!cline) {
        continue;
      }

      // 数字
      if (/^\d+$/.test(cline)) {
        if (tmpIndex) {
          // 上一行也是数字，则并入txt
          txt.push(tmpIndex);
          tmpIndex = '';
        }
        tmpIndex = Number(cline);
        continue;
      }

      // 时间段范围
      if (REG_TIME.test(cline)) {
        const startStr = RegExp.$1;
        const endStr = RegExp.$2;
        // push上一条字幕数据
        if (time) {
          subtitleData.push({
            index,
            ...time,
            content: txt.join('\n')
          });
        }
        // 新的一条字幕数据
        index = tmpIndex;
        tmpIndex = '';
        txt = [];
        time = {
          start: parseDuration(startStr),
          startStr,
          end: parseDuration(endStr),
          endStr
        };
        continue;
      }

      if (tmpIndex) {
        // 上一行是数字，切不满足上面条件，认为是内容，并入txt
        txt.push(tmpIndex);
        tmpIndex = '';
      }
      txt.push(cline);
    }
    // 处理最后一条
    if (time) {
      // 最后一行字幕内容可能是数字的情况
      if (tmpIndex) {
        txt.push(tmpIndex);
      }
      subtitleData.push({
        index,
        ...time,
        content: txt.join('\n')
      });
    }
    return subtitleData;
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function transformSrtToVtt(content) {
  const vttstr = ('WEBVTT\r\n\r\n' + content)
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
    .replace(/\r?\n\d+\r?\n/g, '\r\n');

  const blob = new Blob([vttstr], { type: 'text/vtt' });
  return URL.createObjectURL(blob);
  const fileReader = new FileReader();

  // return new Promise((resolve, reject) => {
  //   fileReader.onload = e => {
  //     resolve(e.target.result);
  //   };
  //   fileReader.readAsDataURL(blob);
  //   fileReader.onerror = () => {
  //     reject(new Error('blobToBase64 error'));
  //   };
  // });
}

const url = 'http://127.0.0.1:5502/test/html/subtitle/Simplified Chinese.srt';

async function run() {
  const content = await getSubtitleContent(url);
  const vtt = await transformSrtToVtt(content);
  console.log('vtt', vtt);
}

run();

const str = '这是一个很寂寞的天，下着有些伤心的雨！';
const blob = new Blob([str], {
  type: 'text/plain'
});

const blobUrl = URL.createObjectURL(blob);
console.log("blobUrl",blobUrl)
// const fileReader = new FileReader();

// fileReader.onload = e => {
//   console.log("e.target.result",e.target.result)
// };
// fileReader.readAsDataURL(blob);
// fileReader.onerror = () => {
//   console.log("错误")
// };
