import {
  SOUND_COLOR,
  SCALE_RATIO,
  EYE_GROUP_LEN,
  CANVAS_PALETTE,
} from './constant';

export const noop = () => null;

export const isInTouchableDevice = 'ontouchend' in document.documentElement;

function makeId(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function formatTime(timeInSeconds) {
  const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  return {
    hours: result.substr(0, 2),
    minutes: result.substr(3, 2),
    seconds: result.substr(6, 2)
  };
}

/**
 * @description: rms转换为分贝计算公式
 * @param {*} gain
 */
export function rmsToDb(gain) {
  return 20 * Math.log10(gain);
}

export function to16BitPCM(input) {
  const dataLength = input.length * (16 / 8);
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  let offset = 0;
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return dataView;
}

export function getVolumeShownPercent(dbValue) {
  const minDb = -80;

  if (dbValue < minDb) {
    return 0;
  } else if (dbValue > 1) {
    return 1;
  }

  const volumePercent = (Math.abs(minDb) - Math.abs(dbValue)) / Math.abs(minDb);

  return volumePercent;
}

export function addKeywordHighlight(oText, keyWords) {
  let returnVal = oText;
  const sortedKeywords = keyWords.sort(compareWordLength);

  for (let i = 0; i < sortedKeywords.length; i++) {
    const keyword = sortedKeywords[i];
    if (keyword !== '') {
      const regExp = new RegExp(`(≤*)${keyword}(≥*)`, 'g');
      returnVal = returnVal.replace(regExp, `≤${keyword}≥`);
    }
  }
  returnVal = returnVal
    .replace(/≤/g, '<span class="highlight">')
    .replace(/≥/g, '</span>');
  return returnVal;
}

export function getColor(sound) {
  if (sound > 0.9 || sound < 0.3) {
    return SOUND_COLOR.worst;
  }
  if (sound > 0.6 || sound < 0.4) {
    return SOUND_COLOR.better;
  }
  return SOUND_COLOR.best;
}

/**
 * 绘制音量Canvas动画
 * @param audioCtx 音量画布
 * @param xEndPos 音量值转换为的进度长度
 */
export function drawSoundValueCanvas(audioCtx, xEndPos, sound) {
  audioCtx.lineWidth = 20;

  const gradient = audioCtx.createLinearGradient(0, 0, xEndPos, 0);
  const color = getColor(sound);

  gradient.addColorStop(0, color);
  gradient.addColorStop(0.8, `${color}88`);
  gradient.addColorStop(1, `${color}00`);

  audioCtx.beginPath();
  audioCtx.moveTo(0, 0);
  audioCtx.lineTo(xEndPos, 0);
  audioCtx.strokeStyle = gradient;
  audioCtx.stroke();
  audioCtx.closePath();
}

export function getSightAverage(totalEyeCount, passedEyeCount) {
  if (totalEyeCount === 0) {
    return 0;
  }

  return Number(totalEyeCount) === 0 ? 0 : passedEyeCount / totalEyeCount;
}

export function getSightPassCount(workerResult) {
  let passedEyeCount = 0;
  const faces = workerResult.faces || [];
  faces.forEach(face => {
    const eyesCount = Math.round(face.eyesPos.length / EYE_GROUP_LEN);
    let ratio = 0;
    for (let i = 0; i < eyesCount; i++) {
      const startIndex = i * EYE_GROUP_LEN;
      const eyePos = face.eyesPos.slice(startIndex, startIndex + EYE_GROUP_LEN);

      const ey1 = eyePos[1];
      const ey2 = eyePos[3];
      const ey3 = eyePos[9];

      const ex1 = eyePos[4];
      const ex2 = eyePos[6];
      const ex3 = eyePos[8];

      const horizontalRatio = Math.abs(((ey1 + ey2) / 2 - ey3) / (ey1 - ey2));
      const verticalRatio = Math.abs(((ex1 + ex2) / 2 - ex3) / (ex1 - ex2));
      const sightRatio = horizontalRatio + verticalRatio;
      ratio += sightRatio;
    }
    ratio /= eyesCount;
    if (ratio < 0.035) {
      passedEyeCount += 1;
    }
  });
  return passedEyeCount;
}

export function drawFaceCanvas(
  videoCtx,
  output,
  videoCtxWidth,
  videoCtxHeight
) {
  const { hands, faces } = output;
  videoCtx.clearRect(0, 0, videoCtxWidth, videoCtxHeight);

  const sightAverage = getSightAverage(faces.length, getSightPassCount(output));
  const showSight = sightAverage > 0.2;
  faces.forEach(face => {
    const { faceRate, facePos } = face;

    // draw face border
    if (faceRate > 0.3) {
      const [x1, y1, x2, y2] = facePos;
      drawFaceBorder(videoCtx, x1, y1, x2, y2, 3, 'face');
    }

    if (showSight) {
      const offset = 0;
      // draw eyes border
      const { eyesPos } = face;

      const ex1 = eyesPos[4] - offset;
      const ey1 = eyesPos[1] - offset;
      const ex4 = eyesPos[16] + offset;
      const ey4 = eyesPos[13] + offset;
      drawFaceBorder(videoCtx, ex1, ey1, ex4, ey4, 3, 'eye');
    }

    const { mouthPos } = face;
    const mx1 = mouthPos[0];
    const my1 = mouthPos[7];
    const mx2 = mouthPos[12];
    const my2 = mouthPos[19];
    if (face.smileRate >= 0.4) {
      drawFaceBorder(videoCtx, mx1, my1, mx2, my2, 3, 'mouth');
    }
  });

  hands.forEach(hand => {
    const [x1, y1, x2, y2] = hand.handPos;
    drawFaceBorder(videoCtx, x1, y1, x2, y2, 3, 'hand');
  });
}

export function drawFaceBorder(
  videoCtx,
  xPos,
  yPos,
  x2Pos,
  y2Pos,
  lineWidth,
  type = 'face'
) {
  const { color: lineColor, pointColor } = CANVAS_PALETTE[type];

  xPos *= SCALE_RATIO;
  yPos *= SCALE_RATIO;

  x2Pos *= SCALE_RATIO;
  y2Pos *= SCALE_RATIO;

  drawRectBorder(
    videoCtx,
    xPos,
    yPos,
    x2Pos,
    y2Pos,
    lineWidth,
    lineColor,
    pointColor
  );
}

export function drawRectBorder(
  videoCtx,
  xPos,
  yPos,
  x2Pos,
  y2Pos,
  lineWidth,
  lineColor,
  pointColor
) {
  videoCtx.lineWidth = lineWidth; // 设置线条宽度

  drawLine(videoCtx, xPos, yPos, xPos, y2Pos, lineColor, pointColor);
  drawLine(videoCtx, xPos, y2Pos, x2Pos, y2Pos, lineColor, pointColor);
  drawLine(videoCtx, x2Pos, y2Pos, x2Pos, yPos, lineColor, pointColor);
  drawLine(videoCtx, x2Pos, yPos, xPos, yPos, lineColor, pointColor);

  videoCtx.closePath();
}

export function drawLine(
  videoCtx,
  xStartPos,
  yStartPos,
  xEndPos,
  yEndPos,
  lineColor,
  pointColor
) {
  drawStartPoint(videoCtx, xStartPos, yStartPos, pointColor, 2);
  drawGradientLine(videoCtx, xStartPos, yStartPos, xEndPos, yEndPos, lineColor);
}

export function drawGradientLine(
  videoCtx,
  xStartPos,
  yStartPos,
  xEndPos,
  yEndPos,
  lineColor
) {
  const gradient = videoCtx.createLinearGradient(
    xStartPos,
    yStartPos,
    xEndPos,
    yEndPos
  );

  gradient.addColorStop(0, lineColor);
  gradient.addColorStop(0.8, `${lineColor}88`);
  gradient.addColorStop(1, `${lineColor}00`);

  videoCtx.beginPath();
  videoCtx.moveTo(xStartPos, yStartPos);
  videoCtx.lineTo(xEndPos, yEndPos);
  videoCtx.strokeStyle = gradient;
  videoCtx.stroke();
}

export function drawStartPoint(videoCtx, x, y, color, radius) {
  videoCtx.fillStyle = color;

  videoCtx.beginPath();
  videoCtx.arc(x, y, radius, 0, 2 * Math.PI);
  videoCtx.fill();
  videoCtx.closePath();
}

export function getPredictImageDataFromVideoElement({
  ctx,
  videoElement,
  videoWidth,
  videoHeight,
  predictSize
}) {
  ctx.clearRect(0, 0, predictSize, predictSize);
  ctx.save();
  ctx.translate(predictSize, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    videoElement,
    0,
    0,
    videoWidth,
    videoHeight,
    0,
    0,
    predictSize,
    (predictSize * videoHeight) / videoWidth
  );
  ctx.restore();

  const imageData = ctx.getImageData(0, 0, predictSize, predictSize);
  const imageDataBuffer = imageData.data.buffer;
  const imageWidth = imageData.width;
  const imageHeight = imageData.height;

  return {
    id: makeId(4),
    buffer: imageDataBuffer,
    width: imageWidth,
    height: imageHeight
  };
}

export function getPreviewImageDataFromVideoElement({
  id,
  videoElement,
  videoWidth,
  videoHeight,
  width = 640,
  height = 360,
  previewCanvasCtx
}) {
  previewCanvasCtx.clearRect(0, 0, width, height);
  previewCanvasCtx.save();
  previewCanvasCtx.translate(width, 0);
  previewCanvasCtx.scale(-1, 1);
  previewCanvasCtx.drawImage(
    videoElement,
    0,
    0,
    videoWidth,
    videoHeight,
    0,
    0,
    width,
    height
  );
  previewCanvasCtx.restore();

  const previewImageData = previewCanvasCtx.getImageData(0, 0, width, height);

  return {
    id,
    previewImageData
  };
}
